export default async function handler(req, res) {
  try {
    // Check if we're in development or production
    const isDev = process.env.NODE_ENV === 'development'
    const hostname = req.headers.host || 'unknown'
    
    // Check Redis environment variables (both Vercel KV and Upstash naming)
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    
    // Get all environment variables for debugging
    const allEnvVars = Object.keys(process.env)
    const redisRelatedVars = allEnvVars.filter(key => 
      key.includes('KV') || key.includes('UPSTASH') || key.includes('REDIS')
    )
    
    const status = {
      environment: process.env.NODE_ENV || 'unknown',
      hostname,
      timestamp: new Date().toISOString(),
      redis: {
        hasRedisUrl: !!redisUrl,
        hasRedisToken: !!redisToken,
        redisUrl: redisUrl ? '***SET***' : 'NOT SET',
        redisToken: redisToken ? '***SET***' : 'NOT SET',
        availableEnvVars: redisRelatedVars,
        allEnvVars: allEnvVars.slice(0, 20) // Show first 20 for debugging
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
