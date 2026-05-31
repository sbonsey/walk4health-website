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

    const resendApiKey = process.env.RESEND_API_KEY
    const sendgridApiKey = process.env.SENDGRID_API_KEY
    let resendStatus = 'NOT CONFIGURED'
    let sendgridStatus = 'NOT CONFIGURED'

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
          const errorText = await testResponse.text()
          resendStatus = `CONFIGURED - API test failed (${testResponse.status})`
          console.warn('🔍 Resend domains test failure:', testResponse.status, errorText)
        }
      } catch (error) {
        resendStatus = `CONFIGURED - Error: ${error.message}`
      }
    }

    if (sendgridApiKey) {
      try {
        const testResponse = await fetch('https://api.sendgrid.com/v3/user/account', {
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`
          }
        })

        if (testResponse.ok) {
          const account = await testResponse.json()
          sendgridStatus = `CONFIGURED - SendGrid user ${account.username || 'unknown'} detected`
        } else {
          const errorText = await testResponse.text()
          sendgridStatus = `CONFIGURED - API test failed (${testResponse.status})`
          console.warn('🔍 SendGrid account test failure:', testResponse.status, errorText)
        }
      } catch (error) {
        sendgridStatus = `CONFIGURED - Error: ${error.message}`
      }
    }

    const status = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      redis: redisStatus,
      resend: resendStatus,
      sendgrid: sendgridStatus,
      emailConfig,
      recommendations: []
    }

    // Add recommendations based on current status
    if (!resendApiKey && !sendgridApiKey) {
      status.recommendations.push('Set RESEND_API_KEY or SENDGRID_API_KEY environment variable')
    }
    if (sendgridApiKey) {
      status.recommendations.push('SendGrid is configured; verify the SendGrid from address is authorized and the key is valid')
    }
    if (resendApiKey) {
      status.recommendations.push('Resend is configured; verify the Resend sending domain is verified')
    }

    if (redisStatus.includes('NOT CONFIGURED')) {
      status.recommendations.push('Configure Redis/KV environment variables')
    }

    if (!emailConfig) {
      status.recommendations.push('Set up email configuration in admin panel')
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
