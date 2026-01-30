import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in a serverless environment (Vercel, EdgeOne Pages, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production'

// Create Prisma adapter with connection string
// For serverless, we use connection_limit=1 to prevent connection pool exhaustion
const getConnectionString = () => {
  const baseUrl = process.env.DATABASE_URL!
  // Add connection_limit for serverless environments if not already present
  if (isServerless && !baseUrl.includes('connection_limit')) {
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}connection_limit=1`
  }
  return baseUrl
}

const adapter = new PrismaPg({
  connectionString: getConnectionString(),
})

// Create Prisma Client with adapter
const createPrismaClient = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      // Check if it's a connection error that we should retry
      const errorMessage = lastError.message || ''
      const isRetryableError = 
        errorMessage.includes('Connection terminated') ||
        errorMessage.includes('Connection pool') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT')
      
      if (!isRetryableError || attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying with exponential backoff
      const delay = retryDelay * attempt
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Operation failed after retries')
}

// Connection health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await executeWithRetry(async () => {
      await prisma.$queryRaw`SELECT 1`
    }, 2)
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
