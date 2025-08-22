export default async function handler(req, res) {
  try {
    // Check if we're in development or production
    const isDev = process.env.NODE_ENV === 'development'
    const hostname = req.headers.host || 'unknown'
    
    // Check KV environment variables
    const kvUrl = process.env.KV_URL
    const kvRestApiUrl = process.env.KV_REST_API_URL
    const kvRestApiToken = process.env.KV_REST_API_TOKEN
    
    const status = {
      environment: process.env.NODE_ENV || 'unknown',
      hostname,
      timestamp: new Date().toISOString(),
      kv: {
        hasKvUrl: !!kvUrl,
        hasKvRestApiUrl: !!kvRestApiUrl,
        hasKvRestApiToken: !!kvRestApiToken,
        kvUrl: kvUrl ? '***SET***' : 'NOT SET',
        kvRestApiUrl: kvRestApiUrl ? '***SET***' : 'NOT SET',
        kvRestApiToken: kvRestApiToken ? '***SET***' : 'NOT SET'
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
