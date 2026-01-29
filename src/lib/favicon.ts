/**
 * Favicon 获取工具函数
 * 支持多服务轮询，优先使用国内服务，失败时尝试其他服务
 */

/**
 * Favicon 服务配置
 */
interface FaviconService {
  name: string
  url: (domain: string) => string
  priority: number // 优先级，数字越小越优先
}

/**
 * Favicon 服务列表
 * 按优先级排序，优先使用国内服务
 */
const FAVICON_SERVICES: FaviconService[] = [
  {
    name: 'Cravatar',
    url: (domain) => `https://cn.cravatar.com/favicon/api/index.php?url=${domain}`,
    priority: 1,
  },
  {
    name: 'favicon.vip',
    url: (domain) => `https://api.favicon.vip/?url=${domain}`,
    priority: 2,
  },
  {
    name: 'Google S2',
    url: (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    priority: 3,
  },
  {
    name: 'Google gstatic',
    url: (domain) => `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=128`,
    priority: 4,
  },
]

/**
 * 获取网站图标的默认超时时间（毫秒）
 */
const FETCH_TIMEOUT = 5000

/**
 * 验证 URL 是否可访问
 */
async function validateFaviconUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NavHub/1.0',
      },
    })

    clearTimeout(timeout)

    // 检查响应状态和内容类型
    const contentType = response.headers.get('content-type')
    const isImage = contentType ? contentType.startsWith('image/') : false
    
    return response.ok && isImage
  } catch (error) {
    console.debug(`[Favicon] Validation failed for ${url}:`, error)
    return false
  }
}

/**
 * 从多个服务轮询获取网站图标
 * 
 * @param domain - 网站域名（例如：example.com）
 * @returns 成功获取的图标 URL，如果所有服务都失败则返回 null
 * 
 * @example
 * ```typescript
 * const favicon = await getFavicon('example.com')
 * // 返回: 'https://cn.cravatar.com/favicon/api/index.php?url=example.com'
 * ```
 */
export async function getFavicon(domain: string): Promise<string | null> {
  // 按优先级排序服务
  const sortedServices = [...FAVICON_SERVICES].sort((a, b) => a.priority - b.priority)

  for (const service of sortedServices) {
    const faviconUrl = service.url(domain)
    
    console.debug(`[Favicon] Trying ${service.name}: ${faviconUrl}`)
    
    try {
      const isValid = await validateFaviconUrl(faviconUrl)
      
      if (isValid) {
        console.debug(`[Favicon] Success with ${service.name}: ${faviconUrl}`)
        return faviconUrl
      }
    } catch (error) {
      console.debug(`[Favicon] ${service.name} failed:`, error)
      continue
    }
  }

  console.warn(`[Favicon] All services failed for domain: ${domain}`)
  return null
}

/**
 * 从 URL 提取域名
 * 
 * @param url - 完整的 URL
 * @returns 域名（例如：example.com）
 * 
 * @example
 * ```typescript
 * extractDomain('https://www.example.com/path/to/page')
 * // 返回: 'www.example.com'
 * ```
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    console.error('Invalid URL:', url)
    throw new Error('Invalid URL format')
  }
}

/**
 * 获取网站图标的完整流程
 * 
 * @param url - 完整的网站 URL
 * @returns 图标 URL，如果获取失败则返回 null
 * 
 * @example
 * ```typescript
 * const favicon = await getFaviconFromUrl('https://www.example.com')
 * // 返回: 'https://cn.cravatar.com/favicon/api/index.php?url=www.example.com'
 * ```
 */
export async function getFaviconFromUrl(url: string): Promise<string | null> {
  try {
    const domain = extractDomain(url)
    return await getFavicon(domain)
  } catch (error) {
    console.error('[Favicon] Failed to get favicon from URL:', error)
    return null
  }
}
