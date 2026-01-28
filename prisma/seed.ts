import { PrismaClient } from '../src/generated/client/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:E:/projects/navigation_homepage/prisma/dev.db"
    }
  }
})

const categories = [
  { name: 'AI Tools', slug: 'ai-tools', description: 'Artificial Intelligence tools and platforms', icon: 'Brain', order: 1 },
  { name: 'Open Source', slug: 'open-source', description: 'Popular open source projects', icon: 'Github', order: 2 },
  { name: 'Developer Tools', slug: 'dev-tools', description: 'Tools for developers', icon: 'Code', order: 3 },
  { name: 'Design', slug: 'design', description: 'Design tools and resources', icon: 'Palette', order: 4 },
  { name: 'Productivity', slug: 'productivity', description: 'Productivity and workflow tools', icon: 'Zap', order: 5 },
  { name: 'Learning', slug: 'learning', description: 'Educational resources and courses', icon: 'GraduationCap', order: 6 },
  { name: 'Cloud Services', slug: 'cloud', description: 'Cloud platforms and services', icon: 'Cloud', order: 7 },
  { name: 'Community', slug: 'community', description: 'Developer communities and forums', icon: 'Users', order: 8 },
]

const websites = [
  // AI Tools
  { title: 'ChatGPT', url: 'https://chat.openai.com', description: 'AI chatbot by OpenAI for conversations and assistance', categorySlug: 'ai-tools', featured: true },
  { title: 'Claude', url: 'https://claude.ai', description: 'AI assistant by Anthropic for helpful and harmless conversations', categorySlug: 'ai-tools', featured: true },
  { title: 'Midjourney', url: 'https://midjourney.com', description: 'AI art generation platform', categorySlug: 'ai-tools' },
  { title: 'Hugging Face', url: 'https://huggingface.co', description: 'AI model hub and community', categorySlug: 'ai-tools' },
  { title: 'Stable Diffusion', url: 'https://stability.ai', description: 'Open source image generation AI', categorySlug: 'ai-tools' },
  // AI Tools - Additional from research.md
  { title: '文心一言', url: 'https://yiyan.baidu.com', description: '百度的文心大模型', categorySlug: 'ai-tools' },
  { title: '通义千问', url: 'https://tongyi.aliyun.com', description: '阿里云的AI助手', categorySlug: 'ai-tools' },
  { title: '智谱清言', url: 'https://chatglm.cn', description: '智谱AI的对话助手', categorySlug: 'ai-tools' },
  { title: 'Kimi', url: 'https://kimi.ai', description: '月之暗面的AI助手', categorySlug: 'ai-tools' },
  { title: '讯飞星火', url: 'https://xinghuo.xfyun.cn', description: '讯飞的认知大模型', categorySlug: 'ai-tools' },
  { title: '豆包', url: 'https://www.doubao.com', description: '字节跳动的AI助手', categorySlug: 'ai-tools' },
  { title: 'OpenAI API', url: 'https://platform.openai.com', description: 'OpenAI的API服务', categorySlug: 'ai-tools' },
  { title: 'Anthropic API', url: 'https://anthropic.com', description: 'Claude的API服务', categorySlug: 'ai-tools' },
  { title: 'Grammarly', url: 'https://www.grammarly.com', description: 'AI写作辅助工具', categorySlug: 'ai-tools' },
  { title: 'Notion AI', url: 'https://www.notion.so', description: 'Notion的AI功能', categorySlug: 'ai-tools' },
  { title: 'Jasper', url: 'https://www.jasper.ai', description: 'AI内容生成平台', categorySlug: 'ai-tools' },
  { title: 'Copy.ai', url: 'https://www.copy.ai', description: 'AI文案生成工具', categorySlug: 'ai-tools' },
  { title: 'DALL-E', url: 'https://openai.com/dall-e', description: 'OpenAI的图像生成模型', categorySlug: 'ai-tools' },
  { title: '通义万相', url: 'https://tongyi.aliyun.com', description: '阿里AI图像生成', categorySlug: 'ai-tools' },
  { title: '文心一格', url: 'https://yige.baidu.com', description: '百度AI图像生成', categorySlug: 'ai-tools' },
  { title: 'Canva', url: 'https://www.canva.com', description: '在线设计平台', categorySlug: 'ai-tools' },
  { title: 'remove.bg', url: 'https://www.remove.bg', description: 'AI抠图工具', categorySlug: 'ai-tools' },
  { title: '稿定设计', url: 'https://www.gaoding.com', description: '在线设计工具', categorySlug: 'ai-tools' },
  { title: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'AI编程助手', categorySlug: 'ai-tools', featured: true },
  { title: 'Cursor', url: 'https://cursor.sh', description: 'AI代码编辑器', categorySlug: 'ai-tools' },
  { title: 'Codeium', url: 'https://codeium.com', description: 'AI代码生成', categorySlug: 'ai-tools' },
  { title: 'Tabnine', url: 'https://www.tabnine.com', description: 'AI代码补全', categorySlug: 'ai-tools' },
  { title: '通义灵码', url: 'https://tongyi.aliyun.com', description: '阿里AI编程助手', categorySlug: 'ai-tools' },
  { title: '文心快码', url: 'https://code.baidu.com', description: '百度AI编程助手', categorySlug: 'ai-tools' },
  { title: 'CodeWhisperer', url: 'https://aws.amazon.com/codewhisperer', description: 'Amazon的AI编程助手', categorySlug: 'ai-tools' },

  // Open Source
  { title: 'GitHub', url: 'https://github.com', description: 'The world\'s largest code hosting platform', categorySlug: 'open-source', featured: true },
  { title: 'GitLab', url: 'https://gitlab.com', description: 'DevOps platform with built-in CI/CD', categorySlug: 'open-source' },
  { title: 'Next.js', url: 'https://nextjs.org', description: 'React framework for production', categorySlug: 'open-source', featured: true },
  { title: 'React', url: 'https://react.dev', description: 'JavaScript library for building user interfaces', categorySlug: 'open-source' },
  { title: 'Vue.js', url: 'https://vuejs.org', description: 'Progressive JavaScript framework', categorySlug: 'open-source' },
  { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: 'Utility-first CSS framework', categorySlug: 'open-source', featured: true },
  // Open Source - Frontend Frameworks
  { title: 'Nuxt.js', url: 'https://nuxt.com', description: 'Vue.js全栈框架', categorySlug: 'open-source' },
  { title: 'Gatsby', url: 'https://www.gatsbyjs.com', description: '基于React的静态站点生成器', categorySlug: 'open-source' },
  { title: 'Remix', url: 'https://remix.run', description: '全栈React框架', categorySlug: 'open-source' },
  { title: 'Vite', url: 'https://vitejs.dev', description: '下一代前端构建工具', categorySlug: 'open-source' },
  { title: 'Pinia', url: 'https://pinia.vuejs.org', description: 'Vue状态管理库', categorySlug: 'open-source' },
  { title: 'Vue Router', url: 'https://router.vuejs.org', description: 'Vue.js官方路由', categorySlug: 'open-source' },
  { title: 'Element Plus', url: 'https://element-plus.org', description: 'Vue 3 UI组件库', categorySlug: 'open-source' },
  { title: 'Vuetify', url: 'https://vuetifyjs.com', description: 'Vue UI组件库', categorySlug: 'open-source' },
  { title: 'Ant Design', url: 'https://ant.design', description: '企业级UI设计语言和组件库', categorySlug: 'open-source' },
  { title: 'Bootstrap', url: 'https://getbootstrap.com', description: '流行的HTML、CSS、JS库', categorySlug: 'open-source' },
  { title: 'Chakra UI', url: 'https://chakra-ui.com', description: '简单、模块化的React UI组件', categorySlug: 'open-source' },
  { title: 'shadcn/ui', url: 'https://ui.shadcn.com', description: '精美的React组件库', categorySlug: 'open-source' },
  { title: 'Radix UI', url: 'https://www.radix-ui.com', description: '无样式的React组件库', categorySlug: 'open-source' },
  { title: 'DaisyUI', url: 'https://daisyui.com', description: 'Tailwind CSS的UI组件', categorySlug: 'open-source' },
  // Open Source - Backend Frameworks
  { title: 'Express', url: 'https://expressjs.com', description: '简洁灵活的Node.js Web框架', categorySlug: 'open-source' },
  { title: 'NestJS', url: 'https://nestjs.com', description: '渐进式Node.js框架', categorySlug: 'open-source' },
  { title: 'Koa', url: 'https://koajs.com', description: '下一代Node.js框架', categorySlug: 'open-source' },
  { title: 'Fastify', url: 'https://www.fastify.io', description: '高性能Node.js框架', categorySlug: 'open-source' },
  { title: 'Hono', url: 'https://hono.dev', description: '轻量级Web框架', categorySlug: 'open-source' },
  { title: 'Django', url: 'https://www.djangoproject.com', description: 'Python全栈Web框架', categorySlug: 'open-source' },
  { title: 'Flask', url: 'https://flask.palletsprojects.com', description: 'Python微框架', categorySlug: 'open-source' },
  { title: 'FastAPI', url: 'https://fastapi.tiangolo.com', description: 'Python现代Web框架', categorySlug: 'open-source' },
  { title: 'Gin', url: 'https://gin-gonic.com', description: 'Go语言Web框架', categorySlug: 'open-source' },
  { title: 'Echo', url: 'https://echo.labstack.com', description: '高性能Go Web框架', categorySlug: 'open-source' },
  { title: 'Fiber', url: 'https://gofiber.io', description: 'Express风格的Go Web框架', categorySlug: 'open-source' },
  // Open Source - Databases
  { title: 'PostgreSQL', url: 'https://www.postgresql.org', description: '功能强大的开源关系数据库', categorySlug: 'open-source' },
  { title: 'MySQL', url: 'https://www.mysql.com', description: '流行的开源关系数据库', categorySlug: 'open-source' },
  { title: 'MariaDB', url: 'https://mariadb.org', description: 'MySQL分支的开源数据库', categorySlug: 'open-source' },
  { title: 'SQLite', url: 'https://www.sqlite.org', description: '轻量级嵌入式数据库', categorySlug: 'open-source' },
  { title: 'MongoDB', url: 'https://www.mongodb.com', description: '文档型NoSQL数据库', categorySlug: 'open-source' },
  { title: 'Redis', url: 'https://redis.io', description: '内存键值存储', categorySlug: 'open-source' },
  { title: 'Elasticsearch', url: 'https://www.elastic.co', description: '分布式搜索和分析引擎', categorySlug: 'open-source' },
  { title: 'Neo4j', url: 'https://neo4j.com', description: '领先的图数据库', categorySlug: 'open-source' },
  // Open Source - DevOps
  { title: 'Docker', url: 'https://www.docker.com', description: '容器化平台', categorySlug: 'open-source', featured: true },
  { title: 'Kubernetes', url: 'https://kubernetes.io', description: '容器编排平台', categorySlug: 'open-source' },
  { title: 'Podman', url: 'https://podman.io', description: '容器引擎', categorySlug: 'open-source' },
  { title: 'GitHub Actions', url: 'https://github.com/features/actions', description: 'GitHub自动化工作流', categorySlug: 'open-source' },
  { title: 'GitLab CI', url: 'https://docs.gitlab.com/ci', description: 'GitLab持续集成', categorySlug: 'open-source' },
  { title: 'Jenkins', url: 'https://www.jenkins.io', description: '自动化服务器', categorySlug: 'open-source' },
  { title: 'CircleCI', url: 'https://circleci.com', description: 'CI/CD平台', categorySlug: 'open-source' },
  { title: 'Prometheus', url: 'https://prometheus.io', description: '开源监控和告警系统', categorySlug: 'open-source' },
  { title: 'Grafana', url: 'https://grafana.com', description: '可视化监控平台', categorySlug: 'open-source' },
  { title: 'Sentry', url: 'https://sentry.io', description: '错误跟踪平台', categorySlug: 'open-source' },

  // Developer Tools
  { title: 'VS Code', url: 'https://code.visualstudio.com', description: 'Free code editor by Microsoft', categorySlug: 'dev-tools', featured: true },
  { title: 'Vercel', url: 'https://vercel.com', description: 'Platform for frontend developers', categorySlug: 'dev-tools' },
  { title: 'Netlify', url: 'https://netlify.com', description: 'Web development platform', categorySlug: 'dev-tools' },
  { title: 'Docker', url: 'https://docker.com', description: 'Container platform for developers', categorySlug: 'dev-tools' },
  { title: 'Postman', url: 'https://postman.com', description: 'API development platform', categorySlug: 'dev-tools' },
  // Developer Tools - Additional
  { title: 'IntelliJ IDEA', url: 'https://www.jetbrains.com/idea', description: 'JetBrains Java IDE', categorySlug: 'dev-tools' },
  { title: 'PyCharm', url: 'https://www.jetbrains.com/pycharm', description: 'Python IDE', categorySlug: 'dev-tools' },
  { title: 'WebStorm', url: 'https://www.jetbrains.com/webstorm', description: 'JavaScript IDE', categorySlug: 'dev-tools' },
  { title: 'Sublime Text', url: 'https://www.sublimetext.com', description: '轻量级文本编辑器', categorySlug: 'dev-tools' },
  { title: 'Vim', url: 'https://www.vim.org', description: '终端文本编辑器', categorySlug: 'dev-tools' },
  { title: 'Neovim', url: 'https://neovim.io', description: '现代Vim', categorySlug: 'dev-tools' },
  { title: 'Zed', url: 'https://zed.dev', description: '高性能代码编辑器', categorySlug: 'dev-tools' },
  { title: 'Insomnia', url: 'https://insomnia.rest', description: 'API客户端工具', categorySlug: 'dev-tools' },
  { title: 'Swagger', url: 'https://swagger.io', description: 'API设计和文档', categorySlug: 'dev-tools' },
  { title: 'Apifox', url: 'https://apifox.com', description: 'API协作平台', categorySlug: 'dev-tools' },
  { title: 'Charles', url: 'https://www.charlesproxy.com', description: 'HTTP代理调试工具', categorySlug: 'dev-tools' },
  { title: 'Wireshark', url: 'https://www.wireshark.org', description: '网络协议分析器', categorySlug: 'dev-tools' },
  { title: 'Git', url: 'https://git-scm.com', description: '分布式版本控制', categorySlug: 'dev-tools' },
  { title: 'Gitee', url: 'https://gitee.com', description: '码云代码托管', categorySlug: 'dev-tools' },
  { title: 'Bitbucket', url: 'https://bitbucket.org', description: '代码托管平台', categorySlug: 'dev-tools' },
  { title: 'iTerm2', url: 'https://iterm2.com', description: 'Mac终端替代', categorySlug: 'dev-tools' },
  { title: 'Oh My Zsh', url: 'https://ohmyz.sh', description: 'Zsh配置管理', categorySlug: 'dev-tools' },
  { title: 'Warp', url: 'https://www.warp.dev', description: '现代终端', categorySlug: 'dev-tools' },
  { title: 'TablePlus', url: 'https://tableplus.com', description: '数据库管理', categorySlug: 'dev-tools' },

  // Design
  { title: 'Figma', url: 'https://figma.com', description: 'Collaborative design tool', categorySlug: 'design', featured: true },
  { title: 'Dribbble', url: 'https://dribbble.com', description: 'Design inspiration platform', categorySlug: 'design' },
  { title: 'Behance', url: 'https://behance.net', description: 'Creative portfolio platform by Adobe', categorySlug: 'design' },
  { title: 'Unsplash', url: 'https://unsplash.com', description: 'Free high-quality photos', categorySlug: 'design' },
  // Design - Additional
  { title: 'Sketch', url: 'https://www.sketch.com', description: 'Mac设计工具', categorySlug: 'design' },
  { title: 'Adobe XD', url: 'https://www.adobe.com/xd', description: '设计和原型工具', categorySlug: 'design' },
  { title: 'Adobe Photoshop', url: 'https://www.adobe.com/ps', description: '图像处理软件', categorySlug: 'design' },
  { title: 'Adobe Illustrator', url: 'https://www.adobe.com/ai', description: '矢量图形软件', categorySlug: 'design' },
  { title: 'Affinity Designer', url: 'https://affinity.serif.com', description: '专业设计软件', categorySlug: 'design' },
  { title: 'Coolors', url: 'https://coolors.co', description: '配色方案生成器', categorySlug: 'design' },
  { title: 'Color Hunt', url: 'https://colorhunt.co', description: '配色灵感', categorySlug: 'design' },
  { title: 'Adobe Color', url: 'https://color.adobe.com', description: 'Adobe配色工具', categorySlug: 'design' },
  { title: 'Font Awesome', url: 'https://fontawesome.com', description: '图标字体库', categorySlug: 'design' },
  { title: 'Material Icons', url: 'https://fonts.google.com/icons', description: 'Google图标库', categorySlug: 'design' },
  { title: 'Lucide', url: 'https://lucide.dev', description: '精美图标库', categorySlug: 'design' },
  { title: 'Heroicons', url: 'https://heroicons.com', description: 'Tailwind图标', categorySlug: 'design' },
  { title: 'Phosphor Icons', url: 'https://phosphoricons.com', description: '图标库', categorySlug: 'design' },
  { title: 'Iconify', url: 'https://iconify.design', description: '多合图标库', categorySlug: 'design' },
  { title: 'Material UI', url: 'https://mui.com', description: 'Material Design组件库', categorySlug: 'design' },
  { title: 'Blueprint UI', url: 'https://blueprintjs.com', description: '数据密集型UI', categorySlug: 'design' },
  { title: 'ARCO Design', url: 'https://arco.design', description: '字节跳动UI组件库', categorySlug: 'design' },
  { title: 'Material Design', url: 'https://material.io', description: 'Google设计系统', categorySlug: 'design' },
  { title: 'Fluent Design', url: 'https://www.microsoft.com/design/fluent', description: 'Microsoft设计系统', categorySlug: 'design' },
  { title: 'Primer', url: 'https://primer.style', description: 'GitHub设计系统', categorySlug: 'design' },
  { title: 'Pexels', url: 'https://pexels.com', description: '免费图片素材', categorySlug: 'design' },
  { title: 'Pixabay', url: 'https://pixabay.com', description: '免费图片和视频', categorySlug: 'design' },

  // Productivity
  { title: 'Notion', url: 'https://notion.so', description: 'All-in-one workspace for notes and docs', categorySlug: 'productivity', featured: true },
  { title: 'Linear', url: 'https://linear.app', description: 'Modern issue tracking tool', categorySlug: 'productivity' },
  { title: 'Obsidian', url: 'https://obsidian.md', description: 'Knowledge base and note-taking', categorySlug: 'productivity' },
  // Productivity - Additional
  { title: 'Slack', url: 'https://slack.com', description: '团队协作平台', categorySlug: 'productivity' },
  { title: 'Discord', url: 'https://discord.com', description: '社区通讯工具', categorySlug: 'productivity' },
  { title: '飞书', url: 'https://feishu.cn', description: '字节跳动协作平台', categorySlug: 'productivity' },
  { title: '钉钉', url: 'https://dingtalk.com', description: '阿里协作平台', categorySlug: 'productivity' },
  { title: '企业微信', url: 'https://work.weixin.qq.com', description: '腾讯协作平台', categorySlug: 'productivity' },
  { title: 'Jira', url: 'https://www.atlassian.com/software/jira', description: '项目和问题跟踪', categorySlug: 'productivity' },
  { title: 'Trello', url: 'https://trello.com', description: '看板式项目管理', categorySlug: 'productivity' },
  { title: 'Asana', url: 'https://asana.com', description: '团队任务管理', categorySlug: 'productivity' },
  { title: 'ClickUp', url: 'https://clickup.com', description: '项目管理平台', categorySlug: 'productivity' },
  { title: 'Roam Research', url: 'https://roamresearch.com', description: '双向链接笔记', categorySlug: 'productivity' },
  { title: 'Logseq', url: 'https://logseq.com', description: '大纲笔记工具', categorySlug: 'productivity' },
  { title: '语雀', url: 'https://yuque.com', description: '知识协作平台', categorySlug: 'productivity' },
  { title: 'CloudConvert', url: 'https://cloudconvert.com', description: '格式转换工具', categorySlug: 'productivity' },
  { title: 'TinyPNG', url: 'https://tinypng.com', description: '图片压缩工具', categorySlug: 'productivity' },
  { title: 'Squoosh', url: 'https://squoosh.app', description: 'Google图片压缩', categorySlug: 'productivity' },
  { title: 'smallpdf', url: 'https://smallpdf.com', description: 'PDF工具集', categorySlug: 'productivity' },
  { title: 'iLovePDF', url: 'https://www.ilovepdf.com', description: '在线PDF工具', categorySlug: 'productivity' },
  { title: 'Alfred', url: 'https://www.alfredapp.com', description: 'Mac效率启动器', categorySlug: 'productivity' },

  // Learning
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web technology documentation', categorySlug: 'learning', featured: true },
  { title: 'freeCodeCamp', url: 'https://freecodecamp.org', description: 'Free coding education platform', categorySlug: 'learning' },
  { title: 'LeetCode', url: 'https://leetcode.com', description: 'Coding practice platform', categorySlug: 'learning' },
  // Learning - Additional
  { title: 'React文档', url: 'https://react.dev', description: 'React官方文档', categorySlug: 'learning' },
  { title: 'Vue文档', url: 'https://vuejs.org', description: 'Vue官方文档', categorySlug: 'learning' },
  { title: 'Node.js文档', url: 'https://nodejs.org', description: 'Node.js官方文档', categorySlug: 'learning' },
  { title: 'Python文档', url: 'https://docs.python.org', description: 'Python官方文档', categorySlug: 'learning' },
  { title: 'W3Schools', url: 'https://www.w3schools.com', description: 'Web技术教程', categorySlug: 'learning' },
  { title: 'Codecademy', url: 'https://www.codecademy.com', description: '交互式编程学习', categorySlug: 'learning' },
  { title: '菜鸟教程', url: 'https://www.runoob.com', description: '中文编程教程', categorySlug: 'learning' },
  { title: '廖雪峰的官方网站', url: 'https://www.liaoxuefeng.com', description: 'Python/Java教程', categorySlug: 'learning' },
  { title: '极客时间', url: 'https://time.geekbang.org', description: '技术学习平台', categorySlug: 'learning' },
  { title: 'Bilibili', url: 'https://www.bilibili.com', description: '视频平台（技术内容丰富）', categorySlug: 'learning' },
  { title: 'Coursera', url: 'https://www.coursera.org', description: '在线课程平台', categorySlug: 'learning' },
  { title: 'Udemy', url: 'https://www.udemy.com', description: '在线课程市场', categorySlug: 'learning' },
  { title: '网易云课堂', url: 'https://study.163.com', description: '中文在线课程', categorySlug: 'learning' },
  { title: 'GitHub Free Programming Books', url: 'https://github.com/EbookFoundation/free-programming-books', description: '免费编程书籍', categorySlug: 'learning' },
  { title: '异步社区', url: 'https://www.epubit.com', description: '人民邮电出版社', categorySlug: 'learning' },
  { title: '图灵社区', url: 'https://www.ituring.com.cn', description: '图灵出版社', categorySlug: 'learning' },

  // Cloud Services
  { title: 'AWS', url: 'https://aws.amazon.com', description: 'Amazon Web Services cloud platform', categorySlug: 'cloud', featured: true },
  { title: 'Google Cloud', url: 'https://cloud.google.com', description: 'Google Cloud Platform', categorySlug: 'cloud' },
  { title: 'Supabase', url: 'https://supabase.com', description: 'Open source Firebase alternative', categorySlug: 'cloud' },
  { title: 'PlanetScale', url: 'https://planetscale.com', description: 'Serverless MySQL platform', categorySlug: 'cloud' },
  // Cloud Services - Additional
  { title: '阿里云', url: 'https://www.aliyun.com', description: '阿里云计算平台', categorySlug: 'cloud' },
  { title: '腾讯云', url: 'https://cloud.tencent.com', description: '腾讯云计算平台', categorySlug: 'cloud' },
  { title: '华为云', url: 'https://www.huaweicloud.com', description: '华为云计算平台', categorySlug: 'cloud' },
  { title: 'Vercel', url: 'https://vercel.com', description: '前端部署平台', categorySlug: 'cloud' },
  { title: 'Netlify', url: 'https://www.netlify.com', description: '静态网站托管', categorySlug: 'cloud' },

  // Community
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: 'Q&A community for developers', categorySlug: 'community', featured: true },
  { title: 'Dev.to', url: 'https://dev.to', description: 'Developer community and blog platform', categorySlug: 'community' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Tech news and discussions', categorySlug: 'community' },
  { title: 'Reddit Programming', url: 'https://reddit.com/r/programming', description: 'Programming subreddit', categorySlug: 'community' },
  // Community - Additional
  { title: 'SegmentFault思否', url: 'https://segmentfault.com', description: '中文技术问答', categorySlug: 'community' },
  { title: 'V2EX', url: 'https://www.v2ex.com', description: '程序员社区', categorySlug: 'community' },
  { title: '开源中国', url: 'https://www.oschina.net', description: '中文开源社区', categorySlug: 'community' },
  { title: 'Reddit', url: 'https://www.reddit.com', description: '社交新闻聚合', categorySlug: 'community' },
  { title: 'Quora', url: 'https://www.quora.com', description: '问答平台', categorySlug: 'community' },
  { title: 'SourceForge', url: 'https://sourceforge.net', description: '开源软件仓库', categorySlug: 'community' },
  { title: 'CodeProject', url: 'https://www.codeproject.com', description: '开发者社区', categorySlug: 'community' },
  { title: 'TechCrunch', url: 'https://techcrunch.com', description: '科技新闻网站', categorySlug: 'community' },
  { title: 'The Verge', url: 'https://www.theverge.com', description: '科技媒体', categorySlug: 'community' },
  { title: '36氪', url: 'https://36kr.com', description: '科技创投媒体', categorySlug: 'community' },
  { title: '极客公园', url: 'https://www.geekpark.net', description: '科技媒体', categorySlug: 'community' },
  { title: 'InfoQ', url: 'https://www.infoq.cn', description: '技术资讯平台', categorySlug: 'community' },
  { title: 'Medium', url: 'https://medium.com', description: '博客平台', categorySlug: 'community' },
  { title: '知乎', url: 'https://www.zhihu.com', description: '中文问答社区', categorySlug: 'community' },
  { title: '掘金', url: 'https://juejin.cn', description: '技术内容平台', categorySlug: 'community' },
  { title: 'CSDN', url: 'https://blog.csdn.net', description: '中文开发者社区', categorySlug: 'community' },
  { title: '博客园', url: 'https://www.cnblogs.com', description: '技术博客平台', categorySlug: 'community' },
  { title: 'Product Hunt', url: 'https://www.producthunt.com', description: '产品发现平台', categorySlug: 'community' },
]

async function main() {
  console.log('Seeding database...')
  
  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }
  console.log(`Created ${categories.length} categories`)
  
  // Get category map
  const categoryMap = new Map<string, string>()
  const allCategories = await prisma.category.findMany()
  for (const cat of allCategories) {
    categoryMap.set(cat.slug, cat.id)
  }
  
  // Create websites
  for (const website of websites) {
    const categoryId = categoryMap.get(website.categorySlug)
    if (!categoryId) {
      console.warn(`Category not found: ${website.categorySlug}`)
      continue
    }
    
    // Generate favicon URL using Google's favicon service
    const domain = new URL(website.url).hostname
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    
    await prisma.website.upsert({
      where: { url: website.url },
      update: {
        title: website.title,
        description: website.description,
        favicon,
        featured: website.featured ?? false,
        categoryId,
        status: 'APPROVED',
      },
      create: {
        title: website.title,
        url: website.url,
        description: website.description,
        favicon,
        featured: website.featured ?? false,
        categoryId,
        status: 'APPROVED',
      },
    })
  }
  console.log(`Created ${websites.length} websites`)
  
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
