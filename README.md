# NavHub - 开发者导航主页

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

NavHub 是一个开发者导航主页，用于发现、分享和组织最佳开发者工具和资源。

## ✨ 功能特性

- 🔍 **搜索** - 快速搜索所有资源
- 📂 **分类** - 按类别浏览（AI、开源、开发者工具等）
- ❤️ **收藏** - 保存你喜欢的工具
- 📤 **提交** - 用户可提交新网站（需审核）
- 👑 **管理后台** - 管理员可审核和管理网站
- 🌐 **国际化** - 支持中英文双语
- 🔐 **认证** - GitHub OAuth 登录
- ⬆️ **回到顶部** - 便捷的回到顶部按钮
- 📄 **免责声明** - 首次访问显示使用条款
- 🤖 **自动获取** - 提交网站时自动获取标题和描述

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **数据库**: PostgreSQL (推荐 Supabase)
- **ORM**: Prisma
- **认证**: NextAuth.js v5
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **国际化**: next-intl
- **表单**: React Hook Form + Zod
- **提示**: Sonner Toast

## 📁 项目结构

```
navigation_homepage/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # i18n 路由 (en, zh)
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── layout.tsx     # 根布局
│   │   │   ├── admin/         # 管理后台
│   │   │   ├── auth/          # 认证页面
│   │   │   ├── favorites/     # 收藏页面
│   │   │   └── submit/        # 提交页面
│   │   └── api/               # API 路由
│   │       ├── admin/         # 管理员接口
│   │       ├── auth/          # 认证接口
│   │       ├── favorites/     # 收藏接口
│   │       ├── websites/      # 网站接口
│   │       └── websites/metadata/  # 网站元数据获取
│   ├── components/            # React 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── layout/            # 布局组件
│   │   ├── back-to-top.tsx    # 回到顶部按钮
│   │   ├── disclaimer-modal.tsx  # 免责声明弹窗
│   │   ├── submit-form.tsx    # 提交表单
│   │   └── website-card.tsx   # 网站卡片
│   ├── generated/             # Prisma 生成的客户端
│   ├── i18n/                  # 国际化配置
│   ├── lib/                   # 工具函数
│   └── types/                 # TypeScript 类型
├── prisma/                    # Prisma 配置
│   ├── schema.prisma         # 数据库 schema
│   └── seed.ts               # 数据库种子
├── scripts/                   # 脚本
│   ├── deploy.sh             # 部署脚本
│   └── promote-admin.ts      # 提升管理员权限
├── messages/                  # 翻译文件
│   ├── en.json               # 英文翻译
│   └── zh.json               # 中文翻译
├── .env.example              # 环境变量示例
├── vercel.json               # Vercel 配置
├── DEPLOYMENT.md             # 部署文档
└── README.md                 # 本文件
```

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 pnpm
- PostgreSQL 数据库（推荐 Supabase）

### 2. 本地开发

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd navigation_homepage

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接和 GitHub OAuth 信息

# 4. 初始化数据库
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 3. 提升为管理员

```bash
# 使用你的邮箱（GitHub 账号邮箱）
npx tsx scripts/promote-admin.ts your-email@example.com
```

## 🌍 国际化

项目支持中英文双语：

- **英文**: 默认语言
- **中文**: 通过语言切换器切换

翻译文件位于 `messages/` 目录。

## 📤 提交网站

1. 登录 GitHub 账号
2. 访问 `/submit` 页面
3. 填写网站信息：
   - **URL**: 网站链接（必填）
   - **标题**: 自动从网站获取或手动填写（必填）
   - **描述**: 可选，会自动从网站获取
   - **分类**: 选择分类（必填）
4. 点击提交，等待管理员审核

**自动获取功能**:
- 在 URL 输入框失去焦点时，自动从网站获取标题和描述
- 如果网站无法访问或没有元数据，可以手动填写

## 🔐 认证

### GitHub OAuth

1. 访问 [GitHub OAuth Apps](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 配置回调 URL:
   - 开发: `http://localhost:3000/api/auth/callback/github`
   - 生产: `https://your-domain.edgeone.app/api/auth/callback/github`
4. 获取 Client ID 和 Client Secret
5. 配置到环境变量

## 🗄️ 数据库

### 数据库迁移

```bash
# 开发环境
npx prisma migrate dev --name <migration-name>

# 生产环境
npx prisma migrate deploy

# 重置数据库（危险！）
npm run db:reset
```

### 数据库种子

```bash
npm run db:seed
```

## 🚀 部署

### 推荐方案：EdgeOne Pages + Supabase（完全免费）

详见 [DEPLOYMENT.md](DEPLOYMENT.md)

**快速步骤**:

1. **创建 Supabase 数据库**
   - 访问 https://supabase.com
   - 创建项目，获取数据库连接字符串

2. **配置 GitHub OAuth**
   - 访问 https://github.com/settings/developers
   - 创建 OAuth App，配置回调 URL

3. **部署到 EdgeOne Pages**
   - 访问 https://pages.edgeone.ai
   - 导入 GitHub 仓库
   - 配置环境变量
   - 一键部署

**成本**: **完全免费** ✅

### 其他部署平台

- **Vercel**: Next.js 官方推荐（国内访问较慢）
- **Railway**: 支持 PostgreSQL（需要科学上网）
- **自建服务器**: 阿里云/腾讯云轻量服务器（约 50-100 元/年）

## 📝 环境变量

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ | `postgresql://user:pass@host:5432/dbname` |
| `AUTH_SECRET` | NextAuth 密钥 | ✅ | `openssl rand -base64 32` 生成 |
| `AUTH_GITHUB_ID` | GitHub Client ID | ✅ | `ghp_xxxxxxxxxxxx` |
| `AUTH_GITHUB_SECRET` | GitHub Client Secret | ✅ | `ghc_xxxxxxxxxxxx` |

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 生产构建
npm run start            # 生产启动

# 代码质量
npm run lint             # ESLint 检查

# 数据库
npx prisma studio        # 打开 Prisma Studio
npx prisma generate      # 生成 Prisma 客户端
npm run db:seed          # 初始化数据
npm run db:reset         # 重置数据库

# 管理
npx tsx scripts/promote-admin.ts <email>  # 提升管理员
```

## 🎨 自定义

### 添加新分类

1. 编辑 `prisma/seed.ts`
2. 添加新的分类数据
3. 运行 `npm run db:seed`

### 修改主题

编辑 `src/app/globals.css` 和 `tailwind.config.ts`

### 添加新翻译

1. 编辑 `messages/en.json`
2. 编辑 `messages/zh.json`
3. 重启开发服务器

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请：
1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 部署文档
2. 提交 GitHub Issue
3. 查看相关文档：
   - [Next.js 文档](https://nextjs.org/docs)
   - [Prisma 文档](https://www.prisma.io/docs)
   - [Supabase 文档](https://supabase.com/docs)
   - [EdgeOne Pages 文档](https://pages.edgeone.ai/docs)

---

**祝使用愉快！** 🎉
