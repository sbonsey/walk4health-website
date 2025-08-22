export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get events from Upstash Redis
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/get/walk4health:events`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.result) {
            res.status(200).json(JSON.parse(result.result))
          } else {
            // Return default structure if no data exists
            const defaultData = {
              recurringEvents: [],
              specialEvents: []
            }
            res.status(200).json(defaultData)
          }
        } else {
          throw new Error(`Redis GET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error reading events from Redis:', error)
        res.status(500).json({ error: 'Failed to read events' })
      }
      break

    case 'POST':
      try {
        const { recurringEvents, specialEvents } = req.body
        
        // Validate data
        if (!Array.isArray(recurringEvents) || !Array.isArray(specialEvents)) {
          return res.status(400).json({ error: 'Invalid data format' })
        }

        const eventsData = {
          recurringEvents,
          specialEvents,
          lastUpdated: new Date().toISOString()
        }

        // Save to Upstash Redis
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/set/walk4health:events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(JSON.stringify(eventsData))
        })
        
        if (response.ok) {
          res.status(200).json({ success: true, message: 'Events saved successfully' })
        } else {
          throw new Error(`Redis SET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error saving events to Redis:', error)
        res.status(500).json({ error: 'Failed to save events' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
