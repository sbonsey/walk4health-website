export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get email config from Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/get/walk4health:email-config`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.result) {
            res.status(200).json(JSON.parse(result.result))
          } else {
            // Return default email config if none exists
            const defaultConfig = {
              inquiryEmail: 'admin@walk4health.co.nz',
              subjectPrefix: '[Walk4Health]',
              lastUpdated: new Date().toISOString()
            }
            res.status(200).json(defaultConfig)
          }
        } else {
          throw new Error(`Redis GET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error reading email config from Redis:', error)
        res.status(500).json({ error: 'Failed to read email config' })
      }
      break

    case 'POST':
      try {
        const { inquiryEmail, subjectPrefix } = req.body
        
        // Validate data
        if (!inquiryEmail) {
          return res.status(400).json({ error: 'Missing required field: inquiryEmail' })
        }

        const emailConfigData = {
          inquiryEmail,
          subjectPrefix: subjectPrefix || '[Walk4Health]',
          lastUpdated: new Date().toISOString()
        }

        // Save to Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/set/walk4health:email-config`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailConfigData)
        })
        
        if (response.ok) {
          res.status(200).json({ success: true, message: 'Email config saved successfully' })
        } else {
          throw new Error(`Redis SET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error saving email config to Redis:', error)
        res.status(500).json({ error: 'Failed to save email config' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
