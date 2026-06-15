/**
 * 浏览器导出的书签 HTML 解析器
 *
 * 支持标准 Netscape Bookmark File Format(Chrome / Edge / Firefox / Safari 都用这个格式导出)。
 * 例:
 *   <DT><H3>AI 工具</H3>
 *   <DL><p>
 *     <DT><A HREF="https://example.com" ADD_DATE="...">Example</A>
 *     <DT><A HREF="https://foo.com">Foo</A>
 *   </DL><p>
 *
 * 实现:不依赖任何 DOM 库,用纯字符串扫描 + 状态机还原层级关系。
 * 对书签这种格式来说,DOM 解析是过度设计 —— 直接 token 流更鲁棒、更快。
 */

export interface ParsedBookmark {
  /** 来自 <A> 元素的 href,未做归一化 */
  url: string
  /** 来自 <A> 元素的文本(title) */
  title: string
  /** 所在文件夹路径(从根到直接父目录),如 ["Bookmarks bar", "AI 工具"] */
  folders: string[]
  /** 原始 ADD_DATE 时间戳(秒),无则 undefined */
  addDate?: number
  /** 原始 ICON / ICON_URI 属性,无则 undefined */
  icon?: string
}

export interface ParseResult {
  bookmarks: ParsedBookmark[]
  /** 文件里有多少个 <A> 元素(可能包含 javascript:/about: 等无效链接) */
  total: number
  /** 被跳过的无效条目数 */
  skipped: number
}

/**
 * 判断一个 URL 是不是值得入库的有效网页链接
 * 过滤掉:javascript:, about:, chrome:, edge:, file:, data:, mailto:, tel: 等
 * 也过滤掉空字符串和明显没有 host 的相对链接
 */
export function isValidBookmarkUrl(rawUrl: string): boolean {
  if (!rawUrl) return false
  const trimmed = rawUrl.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  const blockedSchemes = [
    'javascript:',
    'about:',
    'chrome:',
    'chrome-extension:',
    'edge:',
    'moz-extension:',
    'file:',
    'data:',
    'mailto:',
    'tel:',
    'sms:',
    'ftp:',
    'place:',
    'view-source:',
  ]
  for (const s of blockedSchemes) {
    if (lower.startsWith(s)) return false
  }
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return false
  }
  try {
    const u = new URL(trimmed)
    if (!u.hostname || u.hostname.indexOf('.') === -1) return false
    return true
  } catch {
    return false
  }
}

/**
 * 从属性字符串里提取某个属性的值
 * 支持带引号和不带引号,如 HREF="x" 或 HREF=x
 */
function extractAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const m = re.exec(attrs)
  if (!m) return null
  return m[1] ?? m[2] ?? m[3] ?? null
}

/**
 * 解码 HTML 实体。书签文件里 title 经常出现 &amp; &quot; 等
 */
function decodeEntities(s: string): string {
  if (s.indexOf('&') === -1) return s
  return s
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number.parseInt(n, 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
      const code = Number.parseInt(n, 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _
    })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * 解析浏览器导出的书签 HTML 字符串(纯字符串/正则实现,不依赖 DOM 库)
 *
 * 状态机:
 *  - 维护 folderStack(目录路径栈)和 dlPendingNames(每个 DL 块对应的目录名,出栈时校验)
 *  - 扫到 <H3>...</H3> 时记下 pendingH3
 *  - 扫到 <DL> 时,如果 pendingH3 存在就压栈,记入 dlPendingNames
 *  - 扫到 <A HREF="...">title</A> 时,把当前 folderStack 拍成 folders,提交一个书签
 */
export function parseBookmarksHTML(html: string): ParseResult {
  const bookmarks: ParsedBookmark[] = []
  let total = 0
  let skipped = 0

  const folderStack: string[] = []
  const dlPendingNames: Array<string | null> = []

  // 状态
  let inH3 = false
  let h3Buf = ''
  let inA = false
  let aBuf = ''
  let aHref = ''
  let aAddDate: number | undefined
  let aIcon: string | undefined
  let pendingH3: string | null = null

  // 匹配开/闭标签
  // 注意:tag 名匹配用 [A-Za-z][A-Za-z0-9]* 但为了"完整"二字符合并到 attrs,
  // 改成 ([A-Za-z][A-Za-z0-9]*),attrs 部分再取回数字
  const tagRe = /<(\/?)([A-Za-z][A-Za-z0-9]*)([^>]*?)(\/?)>/g
  let cursor = 0
  let m: RegExpExecArray | null

  while ((m = tagRe.exec(html)) !== null) {
    const textBetween = html.slice(cursor, m.index)
    cursor = m.index + m[0].length

    const isClose = m[1] === '/'
    const tag = m[2].toUpperCase()
    const attrs = m[3] || ''

    // 处理标签之间的纯文本(累计到当前 H3/A 缓冲区)
    if (textBetween.length > 0) {
      if (inH3) h3Buf += textBetween
      if (inA) aBuf += textBetween
    }

    if (tag === 'P') {
      // 浏览器导出的书签里 <P> 一般是 <DL><p> 里的空标记,忽略
      continue
    }

    if (isClose) {
      if (tag === 'H3') {
        if (inH3) {
          pendingH3 = decodeEntities(h3Buf).trim() || null
        }
        inH3 = false
        h3Buf = ''
      } else if (tag === 'A') {
        if (inA) {
          total++
          if (isValidBookmarkUrl(aHref)) {
            bookmarks.push({
              url: aHref.trim(),
              title: decodeEntities(aBuf).trim() || aHref.trim(),
              folders: [...folderStack],
              addDate: aAddDate,
              icon: aIcon,
            })
          } else {
            skipped++
          }
        }
        inA = false
        aBuf = ''
        aHref = ''
        aAddDate = undefined
        aIcon = undefined
      } else if (tag === 'DL') {
        const pushed = dlPendingNames.pop()
        if (pushed && folderStack[folderStack.length - 1] === pushed) {
          folderStack.pop()
        }
      }
      // </DT> 不需要特别处理
      continue
    }

    // 开启标签
    if (tag === 'H3') {
      inH3 = true
      h3Buf = ''
    } else if (tag === 'A') {
      inA = true
      aBuf = ''
      aHref = extractAttr(attrs, 'href') || extractAttr(attrs, 'HREF') || ''
      const addDateRaw = extractAttr(attrs, 'add_date') || extractAttr(attrs, 'ADD_DATE')
      const iconRaw =
        extractAttr(attrs, 'icon') ||
        extractAttr(attrs, 'ICON') ||
        extractAttr(attrs, 'ICON_URI')
      aAddDate = addDateRaw ? Number.parseInt(addDateRaw, 10) : undefined
      aIcon = iconRaw || undefined
    } else if (tag === 'DL') {
      // 进入 DL:上一个 DT 留下的 pendingH3 对应这个目录
      if (pendingH3 !== null) {
        folderStack.push(pendingH3)
        dlPendingNames.push(pendingH3)
        pendingH3 = null
      } else {
        dlPendingNames.push(null)
      }
    } else if (tag === 'DT') {
      // 新 DT 开始,清掉可能残留的 pendingH3(孤立的 H3)
      pendingH3 = null
    }
  }

  return { bookmarks, total, skipped }
}

/**
 * 归一化 URL,用于去重比较
 * - 去掉尾部斜杠
 * - 统一小写 host
 * - 去掉常见 tracking 参数(utm_*, fbclid, gclid)
 * - 去掉 hash
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl)
    const host = u.hostname.toLowerCase()
    let pathname = u.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    const params = new URLSearchParams(u.search)
    const cleaned = new URLSearchParams()
    for (const [k, v] of params) {
      if (/^utm_/i.test(k)) continue
      if (/^fbclid$/i.test(k)) continue
      if (/^gclid$/i.test(k)) continue
      if (/^ref(_|$)/i.test(k)) continue
      cleaned.append(k, v)
    }
    const qs = cleaned.toString()
    return `${u.protocol}//${host}${pathname}${qs ? `?${qs}` : ''}`
  } catch {
    return rawUrl
  }
}

/**
 * 从浏览器书签 title 里清洗出更友好的标题
 * - 去除前后空白
 * - 折叠中间多余空白
 * - 截断超长标题
 */
export function cleanTitle(raw: string, maxLength = 80): string {
  const t = raw.replace(/\s+/g, ' ').trim()
  if (t.length <= maxLength) return t
  return t.slice(0, maxLength - 1) + '…'
}
