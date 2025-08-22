export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get content from Upstash Redis
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/get/walk4health:content`, {
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
              clubDescription: 'In the Hutt Valley we are blessed with some of the best walking areas in New Zealand with the beautiful river trail, etc.',
              walkingSchedule: {
                sundaySummer: '09:00',
                sundayWinter: '09:30',
                tuesday: '10:00'
              },
              lastUpdated: new Date().toISOString()
            }
            res.status(200).json(defaultData)
          }
        } else {
          throw new Error(`Redis GET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error reading content from Redis:', error)
        res.status(500).json({ error: 'Failed to read content' })
      }
      break

    case 'POST':
      try {
        const { clubDescription, walkingSchedule } = req.body
        
        // Validate data
        if (!clubDescription || !walkingSchedule) {
          return res.status(400).json({ error: 'Missing required fields' })
        }

        const contentData = {
          clubDescription,
          walkingSchedule,
          lastUpdated: new Date().toISOString()
        }

        // Save to Upstash Redis
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/set/walk4health:content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(JSON.stringify(contentData))
        })
        
        if (response.ok) {
          res.status(200).json({ success: true, message: 'Content saved successfully' })
        } else {
          throw new Error(`Redis SET failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Error saving content to Redis:', error)
        res.status(500).json({ error: 'Failed to save content' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
