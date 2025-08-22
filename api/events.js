import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'public', 'data')

export default async function handler(req, res) {
  const { method } = req

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const eventsFile = path.join(dataDir, 'events.json')

  switch (method) {
    case 'GET':
      try {
        if (fs.existsSync(eventsFile)) {
          const data = fs.readFileSync(eventsFile, 'utf8')
          res.status(200).json(JSON.parse(data))
        } else {
          // Return default structure if file doesn't exist
          const defaultData = {
            recurringEvents: [],
            specialEvents: []
          }
          res.status(200).json(defaultData)
        }
      } catch (error) {
        console.error('Error reading events:', error)
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

        // Write to file
        fs.writeFileSync(eventsFile, JSON.stringify(eventsData, null, 2))
        
        res.status(200).json({ success: true, message: 'Events saved successfully' })
      } catch (error) {
        console.error('Error saving events:', error)
        res.status(500).json({ error: 'Failed to save events' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
