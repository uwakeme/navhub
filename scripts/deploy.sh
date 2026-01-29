#!/bin/bash

# ============================================
# NavHub 部署脚本
# 用于 EdgeOne Pages / Vercel 部署
# ============================================

set -e  # 遇到错误立即退出

echo "🚀 开始部署 NavHub..."
echo ""

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "❌ 错误: DATABASE_URL 未设置"
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "❌ 错误: AUTH_SECRET 未设置"
  exit 1
fi

if [ -z "$AUTH_GITHUB_ID" ]; then
  echo "❌ 错误: AUTH_GITHUB_ID 未设置"
  exit 1
fi

if [ -z "$AUTH_GITHUB_SECRET" ]; then
  echo "❌ 错误: AUTH_GITHUB_SECRET 未设置"
  exit 1
fi

echo "✅ 环境变量检查通过"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production
echo ""

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate
echo ""

# 运行数据库迁移
echo "🗄️  运行数据库迁移..."
npx prisma migrate deploy
echo ""

# 初始化数据（如果需要）
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 初始化数据库数据..."
  npm run db:seed
  echo ""
fi

# 构建 Next.js 应用
echo "🔨 构建应用..."
npm run build
echo ""

echo "✅ 部署完成！"
echo ""
echo "📋 部署信息:"
echo "   - 框架: Next.js 16"
echo "   - 数据库: PostgreSQL"
echo "   - 认证: NextAuth.js + GitHub"
echo "   - 国际化: next-intl (中英文)"
echo ""
echo "🎉 你的 NavHub 已准备就绪！"
