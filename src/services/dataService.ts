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
  committee: {
    title: string
    members: {
      position: string
      name: string
    }[]
  }
  walkingStats: {
    yearsActive: string
    members: string
    walksPerWeek: string
  }
  clubImageCaption: string
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
      console.log('🔄 DataService: getEvents() called')
      console.log('🌐 Current hostname:', window.location.hostname)
      console.log('🏭 Production mode:', this.isProduction())
      
      const response = await fetch('/api/events')
      console.log('🔄 DataService: getEvents API response status:', response.status)
      
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      console.log('🔄 DataService: getEvents API response data:', data)
      return data
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
      console.log('🔄 DataService: getContent() called')
      console.log('🌐 Current hostname:', window.location.hostname)
      console.log('🏭 Production mode:', this.isProduction())
      
      const response = await fetch('/api/content')
      console.log('🔄 DataService: getContent API response status:', response.status)
      
      if (!response.ok) throw new Error('Failed to fetch content')
      const data = await response.json()
      console.log('🔄 DataService: getContent API response data:', data)
      return data
    } catch (error) {
      console.error('Error fetching content:', error)
      // Only fallback to localStorage in development
      if (!this.isProduction()) {
        const stored = this.getContentFromStorage()
        if (stored) return stored
      }
      return {
        clubDescription: 'In the Hutt Valley we are blessed with some of the best walking areas in New Zealand with the beautiful river trail, etc.',
        committee: {
          title: 'Our Committee 2025/26',
          members: [
            { position: 'Chairperson', name: 'Lynn Young' },
            { position: 'Secretary', name: 'Neil Edwards' },
            { position: 'Treasurer', name: 'Nina Wortman' },
            { position: 'Membership', name: 'Andrew Young' },
            { position: 'Website & Sunday', name: 'Dave Morrell' },
            { position: 'Tuesday walking', name: 'Lyne Morrell, Ian Andrews, Patsie Barltrop' },
            { position: 'Events', name: 'Kaye Plunket' },
            { position: 'Financial Reviewer', name: 'Bob Metcalf' }
          ]
        },
        walkingStats: {
          yearsActive: '24',
          members: '50+',
          walksPerWeek: '2'
        },
        clubImageCaption: 'Walking together since 2001',
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
      if (this.isProduction()) {
        const response = await fetch('/api/galleries')
        if (response.ok) {
          return await response.json()
        } else {
          console.error('Failed to fetch galleries from API')
          return []
        }
      } else {
        // Development fallback
        const stored = localStorage.getItem('walk4health_galleries')
        return stored ? JSON.parse(stored) : []
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
      return []
    }
  }

  async createGallery(gallery: Omit<GalleryMeta, 'id' | 'createdAt'>): Promise<string> {
    try {
      if (this.isProduction()) {
        const response = await fetch('/api/galleries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gallery)
        })
        
        if (response.ok) {
          const result = await response.json()
          return result.gallery.id
        } else {
          throw new Error('Failed to create gallery')
        }
      } else {
        // Development fallback
        const newGallery: GalleryMeta = {
          ...gallery,
          id: `gallery-${Date.now()}`,
          createdAt: new Date().toISOString()
        }
        
        const existing = this.getGalleries()
        const updated = [...(await existing), newGallery]
        localStorage.setItem('walk4health_galleries', JSON.stringify(updated))
        
        return newGallery.id
      }
    } catch (error) {
      console.error('Error creating gallery:', error)
      throw new Error('Failed to create gallery')
    }
  }

  async deleteGallery(galleryId: string): Promise<boolean> {
    try {
      if (this.isProduction()) {
        const response = await fetch(`/api/galleries?galleryId=${galleryId}`, {
          method: 'DELETE'
        })
        return response.ok
      } else {
        // Development fallback
        const existing = this.getGalleries()
        const updated = (await existing).filter(g => g.id !== galleryId)
        localStorage.setItem('walk4health_galleries', JSON.stringify(updated))
        return true
      }
    } catch (error) {
      console.error('Error deleting gallery:', error)
      return false
    }
  }

  async updateGallery(galleryId: string, updates: Partial<GalleryMeta>): Promise<boolean> {
    try {
      if (this.isProduction()) {
        console.log('🔄 Updating gallery via API:', galleryId, updates)
        
        const response = await fetch(`/api/galleries?galleryId=${galleryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
        
        console.log('📡 API response status:', response.status)
        console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const result = await response.json()
          console.log('✅ API update success:', result)
          return true
        } else {
          const errorText = await response.text()
          console.error('❌ API update failed:', response.status, errorText)
          return false
        }
      } else {
        // Development fallback
        console.log('🔄 Updating gallery locally:', galleryId, updates)
        const existing = this.getGalleries()
        const galleries = await existing
        const index = galleries.findIndex(g => g.id === galleryId)
        if (index !== -1) {
          galleries[index] = { ...galleries[index], ...updates }
          localStorage.setItem('walk4health_galleries', JSON.stringify(galleries))
          console.log('✅ Local update success')
          return true
        }
        console.log('❌ Gallery not found locally')
        return false
      }
    } catch (error) {
      console.error('❌ Error updating gallery:', error)
      return false
    }
  }

  // Image upload
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    try {
      if (this.isProduction()) {
        // Convert file to base64 for API
        const base64 = await this.fileToBase64(file)
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
            contentType: file.type
          })
        })
        
        if (response.ok) {
          return await response.json()
        } else {
          throw new Error('Failed to upload image')
        }
      } else {
        // Development fallback - create local URL
        const url = URL.createObjectURL(file)
        return { url, filename: file.name }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
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


