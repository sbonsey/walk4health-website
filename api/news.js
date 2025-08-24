export default async function handler(req, res) {
  const { method } = req
  
  console.log(`📰 ${method} News - Request received`)
  console.log('📰 News - Environment:', process.env.NODE_ENV)
  console.log('📰 News - Hostname:', req.headers.host)
  
  // Check Redis environment variables
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  
  console.log('📰 News - Redis URL:', redisUrl ? '***SET***' : 'NOT SET')
  console.log('📰 News - Redis Token:', redisToken ? '***SET***' : 'NOT SET')
  
  if (!redisUrl || !redisToken) {
    console.error('📰 News - Redis environment variables not set')
    console.error('📰 News - Available env vars:', Object.keys(process.env).filter(key => key.includes('KV') || key.includes('UPSTASH')))
    return res.status(500).json({ error: 'Redis not configured' })
  }

  switch (method) {
    case 'GET':
      try {
        console.log('📰 GET News - Fetching news from Redis...')
        
        const response = await fetch(`${redisUrl}/get/walk4health:news`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('📰 GET News - Redis response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('📰 GET News - Redis result:', result)
          
          if (result.result) {
            const newsData = JSON.parse(result.result)
            console.log('📰 GET News - Parsed news data:', newsData)
            res.status(200).json({ newsItems: newsData.newsItems || [] })
          } else {
            console.log('📰 GET News - No news data found, returning empty array')
            res.status(200).json({ newsItems: [] })
          }
        } else {
          const errorText = await response.text()
          console.error('📰 GET News - Redis GET failed:', response.status, errorText)
          throw new Error(`Redis GET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('📰 GET News - Error reading news from Redis:', error)
        res.status(500).json({ error: 'Failed to read news', details: error.message })
      }
      break

    case 'POST':
      try {
        const { newsItems } = req.body
        
        console.log('📰 POST News - Received data:', { newsItems })
        
        // Validate data
        if (!newsItems || !Array.isArray(newsItems)) {
          console.error('📰 POST News - Missing or invalid newsItems array')
          return res.status(400).json({ error: 'Missing required field: newsItems array' })
        }

        const newsData = {
          newsItems,
          lastUpdated: new Date().toISOString()
        }

        console.log('📰 POST News - Formatted data:', newsData)

        // Save to Vercel KV (Upstash Redis)
        console.log('📰 POST News - Making request to:', `${redisUrl}/set/walk4health:news`)
        console.log('📰 POST News - Request body:', JSON.stringify(newsData))

        const response = await fetch(`${redisUrl}/set/walk4health:news`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newsData)
        })
        
        console.log('📰 POST News - Response status:', response.status)
        console.log('📰 POST News - Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('📰 POST News - Success result:', result)
          res.status(200).json({ success: true, message: 'News saved successfully' })
        } else {
          const errorText = await response.text()
          console.error('📰 POST News - Redis SET failed:', response.status, errorText)
          throw new Error(`Redis SET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('📰 POST News - Error saving news to Redis:', error)
        res.status(500).json({ error: 'Failed to save news', details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
