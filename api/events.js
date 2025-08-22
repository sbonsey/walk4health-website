export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get events from Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        console.log('🔍 GET Events - Redis URL:', redisUrl ? '***SET***' : 'NOT SET')
        console.log('🔍 GET Events - Redis Token:', redisToken ? '***SET***' : 'NOT SET')
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('KV') || key.includes('UPSTASH')))
          return res.status(500).json({ error: 'Redis not configured' })
        }

        console.log('🔍 GET Events - Making request to:', `${redisUrl}/get/walk4health:events`)
        
        const response = await fetch(`${redisUrl}/get/walk4health:events`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        console.log('🔍 GET Events - Response status:', response.status)
        console.log('🔍 GET Events - Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('🔍 GET Events - Raw result:', result)
          if (result.result) {
            const parsedData = JSON.parse(result.result)
            console.log('🔍 GET Events - Parsed data:', parsedData)
            res.status(200).json(parsedData)
          } else {
            console.log('🔍 GET Events - No data found, returning default')
            // Return default structure if no data exists
            const defaultData = {
              recurringEvents: [],
              specialEvents: []
            }
            res.status(200).json(defaultData)
          }
        } else {
          const errorText = await response.text()
          console.error('🔍 GET Events - Redis GET failed:', response.status, errorText)
          throw new Error(`Redis GET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error reading events from Redis:', error)
        res.status(500).json({ error: 'Failed to read content', details: error.message })
      }
      break

    case 'POST':
      try {
        const { recurringEvents, specialEvents } = req.body
        
        console.log('💾 POST Events - Received data:', { recurringEvents, specialEvents })
        
        // Validate data
        if (!Array.isArray(recurringEvents) || !Array.isArray(specialEvents)) {
          console.error('💾 POST Events - Invalid data format')
          return res.status(400).json({ error: 'Invalid data format' })
        }

        const eventsData = {
          recurringEvents,
          specialEvents,
          lastUpdated: new Date().toISOString()
        }

        console.log('💾 POST Events - Formatted data:', eventsData)

        // Save to Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        console.log('💾 POST Events - Redis URL:', redisUrl ? '***SET***' : 'NOT SET')
        console.log('💾 POST Events - Redis Token:', redisToken ? '***SET***' : 'NOT SET')
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('KV') || key.includes('UPSTASH')))
          return res.status(500).json({ error: 'Redis not configured' })
        }

        // Log URL structure for debugging (without exposing full URL)
        const urlParts = redisUrl.split('/')
        console.log('💾 POST Events - Redis URL structure:', {
          protocol: urlParts[0],
          hostname: urlParts[2]?.split('.')[0] + '.***',
          path: urlParts.slice(3).join('/')
        })

        // Try both endpoint formats - Upstash Redis might use different format
        const setEndpoint = `${redisUrl}/set/walk4health:events`
        console.log('💾 POST Events - Making request to:', setEndpoint)
        console.log('💾 POST Events - Request body:', JSON.stringify(eventsData))

        const response = await fetch(setEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventsData)
        })
        
        console.log('💾 POST Events - Response status:', response.status)
        console.log('💾 POST Events - Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('💾 POST Events - Success result:', result)
          res.status(200).json({ success: true, message: 'Events saved successfully' })
        } else {
          const errorText = await response.text()
          console.error('💾 POST Events - Redis SET failed:', response.status, errorText)
          
          // Try alternative endpoint format if first one failed
          console.log('🔄 Trying alternative endpoint format...')
          const altEndpoint = `${redisUrl}/set`
          const altBody = JSON.stringify({
            key: 'walk4health:events',
            value: eventsData
          })
          
          console.log('🔄 Alternative endpoint:', altEndpoint)
          console.log('🔄 Alternative body:', altBody)
          
          const altResponse = await fetch(altEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${redisToken}`,
              'Content-Type': 'application/json'
            },
            body: altBody
          })
          
          console.log('🔄 Alternative response status:', altResponse.status)
          
          if (altResponse.ok) {
            const altResult = await altResponse.json()
            console.log('🔄 Alternative endpoint success:', altResult)
            res.status(200).json({ success: true, message: 'Events saved successfully via alternative endpoint' })
          } else {
            const altErrorText = await altResponse.text()
            console.error('🔄 Alternative endpoint also failed:', altResponse.status, altErrorText)
            throw new Error(`Redis SET failed: ${response.status} - ${errorText} (Alternative: ${altResponse.status} - ${altErrorText})`)
          }
        }
      } catch (error) {
        console.error('Error saving events to Redis:', error)
        res.status(500).json({ error: 'Failed to save events', details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
