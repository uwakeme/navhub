# Favicon 获取服务说明

## 问题背景

之前项目使用 Google 的 `https://www.google.com/s2/favicons` 服务来获取网站图标，但在国内经常无法访问，导致图标获取失败。

## 解决方案

实现了**多服务轮询机制**，优先使用国内可用的服务，失败时自动尝试其他服务。

## 支持的服务

按优先级排序：

1. **Cravatar** (国内推荐)
   - API: `https://cn.cravatar.com/favicon/api/index.php?url=${domain}`
   - 优点: 国内服务器，速度快，完全免费
   - 官网: https://cravatar.com/developer/favicon-api

2. **favicon.vip** (国内推荐)
   - API: `https://api.favicon.vip/?url=${domain}`
   - 优点: 国内可用，免费公益服务
   - 官网: https://www.favicon.vip/

3. **Google S2** (备用)
   - API: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
   - 优点: 图标质量高，覆盖面广
   - 缺点: 国内访问不稳定

4. **Google gstatic** (备用)
   - API: `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=128`
   - 优点: Google 官方服务
   - 缺点: 国内访问不稳定

## 使用方法

### 1. 获取单个域名的图标

```typescript
import { getFavicon } from '@/lib/favicon'

const favicon = await getFavicon('example.com')
// 返回: 'https://cn.cravatar.com/favicon/api/index.php?url=example.com'
// 如果所有服务都失败，返回 null
```

### 2. 从完整 URL 获取图标

```typescript
import { getFaviconFromUrl } from '@/lib/favicon'

const favicon = await getFaviconFromUrl('https://www.example.com/path/to/page')
// 返回: 'https://cn.cravatar.com/favicon/api/index.php?url=www.example.com'
```

### 3. 提取域名

```typescript
import { extractDomain } from '@/lib/favicon'

const domain = extractDomain('https://www.example.com/path/to/page')
// 返回: 'www.example.com'
```

## 工作原理

1. **服务轮询**: 按优先级依次尝试每个服务
2. **验证检查**: 使用 HEAD 请求验证图标是否可访问
3. **超时控制**: 每个请求 5 秒超时
4. **自动降级**: 所有服务都失败时返回 null，前端显示首字母

## 修改的文件

### 1. 新增文件
- `src/lib/favicon.ts` - Favicon 获取工具函数

### 2. 修改的文件
- `src/app/api/websites/route.ts` - 提交网站时自动获取图标
- `prisma/seed.ts` - 种子数据使用新的图标获取逻辑
- `src/components/website-card.tsx` - 移除 Google 备用逻辑，优化错误处理

## 配置

如需修改服务优先级或添加新服务，编辑 `src/lib/favicon.ts`:

```typescript
const FAVICON_SERVICES: FaviconService[] = [
  {
    name: 'Cravatar',
    url: (domain) => `https://cn.cravatar.com/favicon/api/index.php?url=${domain}`,
    priority: 1,  // 数字越小越优先
  },
  // 添加新服务...
]
```

## 性能优化

- **缓存机制**: Cravatar 和 favicon.vip 都有服务端缓存
- **并发请求**: 可以扩展为并发请求多个服务，取第一个成功的
- **本地缓存**: 可以考虑添加 Redis 或数据库缓存，避免重复请求

## 错误处理

- 所有服务都失败时，返回 `null`
- 前端显示网站名称的首字母作为占位符
- 后端记录日志，便于排查问题

## 测试

```bash
# 测试图标获取
npm run dev

# 在浏览器中测试
# 1. 访问 /submit
# 2. 输入网站 URL
# 3. 检查控制台日志，查看图标获取过程
```

## 相关资源

- [Cravatar Favicon API 文档](https://cravatar.com/developer/favicon-api)
- [favicon.vip](https://www.favicon.vip/)
- [国内可用的图标服务对比](https://juejin.cn/post/7406269938008260635)

## 未来改进

1. **添加缓存**: 使用 Redis 缓存已获取的图标，减少重复请求
2. **并发优化**: 同时请求多个服务，取第一个成功的响应
3. **图标格式转换**: 支持 WebP、SVG 等现代格式
4. **本地 fallback**: 准备一套默认图标，完全不依赖外部服务
