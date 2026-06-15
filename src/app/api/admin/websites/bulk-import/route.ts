export const runtime = 'nodejs'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getFaviconFromUrl } from '@/lib/favicon'
import { normalizeUrl } from '@/lib/bookmarks'

/**
 * Admin: 批量导入已确认的网站
 *
 * Body:
 *   {
 *     items: Array<{
 *       url: string             // 必填
 *       title: string           // 必填
 *       description?: string
 *       categoryId: string      // 必填
 *       featured?: boolean
 *     }>
 *   }
 *
 * 设计:
 *   - 直接 APPROVED(管理员导入即上架)
 *   - 同一个请求内的 url 也会先去重(防止用户重复勾选)
 *   - 已存在的 url 走"更新"分支(更新 title/description/featured/categoryId),保留 clicks/favorites
 *     用户在预览阶段可单条删除已存在的,我们只更新还留下的
 *   - 限制单次最多 200 条,防滥用
 */
const MAX_ITEMS = 200

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const items = Array.isArray(body?.items) ? body.items : []
    if (items.length === 0) {
      return new NextResponse('No items provided', { status: 400 })
    }
    if (items.length > MAX_ITEMS) {
      return new NextResponse(`Too many items (max ${MAX_ITEMS})`, { status: 400 })
    }

    // 1. 基础字段校验 + 归一化
    type Cleaned = {
      url: string
      normalized: string
      title: string
      description: string | null
      categoryId: string
      featured: boolean
    }
    const cleaned: Cleaned[] = []
    const seenNorm = new Set<string>()
    for (const raw of items) {
      const url = typeof raw?.url === 'string' ? raw.url.trim() : ''
      const title = typeof raw?.title === 'string' ? raw.title.trim() : ''
      const categoryId = typeof raw?.categoryId === 'string' ? raw.categoryId.trim() : ''
      if (!url || !title || !categoryId) continue
      try {
        // 必须形如 http(s)://...
        new URL(url)
      } catch {
        continue
      }
      const normalized = normalizeUrl(url)
      if (seenNorm.has(normalized)) continue
      seenNorm.add(normalized)
      cleaned.push({
        url,
        normalized,
        title,
        description: typeof raw?.description === 'string' && raw.description.trim() ? raw.description.trim() : null,
        categoryId,
        featured: !!raw?.featured,
      })
    }

    if (cleaned.length === 0) {
      return new NextResponse('No valid items', { status: 400 })
    }

    // 2. 校验 categoryId 全部存在
    const categoryIds = Array.from(new Set(cleaned.map((c) => c.categoryId)))
    const validCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    })
    const validCategoryIds = new Set(validCategories.map((c) => c.id))
    const validItems = cleaned.filter((c) => validCategoryIds.has(c.categoryId))
    if (validItems.length === 0) {
      return new NextResponse('No valid categories', { status: 400 })
    }

    // 3. 查重:用 normalized 比对,但数据库存的是原始 url
    //    这里直接用 url 字段查 Prisma,因为 normalize 是函数式的,做一层 or 查
    //    简化:对每条 cleaned.url 直接 findUnique 看是否存在
    const urls = validItems.map((c) => c.url)
    const existing = await prisma.website.findMany({
      where: { url: { in: urls } },
      select: { id: true, url: true, clicks: true, favorites: { select: { id: true } } },
    })
    const existingByUrl = new Map(existing.map((e) => [e.url, e]))

    // 4. 分流:存在的更新,不存在的新建
    const toCreate: Prisma.WebsiteCreateManyInput[] = []
    const toUpdate: Array<{ id: string; data: Prisma.WebsiteUpdateInput }> = []
    for (const item of validItems) {
      const ex = existingByUrl.get(item.url)
      if (ex) {
        toUpdate.push({
          id: ex.id,
          data: {
            title: item.title,
            description: item.description,
            category: { connect: { id: item.categoryId } },
            featured: item.featured,
            status: 'APPROVED',
          },
        })
      } else {
        toCreate.push({
          title: item.title,
          url: item.url,
          description: item.description,
          categoryId: item.categoryId,
          featured: item.featured,
          status: 'APPROVED',
          submittedById: session.user.id,
        })
      }
    }

    // 5. 入库
    let created = 0
    let updated = 0
    if (toCreate.length > 0) {
      // Prisma 不支持单条 SQLite 事务内的 createMany with skipDuplicates 的回写 affected
      // 这里我们用 createMany 一次性写
      const result = await prisma.website.createMany({
        data: toCreate,
        skipDuplicates: true,
      })
      created = result.count
    }
    // 更新走事务串行,简单稳
    for (const u of toUpdate) {
      await prisma.website.update({ where: { id: u.id }, data: u.data })
      updated++
    }

    // 6. 异步拉取 favicon(后台 fire-and-forget,不阻塞响应)
    //    对刚创建成功的站点拉,失败的留 null
    if (created > 0) {
      // 找出刚创建的 url
      const justCreated = toCreate.map((c) => c.url)
      ;(async () => {
        for (const url of justCreated) {
          try {
            const favicon = await getFaviconFromUrl(url)
            if (favicon) {
              await prisma.website.updateMany({
                where: { url, favicon: null },
                data: { favicon },
              })
            }
          } catch (err) {
            console.error('[bulk-import] favicon fetch failed for', url, err)
          }
        }
      })().catch((err) => console.error('[bulk-import] favicon worker crashed', err))
    }

    return NextResponse.json({
      created,
      updated,
      skipped: cleaned.length - validItems.length,
      total: validItems.length,
    })
  } catch (error) {
    console.error('Admin bulk import error:', error)
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return new NextResponse('Invalid category', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
