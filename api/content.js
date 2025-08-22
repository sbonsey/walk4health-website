import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'public', 'data')

export default async function handler(req, res) {
  const { method } = req

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const contentFile = path.join(dataDir, 'content.json')

  switch (method) {
    case 'GET':
      try {
        if (fs.existsSync(contentFile)) {
          const data = fs.readFileSync(contentFile, 'utf8')
          res.status(200).json(JSON.parse(data))
        } else {
          // Return default structure if file doesn't exist
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
        console.error('Error reading content:', error)
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

        // Write to file
        fs.writeFileSync(contentFile, JSON.stringify(contentData, null, 2))
        
        res.status(200).json({ success: true, message: 'Content saved successfully' })
      } catch (error) {
        console.error('Error saving content:', error)
        res.status(500).json({ error: 'Failed to save content' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
