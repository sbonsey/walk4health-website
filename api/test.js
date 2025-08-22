export default async function handler(req, res) {
  try {
    // Check if we're in development or production
    const isDev = process.env.NODE_ENV === 'development'
    const hostname = req.headers.host || 'unknown'
    
    // Check Redis environment variables
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    const status = {
      environment: process.env.NODE_ENV || 'unknown',
      hostname,
      timestamp: new Date().toISOString(),
      redis: {
        hasRedisUrl: !!redisUrl,
        hasRedisToken: !!redisToken,
        redisUrl: redisUrl ? '***SET***' : 'NOT SET',
        redisToken: redisToken ? '***SET***' : 'NOT SET'
      },
      message: 'API test endpoint working'
    }
    
    res.status(200).json(status)
  } catch (error) {
    res.status(500).json({ 
      error: 'Test endpoint failed',
      message: error.message,
      stack: error.stack
    })
  }
}
