export const runtime = 'nodejs'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * Admin: 批量查询 URL 是否已存在
 *
 * POST body: { urls: string[] }
 * Response: {
 *   existing: Array<{ url: string, id: string, title: string, status: string, categoryId: string }>
 * }
 *
 * 用途:批量导入预览阶段,前端用这个接口给"已存在"的行打标。
 * 限制 500 条以防滥用。
 */
const MAX_URLS = 500

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const urls = Array.isArray(body?.urls) ? body.urls : []
    if (urls.length === 0) {
      return NextResponse.json({ existing: [] })
    }
    if (urls.length > MAX_URLS) {
      return new NextResponse(`Too many urls (max ${MAX_URLS})`, { status: 400 })
    }

    const cleanUrls: string[] = Array.from(
      new Set(urls.filter((u: unknown): u is string => typeof u === 'string' && u.trim().length > 0))
    )
    if (cleanUrls.length === 0) {
      return NextResponse.json({ existing: [] })
    }

    const found = await prisma.website.findMany({
      where: { url: { in: cleanUrls } },
      select: { id: true, url: true, title: true, status: true, categoryId: true },
    })
    return NextResponse.json({ existing: found })
  } catch (error) {
    console.error('Admin bulk-check error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
