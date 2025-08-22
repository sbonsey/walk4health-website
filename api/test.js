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
    
    let redisTestResult = null
    
    // Test Redis connection if we have the credentials
    if (redisUrl && redisToken) {
      try {
        console.log('🧪 Testing Redis connection...')
        
        // Test a simple SET operation
        const testKey = 'walk4health:test'
        const testValue = JSON.stringify({ test: true, timestamp: new Date().toISOString() })
        
        console.log('🧪 Setting test key:', testKey)
        const setResponse = await fetch(`${redisUrl}/set/${testKey}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testValue)
        })
        
        console.log('🧪 SET response status:', setResponse.status)
        
        if (setResponse.ok) {
          // Test GET operation
          console.log('🧪 Getting test key...')
          const getResponse = await fetch(`${redisUrl}/get/${testKey}`, {
            headers: {
              'Authorization': `Bearer ${redisToken}`
            }
          })
          
          console.log('🧪 GET response status:', getResponse.status)
          
          if (getResponse.ok) {
            const getResult = await getResponse.json()
            console.log('🧪 GET result:', getResult)
            
            // Clean up test key
            console.log('🧪 Cleaning up test key...')
            const delResponse = await fetch(`${redisUrl}/del/${testKey}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${redisToken}`
              }
            })
            
            console.log('🧪 DELETE response status:', delResponse.status)
            
            redisTestResult = {
              success: true,
              setStatus: setResponse.status,
              getStatus: getResponse.status,
              deleteStatus: delResponse.status,
              retrievedValue: getResult.result ? JSON.parse(getResult.result) : null
            }
          } else {
            const getErrorText = await getResponse.text()
            redisTestResult = {
              success: false,
              setStatus: setResponse.status,
              getStatus: getResponse.status,
              getError: getErrorText
            }
          }
        } else {
          const setErrorText = await setResponse.text()
          redisTestResult = {
            success: false,
            setStatus: setResponse.status,
            setError: setErrorText
          }
        }
      } catch (redisError) {
        console.error('🧪 Redis test error:', redisError)
        redisTestResult = {
          success: false,
          error: redisError.message
        }
      }
    }
    
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
        allEnvVars: allEnvVars.slice(0, 20), // Show first 20 for debugging
        testResult: redisTestResult
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
