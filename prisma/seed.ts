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
  
  // Open Source
  { title: 'GitHub', url: 'https://github.com', description: 'The world\'s largest code hosting platform', categorySlug: 'open-source', featured: true },
  { title: 'GitLab', url: 'https://gitlab.com', description: 'DevOps platform with built-in CI/CD', categorySlug: 'open-source' },
  { title: 'Next.js', url: 'https://nextjs.org', description: 'React framework for production', categorySlug: 'open-source', featured: true },
  { title: 'React', url: 'https://react.dev', description: 'JavaScript library for building user interfaces', categorySlug: 'open-source' },
  { title: 'Vue.js', url: 'https://vuejs.org', description: 'Progressive JavaScript framework', categorySlug: 'open-source' },
  { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: 'Utility-first CSS framework', categorySlug: 'open-source', featured: true },
  
  // Developer Tools
  { title: 'VS Code', url: 'https://code.visualstudio.com', description: 'Free code editor by Microsoft', categorySlug: 'dev-tools', featured: true },
  { title: 'Vercel', url: 'https://vercel.com', description: 'Platform for frontend developers', categorySlug: 'dev-tools' },
  { title: 'Netlify', url: 'https://netlify.com', description: 'Web development platform', categorySlug: 'dev-tools' },
  { title: 'Docker', url: 'https://docker.com', description: 'Container platform for developers', categorySlug: 'dev-tools' },
  { title: 'Postman', url: 'https://postman.com', description: 'API development platform', categorySlug: 'dev-tools' },
  
  // Design
  { title: 'Figma', url: 'https://figma.com', description: 'Collaborative design tool', categorySlug: 'design', featured: true },
  { title: 'Dribbble', url: 'https://dribbble.com', description: 'Design inspiration platform', categorySlug: 'design' },
  { title: 'Behance', url: 'https://behance.net', description: 'Creative portfolio platform by Adobe', categorySlug: 'design' },
  { title: 'Unsplash', url: 'https://unsplash.com', description: 'Free high-quality photos', categorySlug: 'design' },
  
  // Productivity
  { title: 'Notion', url: 'https://notion.so', description: 'All-in-one workspace for notes and docs', categorySlug: 'productivity', featured: true },
  { title: 'Linear', url: 'https://linear.app', description: 'Modern issue tracking tool', categorySlug: 'productivity' },
  { title: 'Obsidian', url: 'https://obsidian.md', description: 'Knowledge base and note-taking', categorySlug: 'productivity' },
  
  // Learning
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web technology documentation', categorySlug: 'learning', featured: true },
  { title: 'freeCodeCamp', url: 'https://freecodecamp.org', description: 'Free coding education platform', categorySlug: 'learning' },
  { title: 'LeetCode', url: 'https://leetcode.com', description: 'Coding practice platform', categorySlug: 'learning' },
  
  // Cloud Services
  { title: 'AWS', url: 'https://aws.amazon.com', description: 'Amazon Web Services cloud platform', categorySlug: 'cloud', featured: true },
  { title: 'Google Cloud', url: 'https://cloud.google.com', description: 'Google Cloud Platform', categorySlug: 'cloud' },
  { title: 'Supabase', url: 'https://supabase.com', description: 'Open source Firebase alternative', categorySlug: 'cloud' },
  { title: 'PlanetScale', url: 'https://planetscale.com', description: 'Serverless MySQL platform', categorySlug: 'cloud' },
  
  // Community
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: 'Q&A community for developers', categorySlug: 'community', featured: true },
  { title: 'Dev.to', url: 'https://dev.to', description: 'Developer community and blog platform', categorySlug: 'community' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Tech news and discussions', categorySlug: 'community' },
  { title: 'Reddit Programming', url: 'https://reddit.com/r/programming', description: 'Programming subreddit', categorySlug: 'community' },
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
