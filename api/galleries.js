export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get galleries from Vercel KV (Upstash Redis)
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const response = await fetch(`${redisUrl}/get/walk4health:galleries`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.result) {
            const galleries = JSON.parse(result.result)
            res.status(200).json(galleries)
          } else {
            // Return empty array if no galleries exist
            res.status(200).json([])
          }
        } else {
          const errorText = await response.text()
          console.error('Redis GET failed:', response.status, errorText)
          throw new Error(`Redis GET failed: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error reading galleries from Redis:', error)
        res.status(500).json({ error: 'Failed to read galleries', details: error.message })
      }
      break

    case 'POST':
      try {
        const { title, description, date, location, images } = req.body
        
        // Validate data
        if (!title || !description || !date || !location) {
          return res.status(400).json({ error: 'Missing required fields' })
        }

        const galleryData = {
          id: `gallery-${Date.now()}`,
          title,
          description,
          date,
          location,
          images: images || [],
          createdAt: new Date().toISOString()
        }

        // Get existing galleries
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        // Get existing galleries first
        const getResponse = await fetch(`${redisUrl}/get/walk4health:galleries`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })

        let existingGalleries = []
        if (getResponse.ok) {
          const result = await getResponse.json()
          if (result.result) {
            existingGalleries = JSON.parse(result.result)
          }
        }

        // Add new gallery
        existingGalleries.push(galleryData)

        // Save updated galleries
        const saveResponse = await fetch(`${redisUrl}/set/walk4health:galleries`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(existingGalleries)
        })
        
        if (saveResponse.ok) {
          res.status(200).json({ 
            success: true, 
            message: 'Gallery created successfully',
            gallery: galleryData
          })
        } else {
          const errorText = await saveResponse.text()
          throw new Error(`Redis SET failed: ${saveResponse.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error creating gallery:', error)
        res.status(500).json({ error: 'Failed to create gallery', details: error.message })
      }
      break

    case 'DELETE':
      try {
        const { galleryId } = req.query
        
        if (!galleryId) {
          return res.status(400).json({ error: 'Missing gallery ID' })
        }

        // Get existing galleries
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const getResponse = await fetch(`${redisUrl}/get/walk4health:galleries`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })

        let existingGalleries = []
        if (getResponse.ok) {
          const result = await getResponse.json()
          if (result.result) {
            existingGalleries = JSON.parse(result.result)
          }
        }

        // Remove gallery by ID
        const updatedGalleries = existingGalleries.filter(gallery => gallery.id !== galleryId)

        // Save updated galleries
        const saveResponse = await fetch(`${redisUrl}/set/walk4health:galleries`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedGalleries)
        })
        
        if (saveResponse.ok) {
          res.status(200).json({ 
            success: true, 
            message: 'Gallery deleted successfully'
          })
        } else {
          const errorText = await saveResponse.text()
          throw new Error(`Redis SET failed: ${saveResponse.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error deleting gallery:', error)
        res.status(500).json({ error: 'Failed to delete gallery', details: error.message })
      }
      break

    case 'PUT':
      try {
        const { galleryId } = req.query
        const updates = req.body
        
        if (!galleryId) {
          return res.status(400).json({ error: 'Missing gallery ID' })
        }

        // Get existing galleries
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
        
        if (!redisUrl || !redisToken) {
          console.error('Redis environment variables not set')
          return res.status(500).json({ error: 'Redis not configured' })
        }

        const getResponse = await fetch(`${redisUrl}/get/walk4health:galleries`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`
          }
        })

        let existingGalleries = []
        if (getResponse.ok) {
          const result = await getResponse.json()
          if (result.result) {
            existingGalleries = JSON.parse(result.result)
          }
        }

        // Update gallery by ID
        const galleryIndex = existingGalleries.findIndex(g => g.id === galleryId)
        if (galleryIndex === -1) {
          return res.status(404).json({ error: 'Gallery not found' })
        }

        existingGalleries[galleryIndex] = { ...existingGalleries[galleryIndex], ...updates }

        // Save updated galleries
        const saveResponse = await fetch(`${redisUrl}/set/walk4health:galleries`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(existingGalleries)
        })
        
        if (saveResponse.ok) {
          res.status(200).json({ 
            success: true, 
            message: 'Gallery updated successfully'
          })
        } else {
          const errorText = await saveResponse.text()
          throw new Error(`Redis SET failed: ${saveResponse.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('Error updating gallery:', error)
        res.status(500).json({ error: 'Failed to update gallery', details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
