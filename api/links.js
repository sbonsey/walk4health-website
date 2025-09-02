export default async function handler(req, res) {
  const { method } = req

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return res.status(500).json({ error: 'Redis not configured' })
  }

  switch (method) {
    case 'GET':
      try {
        const response = await fetch(`${redisUrl}/get/walk4health:links`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.result) {
            const data = JSON.parse(result.result)
            res.status(200).json({ links: data.links || [] })
          } else {
            res.status(200).json({ links: [] })
          }
        } else {
          const errorText = await response.text()
          throw new Error(`Redis GET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to read links', details: error.message })
      }
      break

    case 'POST':
      try {
        const { links } = req.body
        if (!Array.isArray(links)) {
          return res.status(400).json({ error: 'Missing required field: links array' })
        }

        const payload = { links, lastUpdated: new Date().toISOString() }

        const response = await fetch(`${redisUrl}/set/walk4health:links`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          res.status(200).json({ success: true, message: 'Links saved successfully' })
        } else {
          const errorText = await response.text()
          throw new Error(`Redis SET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to save links', details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}


