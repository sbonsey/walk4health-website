import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get content from Vercel KV
        const content = await kv.get('walk4health:content')
        
        if (content) {
          res.status(200).json(content)
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
      } catch (error) {
        console.error('Error reading content from KV:', error)
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

        // Save to Vercel KV
        await kv.set('walk4health:content', contentData)
        
        res.status(200).json({ success: true, message: 'Content saved successfully' })
      } catch (error) {
        console.error('Error saving content to KV:', error)
        res.status(500).json({ error: 'Failed to save content' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
