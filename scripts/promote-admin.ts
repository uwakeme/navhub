import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Please provide an email address')
    console.log('Usage: npx tsx scripts/promote-admin.ts <email>')
    process.exit(1)
  }

  console.log(`Looking for user with email: ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error('User not found! Please sign in first to create your account.')
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })

  console.log(`✅ Successfully promoted ${updated.name} (${updated.email}) to ADMIN`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
