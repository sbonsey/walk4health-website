import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Get events from Vercel KV
        const events = await kv.get('walk4health:events')
        
        if (events) {
          res.status(200).json(events)
        } else {
          // Return default structure if no data exists
          const defaultData = {
            recurringEvents: [],
            specialEvents: []
          }
          res.status(200).json(defaultData)
        }
      } catch (error) {
        console.error('Error reading events from KV:', error)
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

        // Save to Vercel KV
        await kv.set('walk4health:events', eventsData)
        
        res.status(200).json({ success: true, message: 'Events saved successfully' })
      } catch (error) {
        console.error('Error saving events to KV:', error)
        res.status(500).json({ error: 'Failed to save events' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
