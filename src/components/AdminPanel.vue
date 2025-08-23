<template>
  <!-- Admin Panel - Only show when explicitly opened -->
  <div v-if="isAdmin && isOpen" class="admin-panel bg-white border-l border-gray-200 fixed right-0 top-24 h-[calc(100vh-6rem)] w-96 shadow-xl z-40 transform transition-transform duration-300">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Admin Panel</h2>
        <button @click="closePanel" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">Loading admin data...</p>
      </div>

      <!-- Content (only show when not loading) -->
      <div v-else class="space-y-6">
        <!-- Navigation Tabs -->
        <div class="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors"
            :class="activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Content based on active tab -->
        <div class="space-y-6">
          <!-- Events Tab -->
          <div v-if="activeTab === 'events'" class="space-y-4">
            <!-- Status Display -->
            <div v-if="saveStatus" class="p-3 rounded-lg text-sm" :class="saveStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ saveStatus }}
            </div>
            

            
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Manage Events</h3>
              <div class="flex space-x-2">
                <button @click="showAddRecurringForm = true" class="btn-primary text-sm">
                  Add Recurring
                </button>
                <button @click="showAddSpecialForm = true" class="btn-primary text-sm">
                  Add Special
                </button>
              </div>
            </div>
            
            <!-- Add Recurring Event Form -->
            <div v-if="showAddRecurringForm" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 class="font-medium text-gray-900">Add Recurring Event</h4>
              <input v-model="newRecurringEvent.title" type="text" placeholder="Event Title (e.g., Sunday Walk)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <select v-model="newRecurringEvent.day" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Day</option>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
              <input v-model="newRecurringEvent.time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <textarea v-model="newRecurringEvent.message" placeholder="Optional message or description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <div class="flex space-x-2">
                <button @click="addRecurringEvent" class="btn-primary text-sm flex-1">Save Event</button>
                <button @click="showAddRecurringForm = false" class="btn-secondary text-sm flex-1">Cancel</button>
              </div>
            </div>

            <!-- Add Special Event Form -->
            <div v-if="showAddSpecialForm" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 class="font-medium text-gray-900">Add Special Event</h4>
              <input v-model="newSpecialEvent.title" type="text" placeholder="Event Title" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <input v-model="newSpecialEvent.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <input v-model="newSpecialEvent.time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <textarea v-model="newSpecialEvent.message" placeholder="Event description or message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <div class="flex space-x-2">
                <button @click="addSpecialEvent" class="btn-primary text-sm flex-1">Save Event</button>
                <button @click="showAddSpecialForm = false" class="btn-secondary text-sm flex-1">Cancel</button>
              </div>
            </div>

            <!-- Events List -->
            <div class="space-y-3">
              <!-- Recurring Events -->
              <div v-if="events.recurringEvents.length > 0">
                <h4 class="font-medium text-gray-700 mb-2 text-sm">Recurring Events</h4>
                <div class="space-y-2">
                  <div v-for="event in events.recurringEvents" :key="event.id" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ event.title }}</h5>
                        <p class="text-sm text-gray-600">{{ event.day }} at {{ event.time }}</p>
                        <p v-if="event.message" class="text-sm text-gray-600 mt-1">{{ event.message }}</p>
                      </div>
                      <button @click="deleteRecurringEvent(event.id)" class="text-red-600 hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Special Events -->
              <div v-if="events.specialEvents.length > 0">
                <h4 class="font-medium text-gray-700 mb-2 text-sm">Special Events</h4>
                <div class="space-y-2">
                  <div v-for="event in events.specialEvents" :key="event.id" class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ event.title }}</h5>
                        <p class="text-sm text-gray-600">{{ formatDate(event.date) }} at {{ event.time }}</p>
                        <p v-if="event.message" class="text-sm text-gray-600 mt-1">{{ event.message }}</p>
                      </div>
                      <button @click="deleteSpecialEvent(event.id)" class="text-red-600 hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Events Message -->
              <div v-if="events.recurringEvents.length === 0 && events.specialEvents.length === 0" class="text-center text-gray-500 py-8">
                <p>No events added yet.</p>
                <p class="text-sm">Add recurring or special events to get started.</p>
              </div>
            </div>
          </div>

          <!-- Photos Tab -->
          <div v-if="activeTab === 'photos'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Manage Photos</h3>
              <div class="flex space-x-2">
                <button @click="showAddGalleryForm = true" class="btn-primary text-sm">
                  Add Gallery
                </button>
                <button @click="showPhotoUpload = true" class="btn-primary text-sm">
                  Upload Photos
                </button>
              </div>
            </div>
            
            <!-- Add Gallery Form -->
            <div v-if="showAddGalleryForm" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 class="font-medium text-gray-900">Create New Gallery</h4>
              <input v-model="newGallery.title" type="text" placeholder="Gallery Title" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <textarea v-model="newGallery.description" placeholder="Gallery Description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <input v-model="newGallery.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <input v-model="newGallery.location" type="text" placeholder="Location (optional)" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <div class="flex space-x-2">
                <button @click="createGallery" class="btn-primary text-sm flex-1">Create Gallery</button>
                <button @click="showAddGalleryForm = false" class="btn-secondary text-sm flex-1">Cancel</button>
              </div>
            </div>
            
            <!-- Gallery Management -->
            <div class="space-y-6">
              <!-- Create New Gallery -->
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-blue-900 mb-3">Create New Gallery</h4>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-blue-700 mb-1">Title</label>
                    <input v-model="newGallery.title" type="text" placeholder="Gallery title" class="w-full px-2 py-1 border border-blue-300 rounded text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-blue-700 mb-1">Date</label>
                    <input v-model="newGallery.date" type="date" class="w-full px-2 py-1 border border-blue-300 rounded text-sm">
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs text-blue-700 mb-1">Description</label>
                    <input v-model="newGallery.description" type="text" placeholder="Gallery description" class="w-full px-2 py-1 border border-blue-300 rounded text-sm">
                  </div>
                  <div class="col-span-2">
                    <label class="block text-xs text-blue-700 mb-1">Location</label>
                    <input v-model="newGallery.location" type="text" placeholder="Location" class="w-full px-2 py-1 border border-blue-300 rounded text-sm">
                  </div>
                  <div class="col-span-2">
                    <button @click="createGallery" class="btn-primary text-sm w-full">Create Gallery</button>
                  </div>
                </div>
              </div>

              <!-- Existing Galleries -->
              <div v-if="galleries.length > 0" class="space-y-4">
                <h4 class="font-medium text-gray-700 mb-3">Manage Galleries</h4>
                <div class="space-y-4">
                  <div v-for="gallery in galleries" :key="gallery.id" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <!-- Gallery Header -->
                    <div class="flex justify-between items-start mb-3">
                      <div class="flex-1">
                        <h5 class="font-medium text-gray-900">{{ gallery.title }}</h5>
                        <p class="text-sm text-gray-600">{{ gallery.description }}</p>
                        <p class="text-sm text-gray-500">{{ formatDate(gallery.date) }} • {{ gallery.location }}</p>
                        <p class="text-xs text-gray-400">{{ gallery.images.length }} images</p>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="editGallery(gallery.id)" class="text-blue-600 hover:text-blue-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button @click="deleteGallery(gallery.id)" class="text-red-600 hover:text-red-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Add Photos to Gallery -->
                    <div class="mb-3 p-3 bg-white rounded border border-gray-200">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">Add Photos</span>
                        <button @click="showPhotoUploadForGallery(gallery.id)" class="text-sm text-blue-600 hover:text-blue-800">
                          {{ showPhotoUploadFor === gallery.id ? 'Cancel' : 'Add Photos' }}
                        </button>
                      </div>
                      
                      <div v-if="showPhotoUploadFor === gallery.id" class="space-y-3">
                        <input type="file" @change="handlePhotoUpload" multiple accept="image/*" class="w-full">
                        <div class="flex space-x-2">
                          <button @click="uploadPhotosToGallery(gallery.id)" class="btn-primary text-sm flex-1">Upload to Gallery</button>
                        </div>
                      </div>
                    </div>

                    <!-- Gallery Images -->
                    <div v-if="gallery.images.length > 0" class="grid grid-cols-3 gap-2">
                      <div v-for="(image, index) in gallery.images" :key="index" class="relative group">
                        <img :src="image" :alt="`${gallery.title} - Image ${index + 1}`" class="w-full h-20 object-cover rounded">
                        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <button @click="removeImageFromGallery(gallery.id, index)" class="text-white hover:text-red-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="text-center py-4 text-gray-500 text-sm">
                      No images in this gallery yet
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Galleries Message -->
              <div v-else class="text-center py-8 text-gray-500">
                <p>No galleries created yet.</p>
                <p class="text-sm">Create your first gallery above to get started!</p>
              </div>
            </div>
          </div>

          <!-- Content Tab -->
          <div v-if="activeTab === 'content'" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Manage Content</h3>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Club Description</label>
                <textarea v-model="content.clubDescription" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Walking Schedule</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Sunday Summer</label>
                    <input v-model="content.walkingSchedule.sundaySummer" type="time" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Sunday Winter</label>
                    <input v-model="content.walkingSchedule.sundayWinter" type="time" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Tuesday</label>
                    <input v-model="content.walkingSchedule.tuesday" type="time" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                  </div>
                </div>
              </div>
              
              <button @click="saveContent" class="btn-primary w-full">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { dataService, type EventsData, type ClubContent, type GalleryMeta } from '../services/dataService'

// Props
const props = defineProps<{
  isAdmin: boolean
  isOpen: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  eventsUpdated: [EventsData]
  contentUpdated: [ClubContent]
}>()

// Reactive data
const activeTab = ref('events')
const showAddRecurringForm = ref(false)
const showAddSpecialForm = ref(false)
const showPhotoUpload = ref(false)
const showAddGalleryForm = ref(false)
const showPhotoUploadFor = ref<string | null>(null)

// Tabs configuration
const tabs = [
  { id: 'events', name: 'Events' },
  { id: 'photos', name: 'Photos' },
  { id: 'content', name: 'Content' }
]

// Form data for recurring events
const newRecurringEvent = reactive({
  title: '',
  day: '',
  time: '',
  message: ''
})

// Form data for special events
const newSpecialEvent = reactive({
  title: '',
  date: '',
  time: '',
  message: ''
})

// Form data for new gallery
const newGallery = reactive({
  title: '',
  description: '',
  date: '',
  location: '',
  images: [] as string[]
})

// Data state
const events = ref<EventsData>({
  recurringEvents: [],
  specialEvents: []
})

const content = ref<ClubContent>({
  clubDescription: '',
  walkingSchedule: {
    sundaySummer: '09:00',
    sundayWinter: '09:30',
    tuesday: '10:00'
  },
  lastUpdated: new Date().toISOString()
})

const galleries = ref<GalleryMeta[]>([])
const photos = ref([
  { id: 1, url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Walking+Trail', title: 'Walking Trail' },
  { id: 2, url: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Club+Members', title: 'Club Members' }
])
const selectedFiles = ref<File[]>([])

// Loading states
const loading = ref(false)
const saveStatus = ref('')

// Load data on mount
onMounted(async () => {
  await loadData()
})

// Load all data
const loadData = async () => {
  console.log('🔄 AdminPanel: loadData() called')
  loading.value = true
  try {
    console.log('🔄 AdminPanel: Starting to load data from API...')
    console.log('🔄 AdminPanel: Current hostname:', window.location.hostname)
    
    const [eventsData, contentData, galleriesData] = await Promise.all([
      dataService.getEvents(),
      dataService.getContent(),
      dataService.getGalleries()
    ])
    
    console.log('🔄 AdminPanel: API responses received:', {
      eventsData,
      contentData,
      galleriesData
    })
    
    // Ensure events data is properly structured
    if (eventsData && typeof eventsData === 'object') {
      events.value = {
        recurringEvents: eventsData.recurringEvents || [],
        specialEvents: eventsData.specialEvents || []
      }
    } else {
      events.value = { recurringEvents: [], specialEvents: [] }
    }
    
    // Ensure content data is properly structured
    if (contentData && typeof contentData === 'object') {
      content.value = {
        clubDescription: contentData.clubDescription || '',
        walkingSchedule: {
          sundaySummer: contentData.walkingSchedule?.sundaySummer || '09:00',
          sundayWinter: contentData.walkingSchedule?.sundayWinter || '09:30',
          tuesday: contentData.walkingSchedule?.tuesday || '10:00'
        },
        lastUpdated: contentData.lastUpdated || new Date().toISOString()
      }
    } else {
      content.value = {
        clubDescription: '',
        walkingSchedule: {
          sundaySummer: '09:00',
          sundayWinter: '09:30',
          tuesday: '10:00'
        },
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Ensure galleries data is properly structured
    if (Array.isArray(galleriesData)) {
      galleries.value = galleriesData
    } else {
      galleries.value = []
    }
    
    // Fallback to localStorage if needed
    if (!events.value.recurringEvents.length && !events.value.specialEvents.length) {
      const storedEvents = dataService.getEventsFromStorage()
      if (storedEvents) {
        events.value = {
          recurringEvents: storedEvents.recurringEvents || [],
          specialEvents: storedEvents.specialEvents || []
        }
      }
    }
    
    if (!content.value.clubDescription) {
      const storedContent = dataService.getContentFromStorage()
      if (storedContent) {
        content.value = {
          clubDescription: storedContent.clubDescription || '',
          walkingSchedule: {
            sundaySummer: storedContent.walkingSchedule?.sundaySummer || '09:00',
            sundayWinter: storedContent.walkingSchedule?.sundayWinter || '09:30',
            tuesday: storedContent.walkingSchedule?.tuesday || '10:00'
          },
          lastUpdated: storedContent.lastUpdated || new Date().toISOString()
        }
      }
    }
    
    console.log('✅ Data loaded successfully:', { events: events.value, content: content.value })
  } catch (error) {
    console.error('❌ Error loading data:', error)
    // Ensure we have fallback data even on error
    events.value = { recurringEvents: [], specialEvents: [] }
    content.value = {
      clubDescription: '',
      walkingSchedule: {
        sundaySummer: '09:00',
        sundayWinter: '09:30',
        tuesday: '10:00'
      },
      lastUpdated: new Date().toISOString()
    }
    galleries.value = []
  } finally {
    loading.value = false
  }
}

// Save events
const saveEvents = async () => {
  try {
    console.log('🔄 AdminPanel: Starting to save events...')
    console.log('🔄 AdminPanel: Events data to save:', events.value)
    console.log('🔄 AdminPanel: Current hostname:', window.location.hostname)
    console.log('🔄 AdminPanel: Is production:', window.location.hostname !== 'localhost' && !window.location.hostname.includes('localhost'))
    
    const success = await dataService.saveEvents(events.value)
    
    console.log('🔄 AdminPanel: DataService.saveEvents result:', success)
    
    if (success) {
      saveStatus.value = 'Events saved successfully!'
      emit('eventsUpdated', events.value)
      console.log('✅ AdminPanel: Events saved successfully')
      setTimeout(() => saveStatus.value = '', 3000)
    } else {
      saveStatus.value = 'Failed to save events'
      console.error('❌ AdminPanel: Events save returned false')
    }
  } catch (error) {
    saveStatus.value = 'Error saving events'
    console.error('❌ AdminPanel: Error saving events:', error)
    console.error('❌ AdminPanel: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
  }
}

// Save content
const saveContent = async () => {
  try {
    console.log('🔄 AdminPanel: Starting to save content...')
    console.log('🔄 AdminPanel: Content data to save:', content.value)
    console.log('🔄 AdminPanel: Current hostname:', window.location.hostname)
    console.log('🔄 AdminPanel: Is production:', window.location.hostname !== 'localhost' && !window.location.hostname.includes('localhost'))
    
    content.value.lastUpdated = new Date().toISOString()
    const success = await dataService.saveContent(content.value)
    
    console.log('🔄 AdminPanel: DataService.saveContent result:', success)
    
    if (success) {
      saveStatus.value = 'Content saved successfully!'
      emit('contentUpdated', content.value)
      console.log('✅ AdminPanel: Content saved successfully')
      setTimeout(() => saveStatus.value = '', 3000)
    } else {
      saveStatus.value = 'Failed to save content'
      console.error('❌ AdminPanel: Content save returned false')
    }
  } catch (error) {
    saveStatus.value = 'Error saving content'
    console.error('❌ AdminPanel: Error saving content:', error)
    console.error('❌ AdminPanel: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
  }
}

// Add recurring event
const addRecurringEvent = () => {
  if (newRecurringEvent.title && newRecurringEvent.day && newRecurringEvent.time) {
    const event = {
      id: Date.now(),
      title: newRecurringEvent.title,
      day: newRecurringEvent.day,
      time: newRecurringEvent.time,
      message: newRecurringEvent.message
    }
    events.value.recurringEvents.push(event)
    
    // Reset form
    newRecurringEvent.title = ''
    newRecurringEvent.day = ''
    newRecurringEvent.time = ''
    newRecurringEvent.message = ''
    showAddRecurringForm.value = false
    
    // Auto-save
    saveEvents()
  }
}

// Add special event
const addSpecialEvent = () => {
  if (newSpecialEvent.title && newSpecialEvent.date && newSpecialEvent.time) {
    const event = {
      id: Date.now(),
      title: newSpecialEvent.title,
      date: newSpecialEvent.date,
      time: newSpecialEvent.time,
      message: newSpecialEvent.message
    }
    events.value.specialEvents.push(event)
    
    // Reset form
    newSpecialEvent.title = ''
    newSpecialEvent.date = ''
    newSpecialEvent.time = ''
    newSpecialEvent.message = ''
    showAddSpecialForm.value = false
    
    // Auto-save
    saveEvents()
  }
}

// Delete recurring event
const deleteRecurringEvent = (id: number) => {
  events.value.recurringEvents = events.value.recurringEvents.filter(event => event.id !== id)
  saveEvents()
}

// Delete special event
const deleteSpecialEvent = (id: number) => {
  events.value.specialEvents = events.value.specialEvents.filter(event => event.id !== id)
  saveEvents()
}

// Create new gallery
const createGallery = async () => {
  if (newGallery.title && newGallery.description && newGallery.date) {
    try {
      const galleryId = await dataService.createGallery(newGallery)
      
      // Reset form
      newGallery.title = ''
      newGallery.description = ''
      newGallery.date = ''
      newGallery.location = ''
      showAddGalleryForm.value = false
      
      // Reload galleries
      await loadData()
      
      saveStatus.value = `Gallery "${newGallery.title}" created successfully!`
      setTimeout(() => saveStatus.value = '', 3000)
    } catch (error) {
      saveStatus.value = 'Error creating gallery'
      console.error('Error creating gallery:', error)
    }
  }
}

// Delete gallery
const deleteGallery = async (id: string) => {
  try {
    await dataService.deleteGallery(id)
    saveStatus.value = `Gallery deleted successfully!`
    setTimeout(() => saveStatus.value = '', 3000)
    await loadData()
  } catch (error) {
    saveStatus.value = 'Error deleting gallery'
    console.error('Error deleting gallery:', error)
  }
}

// Edit gallery
const editGallery = (id: string) => {
  // TODO: Implement gallery editing
  console.log('Edit gallery:', id)
}

// Show photo upload for specific gallery
const showPhotoUploadForGallery = (galleryId: string) => {
  if (showPhotoUploadFor.value === galleryId) {
    showPhotoUploadFor.value = null
  } else {
    showPhotoUploadFor.value = galleryId
  }
}

// Upload photos to specific gallery
const uploadPhotosToGallery = async (galleryId: string) => {
  if (!selectedFiles.value.length) return
  
  try {
    loading.value = true
    saveStatus.value = 'Uploading images to gallery...'
    
    const uploadedImages = []
    
    for (const file of selectedFiles.value) {
      try {
        const result = await dataService.uploadImage(file)
        uploadedImages.push(result.url)
      } catch (error) {
        console.error('Failed to upload:', file.name, error)
      }
    }
    
    if (uploadedImages.length > 0) {
      // Add images to the specific gallery
      const gallery = galleries.value.find(g => g.id === galleryId)
      if (gallery) {
        const updatedImages = [...gallery.images, ...uploadedImages]
        const success = await dataService.updateGallery(galleryId, { images: updatedImages })
        
        if (success) {
          gallery.images = updatedImages
          saveStatus.value = `Successfully uploaded ${uploadedImages.length} images to gallery!`
          showPhotoUploadFor.value = null
          selectedFiles.value = []
        } else {
          saveStatus.value = 'Error saving gallery updates'
        }
      }
    } else {
      saveStatus.value = 'No images were uploaded successfully'
    }
  } catch (error) {
    saveStatus.value = 'Error uploading images to gallery'
    console.error('Upload error:', error)
  } finally {
    loading.value = false
    setTimeout(() => saveStatus.value = '', 3000)
  }
}

// Remove image from gallery
const removeImageFromGallery = async (galleryId: string, imageIndex: number) => {
  const gallery = galleries.value.find(g => g.id === galleryId)
  if (gallery && gallery.images[imageIndex]) {
    const updatedImages = [...gallery.images]
    updatedImages.splice(imageIndex, 1)
    
    const success = await dataService.updateGallery(galleryId, { images: updatedImages })
    
    if (success) {
      gallery.images = updatedImages
      saveStatus.value = 'Image removed from gallery'
    } else {
      saveStatus.value = 'Error removing image from gallery'
    }
    setTimeout(() => saveStatus.value = '', 3000)
  }
}

// Methods
const closePanel = () => {
  emit('close')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    // Store selected files for upload
    selectedFiles.value = Array.from(target.files)
    console.log('Files selected:', selectedFiles.value)
  }
}

const uploadPhotos = async () => {
  if (!selectedFiles.value.length) return
  
  try {
    loading.value = true
    saveStatus.value = 'Uploading images...'
    
    const uploadedImages = []
    
    for (const file of selectedFiles.value) {
      try {
        const result = await dataService.uploadImage(file)
        uploadedImages.push({
          url: result.url,
          filename: result.filename,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        })
      } catch (error) {
        console.error('Failed to upload:', file.name, error)
      }
    }
    
    if (uploadedImages.length > 0) {
      // Add to photos array
      photos.value.push(...uploadedImages.map((img, index) => ({
        id: Date.now() + index,
        ...img
      })))
      
      saveStatus.value = `Successfully uploaded ${uploadedImages.length} images!`
      showPhotoUpload.value = false
      selectedFiles.value = []
    } else {
      saveStatus.value = 'No images were uploaded successfully'
    }
  } catch (error) {
    saveStatus.value = 'Error uploading images'
    console.error('Upload error:', error)
  } finally {
    loading.value = false
    setTimeout(() => saveStatus.value = '', 3000)
  }
}

const deletePhoto = (id: number) => {
  photos.value = photos.value.filter(photo => photo.id !== id)
}


</script>




