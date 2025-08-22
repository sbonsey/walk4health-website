export interface RecurringEvent {
  id: number
  title: string
  day: string
  time: string
  message?: string
}

export interface SpecialEvent {
  id: number
  title: string
  date: string
  time: string
  message?: string
}

export interface EventsData {
  recurringEvents: RecurringEvent[]
  specialEvents: SpecialEvent[]
}

export interface ClubContent {
  clubDescription: string
  walkingSchedule: {
    sundaySummer: string
    sundayWinter: string
    tuesday: string
  }
  lastUpdated: string
}

export interface GalleryMeta {
  id: string
  title: string
  description: string
  date: string
  location: string
  images: string[]
  createdAt: string
}

class DataService {
  // Check if we're in production (Vercel)
  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('localhost')
  }

  // Events
  async getEvents(): Promise<EventsData> {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      return await response.json()
    } catch (error) {
      console.error('Error fetching events:', error)
      // Only fallback to localStorage in development
      if (!this.isProduction()) {
        const stored = this.getEventsFromStorage()
        if (stored) return stored
      }
      return {
        recurringEvents: [],
        specialEvents: []
      }
    }
  }

  async saveEvents(events: EventsData): Promise<boolean> {
    try {
      console.log('🔄 DataService: Attempting to save events via API...')
      console.log('🌐 Current hostname:', window.location.hostname)
      console.log('🏭 Production mode:', this.isProduction())
      console.log('🔗 API endpoint:', '/api/events')
      console.log('📊 Events data to save:', events)
      
      // Always try API first in production
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events)
      })
      
      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ API save successful:', result)
        // Only store in localStorage as backup in development
        if (!this.isProduction()) {
          localStorage.setItem('walk4health-events', JSON.stringify(events))
        }
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ API save failed:', response.status, errorText)
        console.error('❌ Full response:', response)
        throw new Error(`API save failed: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('❌ Error saving events via API:', error)
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      
      // Only fallback to localStorage in development
      if (!this.isProduction()) {
        console.log('🔄 Falling back to localStorage (development mode)...')
        localStorage.setItem('walk4health-events', JSON.stringify(events))
        return true
      } else {
        // In production, fail if API doesn't work
        throw error
      }
    }
  }

  // Content
  async getContent(): Promise<ClubContent> {
    try {
      const response = await fetch('/api/content')
      if (!response.ok) throw new Error('Failed to fetch content')
      return await response.json()
    } catch (error) {
      console.error('Error fetching content:', error)
      // Only fallback to localStorage in development
      if (!this.isProduction()) {
        const stored = this.getContentFromStorage()
        if (stored) return stored
      }
      return {
        clubDescription: 'In the Hutt Valley we are blessed with some of the best walking areas in New Zealand with the beautiful river trail, etc.',
        walkingSchedule: {
          sundaySummer: '09:00',
          sundayWinter: '09:30',
          tuesday: '10:00'
        },
        lastUpdated: new Date().toISOString()
      }
    }
  }

  async saveContent(content: ClubContent): Promise<boolean> {
    try {
      console.log('🔄 DataService: Attempting to save content via API...')
      console.log('🌐 Current hostname:', window.location.hostname)
      console.log('🏭 Production mode:', this.isProduction())
      console.log('🔗 API endpoint:', '/api/content')
      
      // Save via API (now using Vercel KV)
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      })
      
      if (response.ok) {
        console.log('✅ Content saved successfully via API')
        // Only store in localStorage as backup in development
        if (!this.isProduction()) {
          localStorage.setItem('walk4health-content', JSON.stringify(content))
        }
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ API save failed:', response.status, errorText)
        throw new Error(`API save failed: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error saving content via API:', error)
      
      // Only fallback to localStorage in development
      if (!this.isProduction()) {
        console.log('🔄 Falling back to localStorage (development mode)...')
        localStorage.setItem('walk4health-content', JSON.stringify(content))
        return true
      } else {
        // In production, fail if API doesn't work
        throw error
      }
    }
  }

  // Galleries
  async getGalleries(): Promise<GalleryMeta[]> {
    try {
      // In a real implementation, this would fetch from an API
      // For now, return sample data
      return [
        {
          id: 'gallery-1',
          title: 'Sunday Walk - Hutt Valley Trail',
          description: 'Beautiful morning walk along the Hutt Valley river trail with club members.',
          date: '2025-01-05',
          location: 'Hutt Valley, Lower Hutt',
          images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      ]
    } catch (error) {
      console.error('Error fetching galleries:', error)
      return []
    }
  }

  async createGallery(gallery: Omit<GalleryMeta, 'id' | 'createdAt'>): Promise<string> {
    try {
      const id = `gallery-${Date.now()}`
      const newGallery: GalleryMeta = {
        ...gallery,
        id,
        createdAt: new Date().toISOString()
      }
      
      console.log('Creating gallery:', newGallery)
      
      // Store in localStorage as fallback
      const galleries = JSON.parse(localStorage.getItem('walk4health-galleries') || '[]')
      galleries.push(newGallery)
      localStorage.setItem('walk4health-galleries', JSON.stringify(galleries))
      
      return id
    } catch (error) {
      console.error('Error creating gallery:', error)
      throw error
    }
  }

  async deleteGallery(id: string): Promise<boolean> {
    try {
      console.log('Deleting gallery:', id)
      
      // Remove from localStorage
      const galleries = JSON.parse(localStorage.getItem('walk4health-galleries') || '[]')
      const filteredGalleries = galleries.filter((g: GalleryMeta) => g.id !== id)
      localStorage.setItem('walk4health-galleries', JSON.stringify(filteredGalleries))
      
      return true
    } catch (error) {
      console.error('Error deleting gallery:', error)
      return false
    }
  }

  // Fallback to localStorage for offline/development
  getEventsFromStorage(): EventsData | null {
    try {
      const stored = localStorage.getItem('walk4health-events')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  getContentFromStorage(): ClubContent | null {
    try {
      const stored = localStorage.getItem('walk4health-content')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // Test API connection
  async testApiConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🧪 Testing API connection...')
      console.log('🌐 Current hostname:', window.location.hostname)
      
      const response = await fetch('/api/test')
      
      console.log('📡 Test API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API test successful:', data)
        return { success: true, data }
      } else {
        const errorText = await response.text()
        console.error('❌ API test failed:', response.status, errorText)
        return { success: false, error: `HTTP ${response.status}: ${errorText}` }
      }
    } catch (error) {
      console.error('❌ API test error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // Simple ping test to check if API is reachable
  async pingApi(): Promise<boolean> {
    try {
      console.log('🏓 Pinging API endpoint...')
      const response = await fetch('/api/test', { method: 'HEAD' })
      console.log('🏓 Ping response status:', response.status)
      return response.ok
    } catch (error) {
      console.error('🏓 Ping failed:', error)
      return false
    }
  }
}

export const dataService = new DataService()


