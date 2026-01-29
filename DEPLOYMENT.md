# NavHub 部署指南

本指南将帮助你将 NavHub 部署到 **腾讯云 EdgeOne Pages**（国内免费部署平台）。

## 📋 目录

1. [准备工作](#1-准备工作)
2. [配置 Supabase 数据库](#2-配置-supabase-数据库)
3. [配置 GitHub OAuth](#3-配置-github-oauth)
4. [部署到 EdgeOne Pages](#4-部署到-edgeone-pages)
5. [常见问题](#5-常见问题)

---

## 1. 准备工作

### 1.1 安装依赖

```bash
npm install
```

### 1.2 初始化 Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### 1.3 推送到 GitHub

```bash
# 在 GitHub 创建新仓库
git remote add origin https://github.com/你的用户名/navhub.git
git push -u origin main
```

---

## 2. 配置 Supabase 数据库

### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 使用 GitHub 账号登录
3. 点击 **"New Project"**
4. 填写项目信息:
   - **Project Name**: `navhub` (或其他名称)
   - **Region**: 选择离你近的地区（推荐 `ap-northeast-1` 东京）
   - **Database Password**: 设置一个强密码（记住它！）
5. 点击 **"Create new project"**（等待 2-3 分钟）

### 2.2 获取数据库连接字符串

1. 项目创建完成后，进入 **"Project Settings"**
2. 点击左侧 **"Database"**
3. 在 **"Connection string"** 部分
4. 选择 **"URI"** 格式
5. 复制连接字符串，格式如下:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

### 2.3 配置本地环境变量

创建 `.env` 文件（基于 `.env.example`）:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```env
# 数据库配置 - 替换为你的 Supabase 连接字符串
DATABASE_URL="postgresql://postgres:your-password@db.xxxxxx.supabase.co:5432/postgres"

# NextAuth 配置
AUTH_SECRET="your-random-secret-key"  # 用 openssl rand -base64 32 生成
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### 2.4 生成数据库表

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 初始化数据（创建默认分类和管理员）
npm run db:seed
```

---

## 3. 配置 GitHub OAuth

### 3.1 创建 GitHub OAuth App

1. 访问 [https://github.com/settings/developers](https://github.com/settings/developers)
2. 点击 **"New OAuth App"**
3. 填写应用信息:

   **Application name**: `NavHub`

   **Homepage URL**: `https://your-app.edgeone.app`  
   *(部署后会获得这个域名，暂时可以先填 `http://localhost:3000`)*

   **Authorization callback URL**:  
   - 开发环境: `http://localhost:3000/api/auth/callback/github`
   - 生产环境: `https://your-app.edgeone.app/api/auth/callback/github`

4. 点击 **"Register application"**

### 3.2 获取 GitHub 凭证

创建成功后，你会看到:

- **Client ID**: 复制这个值
- 点击 **"Generate a new client secret"**
- **Client Secret**: 复制这个值

### 3.3 更新环境变量

将获取的值填入 `.env` 文件:

```env
AUTH_GITHUB_ID="ghp_xxxxxxxxxxxxxxxxxxxx"
AUTH_GITHUB_SECRET="ghc_xxxxxxxxxxxxxxxxxxxx"
```

---

## 4. 部署到 EdgeOne Pages

### 4.1 访问 EdgeOne Pages

1. 打开 [https://pages.edgeone.ai](https://pages.edgeone.ai)
2. 使用腾讯云账号登录（如果没有，需要先注册）

### 4.2 导入 GitHub 仓库

1. 点击 **"导入 Git 仓库"**
2. 授权访问你的 GitHub 账号
3. 选择你的 `navhub` 仓库
4. 点击 **"开始部署"**

### 4.3 配置环境变量

在部署配置页面，找到 **"环境变量"** 部分，添加以下变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres` | Supabase 数据库连接字符串 |
| `AUTH_SECRET` | `your-random-secret-key` | 随机生成的密钥 |
| `AUTH_GITHUB_ID` | `ghp_xxxxxxxxxxxx` | GitHub Client ID |
| `AUTH_GITHUB_SECRET` | `ghc_xxxxxxxxxxxx` | GitHub Client Secret |

### 4.4 配置构建命令

在 **"构建设置"** 中配置:

- **构建命令**: `npx prisma generate && npm run build`
- **输出目录**: `.next`
- **安装命令**: `npm install`

### 4.5 部署

点击 **"部署"** 按钮，等待构建完成（通常需要 2-5 分钟）。

部署成功后，你会获得一个域名，格式如: `https://your-app.edgeone.app`

### 4.6 配置 GitHub OAuth 回调 URL

**重要**: 部署完成后，需要更新 GitHub OAuth App 的回调 URL:

1. 访问 [https://github.com/settings/developers](https://github.com/settings/developers)
2. 找到你的 OAuth App
3. 点击 **"Edit"**
4. 更新 **Authorization callback URL**:
   ```
   https://your-app.edgeone.app/api/auth/callback/github
   ```
5. 点击 **"Update application"**

### 4.7 重新部署

为了使 GitHub OAuth 配置生效，需要重新部署:

1. 在 EdgeOne Pages 控制台
2. 点击 **"重新部署"**
3. 等待部署完成

---

## 5. 常见问题

### 5.1 数据库迁移失败

**问题**: `PrismaClientInitializationError`

**解决**: 检查 `DATABASE_URL` 是否正确，确保:
- 密码正确
- IP 白名单（Supabase 默认允许所有 IP）
- 端口 5432 可访问

### 5.2 GitHub 登录失败

**问题**: `Invalid OAuth configuration`

**解决**: 
1. 检查 `AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET` 是否正确
2. 确认 GitHub OAuth 回调 URL 配置正确
3. 确保重新部署后配置生效

### 5.3 构建超时

**问题**: EdgeOne Pages 构建超时

**解决**: 
1. 在 EdgeOne Pages 设置中增加构建超时时间
2. 或者优化构建过程，减少依赖

### 5.4 数据库连接超时

**问题**: 数据库连接失败或超时

**解决**: 
1. 检查 Supabase 项目是否在运行
2. 确认数据库连接字符串格式正确
3. 尝试在 Supabase 控制台测试连接

---

## 6. 后续维护

### 6.1 更新代码

```bash
git add .
git commit -m "Update: your changes"
git push origin main
```

EdgeOne Pages 会自动检测到代码更新并重新部署。

### 6.2 查看日志

在 EdgeOne Pages 控制台:
- 进入你的项目
- 点击 **"部署日志"**
- 查看构建和运行日志

### 6.3 管理数据库

使用 Supabase 控制台:
- **Table Editor**: 查看和编辑数据
- **SQL Editor**: 执行自定义 SQL
- **Authentication**: 管理用户

---

## 7. 成本估算

### 完全免费方案

| 服务 | 免费额度 | 适合场景 |
|------|---------|---------|
| **EdgeOne Pages** | 无限部署，免费域名 | 个人项目、学习 |
| **Supabase** | 500MB 存储，1GB 带宽/月 | 小型项目 |
| **GitHub** | 无限公开仓库 | 代码托管 |

**总成本**: **¥0/月** ✅

### 付费升级（可选）

如果项目增长，可以考虑:

- **Supabase Pro**: $25/月（更多存储和带宽）
- **EdgeOne Pages 付费版**: 更多功能
- **自定义域名**: 需要域名注册费用（约 ¥60/年）

---

## 8. 技术支持

### 官方文档

- **EdgeOne Pages**: https://pages.edgeone.ai/docs
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

### 社区支持

- **GitHub Issues**: 在项目仓库提交 Issue
- **Discord**: 加入相关技术社区
- **Stack Overflow**: 搜索相关问题

---

## 9. 总结

完成以上步骤后，你的 NavHub 将成功部署到国内可访问的免费平台！

**主要优势**:
- ✅ 国内访问速度快
- ✅ 完全免费
- ✅ 自动部署
- ✅ 支持 GitHub OAuth 登录
- ✅ 数据库稳定可靠

**下次更新代码时**，只需:
```bash
git push origin main
```

EdgeOne Pages 会自动重新部署！🚀

---

**祝部署顺利！** 🎉

如有问题，请查看 [常见问题](#5-常见问题) 或提交 Issue。
