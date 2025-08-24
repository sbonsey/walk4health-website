export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    console.log('🧪 Email test endpoint called')
    
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '***SET***' : 'NOT SET',
      KV_REST_API_URL: process.env.KV_REST_API_URL ? '***SET***' : 'NOT SET',
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '***SET***' : 'NOT SET'
    }
    
    console.log('🔍 Environment check:', envCheck)
    
    // Check Redis connection
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    
    let redisStatus = 'NOT CONFIGURED'
    let emailConfig = null
    
    if (redisUrl && redisToken) {
      try {
        const configResponse = await fetch(`${redisUrl}/get/walk4health:email-config`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        if (configResponse.ok) {
          const configResult = await configResponse.json()
          if (configResult.result) {
            emailConfig = JSON.parse(configResult.result)
            redisStatus = 'CONNECTED - Email config found'
          } else {
            redisStatus = 'CONNECTED - No email config'
          }
        } else {
          redisStatus = `CONNECTED - Failed to get config (${configResponse.status})`
        }
      } catch (error) {
        redisStatus = `CONNECTED - Error: ${error.message}`
      }
    }
    
    // Test Resend API key if available
    const resendApiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY
    let resendStatus = 'NOT CONFIGURED'
    
    if (resendApiKey) {
      try {
        const testResponse = await fetch('https://api.resend.com/domains', {
          headers: {
            'Authorization': `Bearer ${resendApiKey}`
          }
        })
        
        if (testResponse.ok) {
          const domains = await testResponse.json()
          resendStatus = `CONFIGURED - ${domains.data?.length || 0} domains found`
        } else {
          resendStatus = `CONFIGURED - API test failed (${testResponse.status})`
        }
      } catch (error) {
        resendStatus = `CONFIGURED - Error: ${error.message}`
      }
    }
    
    const status = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      redis: redisStatus,
      resend: resendStatus,
      emailConfig,
      recommendations: []
    }
    
    // Add recommendations based on current status
    if (!resendApiKey) {
      status.recommendations.push('Set RESEND_API_KEY environment variable')
    }
    
    if (redisStatus.includes('NOT CONFIGURED')) {
      status.recommendations.push('Configure Redis/KV environment variables')
    }
    
    if (!emailConfig) {
      status.recommendations.push('Set up email configuration in admin panel')
    }
    
    if (resendStatus.includes('API test failed')) {
      status.recommendations.push('Check Resend API key validity')
    }
    
    res.status(200).json(status)
    
  } catch (error) {
    console.error('❌ Email test endpoint error:', error)
    res.status(500).json({ 
      error: 'Email test failed',
      message: error.message
    })
  }
}
