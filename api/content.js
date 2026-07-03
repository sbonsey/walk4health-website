export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get content from Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        console.log('🔍 GET Content - Redis URL:', redisUrl ? '***SET***' : 'NOT SET')
        console.log('🔍 GET Content - Redis Token:', redisToken ? '***SET***' : 'NOT SET')
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('KV') || key.includes('UPSTASH')))
          return res.status(500).json({ error: 'Redis not configured' })
        }

        console.log('🔍 GET Content - Making request to:', `${redisUrl}/get/walk4health:content`)
        
        const response = await fetch(`${redisUrl}/get/walk4health:content`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        console.log('🔍 GET Content - Response status:', response.status)
        console.log('🔍 GET Content - Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('🔍 GET Content - Raw result:', result)
          if (result.result) {
            const parsedData = JSON.parse(result.result)
            console.log('🔍 GET Content - Parsed data:', parsedData)
            res.status(200).json(parsedData)
          } else {
            console.log('🔍 GET Content - No data found, returning empty structure')
            // Return empty structure if no data exists - no defaults
            const emptyData = {
              clubDescription: '',
              lastUpdated: new Date().toISOString()
            }
            res.status(200).json(emptyData)
          }
        } else {
          const errorText = await response.text()
          console.error('🔍 GET Content - Redis GET failed:', response.status, errorText)
          throw new Error(`Redis GET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error reading content from Redis:', error)
        res.status(500).json({ error: 'Failed to read content', details: error.message })
      }
      break

    case 'POST':
      try {
        const { clubMission, clubDescription, committee, walkingStats, clubImageCaption, contactInfo, applicationFormUrl } = req.body

        console.log('💾 POST Content - Received data:', { clubMission, clubDescription, committee, walkingStats, clubImageCaption, contactInfo, applicationFormUrl })
        
        // Validate data
        if (!clubMission || !clubDescription) {
          console.error('💾 POST Content - Missing required fields')
          return res.status(400).json({ error: 'Missing required fields: clubMission and clubDescription are required' })
        }

        const contentData = {
          clubMission,
          clubDescription,
          committee: committee || null,
          walkingStats: walkingStats || null,
          clubImageCaption: clubImageCaption || null,
          contactInfo: contactInfo || null,
          applicationFormUrl: applicationFormUrl || null,
          lastUpdated: new Date().toISOString()
        }

        console.log('💾 POST Content - Formatted data:', contentData)

        // Save to Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        console.log('💾 POST Content - Redis URL:', redisUrl ? '***SET***' : 'NOT SET')
        console.log('💾 POST Content - Redis Token:', redisToken ? '***SET***' : 'NOT SET')
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('KV') || key.includes('UPSTASH')))
          return res.status(500).json({ error: 'Redis not configured' })
        }

        // Log URL structure for debugging (without exposing full URL)
        const urlParts = redisUrl.split('/')
        console.log('💾 POST Content - Redis URL structure:', {
          protocol: urlParts[0],
          hostname: urlParts[2]?.split('.')[0] + '.***',
          path: urlParts.slice(3).join('/')
        })

        console.log('💾 POST Content - Making request to:', `${redisUrl}/set/walk4health:content`)
        console.log('💾 POST Content - Request body:', JSON.stringify(contentData))

        const response = await fetch(`${redisUrl}/set/walk4health:content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contentData)
        })
        
        console.log('💾 POST Content - Response status:', response.status)
        console.log('💾 POST Content - Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('💾 POST Content - Success result:', result)
          res.status(200).json({ success: true, message: 'Content saved successfully' })
        } else {
          const errorText = await response.text()
          console.error('💾 POST Content - Redis SET failed:', response.status, errorText)
          throw new Error(`Redis SET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error saving content to Redis:', error)
        res.status(500).json({ error: 'Failed to save content', details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
