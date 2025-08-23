<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AdminPanel from './components/AdminPanel.vue'
import { dataService, type EventsData, type ClubContent, type GalleryMeta } from './services/dataService'

// Types
interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  galleryLink?: string
}

// Reactive data
const mobileMenuOpen = ref(false)
const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Loading state
const isLoading = ref(true)

// Admin authentication state
const isAdmin = ref(false)
const adminPanelOpen = ref(false)
const showLoginModal = ref(false)
const loginError = ref('')
const loginForm = ref({
  username: '',
  password: ''
})

// Event data - loaded from data service
const recurringEvents = ref<EventsData['recurringEvents']>([])
const specialEvents = ref<EventsData['specialEvents']>([])

// Club content - loaded from data service
const clubContent = ref<ClubContent>({
  clubDescription: '',
  walkingSchedule: {
    sundaySummer: '09:00',
    sundayWinter: '09:30',
    tuesday: '10:00'
  },
  lastUpdated: new Date().toISOString()
})

// Gallery data - loaded from data service
const galleries = ref<GalleryMeta[]>([])

// News data
const newsItems = ref<NewsItem[]>([
  {
    id: '1',
    title: 'Welcome to Walk4Health 2025!',
    content: 'We\'re excited to start another year of walking adventures in the beautiful Hutt Valley. Our club continues to grow with new members joining us every month.',
    date: '2025-01-15',
    galleryLink: undefined
  },
  {
    id: '2',
    title: 'New Walking Routes Added',
    content: 'We\'ve discovered some fantastic new walking trails in the Upper Hutt area. These routes offer stunning views and are perfect for all fitness levels.',
    date: '2025-01-10',
    galleryLink: undefined
  },
  {
    id: '3',
    title: 'Club Social Event Success',
    content: 'Our recent club social event was a huge success! Over 30 members attended and we enjoyed sharing stories and planning future walks together.',
    date: '2025-01-05',
    galleryLink: undefined
  }
])
const showAllNews = ref(false)

// Template refs
const eventsContainer = ref<HTMLElement>()
const galleriesContainer = ref<HTMLElement>()

// Computed properties for scroll buttons
const canScrollLeft = computed(() => {
  if (!eventsContainer.value) return false
  return eventsContainer.value.scrollLeft > 0
})

const canScrollRight = computed(() => {
  if (!eventsContainer.value) return false
  const maxScroll = eventsContainer.value.scrollWidth - eventsContainer.value.clientWidth
  return eventsContainer.value.scrollLeft < maxScroll
})

// Computed properties for gallery scroll buttons
const canScrollGalleriesLeft = computed(() => {
  if (!galleriesContainer.value) return false
  return galleriesContainer.value.scrollLeft > 0
})

const canScrollGalleriesRight = computed(() => {
  if (!galleriesContainer.value) return false
  const maxScroll = galleriesContainer.value.scrollWidth - galleriesContainer.value.clientWidth
  return galleriesContainer.value.scrollLeft < maxScroll
})

// Computed properties for news
const displayedNewsItems = computed(() => {
  return newsItems.value.slice(0, 3)
})

const additionalNewsItems = computed(() => {
  return newsItems.value.slice(3)
})

// Load data on mount
onMounted(async () => {
  await loadData()
  
  // Add keyboard navigation for lightbox
  const handleKeydown = (event: KeyboardEvent) => {
    if (!lightboxImage.value) return
    
    switch (event.key) {
      case 'Escape':
        closeLightbox()
        break
      case 'ArrowLeft':
        if (selectedGallery.value && lightboxIndex.value > 0) {
          previousImage()
        }
        break
      case 'ArrowRight':
        if (selectedGallery.value && lightboxIndex.value < selectedGallery.value.images.length - 1) {
          nextImage()
        }
        break
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

// Load all data from data service
const loadData = async () => {
  isLoading.value = true
  try {
    const [eventsData, contentData, galleriesData] = await Promise.all([
      dataService.getEvents(),
      dataService.getContent(),
      dataService.getGalleries()
    ])
    
    // Ensure events data is properly structured
    if (eventsData && typeof eventsData === 'object') {
      recurringEvents.value = eventsData.recurringEvents || []
      specialEvents.value = eventsData.specialEvents || []
    } else {
      recurringEvents.value = []
      specialEvents.value = []
    }
    
    // Ensure content data is properly structured
    if (contentData && typeof contentData === 'object') {
      clubContent.value = {
        clubDescription: contentData.clubDescription || '',
        walkingSchedule: {
          sundaySummer: contentData.walkingSchedule?.sundaySummer || '09:00',
          sundayWinter: contentData.walkingSchedule?.sundayWinter || '09:30',
          tuesday: contentData.walkingSchedule?.tuesday || '10:00'
        },
        lastUpdated: contentData.lastUpdated || new Date().toISOString()
      }
    } else {
      clubContent.value = {
        clubDescription: '',
        walkingSchedule: {
          sundaySummer: '09:00',
          sundayWinter: '09:30',
          tuesday: '10:00'
        },
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Fallback to localStorage if needed
    if (!recurringEvents.value.length && !specialEvents.value.length) {
      const storedEvents = dataService.getEventsFromStorage()
      if (storedEvents) {
        recurringEvents.value = storedEvents.recurringEvents || []
        specialEvents.value = storedEvents.specialEvents || []
      }
    }
    
    if (!clubContent.value.clubDescription) {
      const storedContent = dataService.getContentFromStorage()
      if (storedContent) {
        clubContent.value = {
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
    
    // Set galleries data
    galleries.value = galleriesData || []
    
    console.log('✅ App.vue: Data loaded successfully:', { 
      recurringEvents: recurringEvents.value, 
      specialEvents: specialEvents.value,
      clubContent: clubContent.value,
      galleries: galleries.value
    })
  } catch (error) {
    console.error('❌ App.vue: Error loading data:', error)
    // Ensure we have fallback data even on error
    recurringEvents.value = []
    specialEvents.value = []
    clubContent.value = {
      clubDescription: '',
      walkingSchedule: {
        sundaySummer: '09:00',
        sundayWinter: '09:30',
        tuesday: '10:00'
      },
      lastUpdated: new Date().toISOString()
    }
  } finally {
    isLoading.value = false
  }
}

// Handle events updates from admin panel
const handleEventsUpdated = (events: EventsData) => {
  recurringEvents.value = events.recurringEvents
  specialEvents.value = events.specialEvents
}

// Handle content updates from admin panel
const handleContentUpdated = (content: ClubContent) => {
  clubContent.value = content
}

// Handle galleries updates from admin panel
const handleGalleriesUpdated = (updatedGalleries: GalleryMeta[]) => {
  galleries.value = updatedGalleries
  console.log('✅ App.vue: Galleries updated from admin panel:', updatedGalleries)
}

// News methods
const formatNewsDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NZ', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
}

const toggleNewsExpansion = () => {
  showAllNews.value = !showAllNews.value
}

const openGalleryFromNews = (galleryId: string) => {
  const gallery = galleries.value.find(g => g.id === galleryId)
  if (gallery) {
    selectedGallery.value = gallery
  }
}

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const submitContactForm = () => {
  // Handle contact form submission
  console.log('Contact form submitted:', contactForm.value)
  // Reset form
  contactForm.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
}

const toggleAdminPanel = () => {
  adminPanelOpen.value = !adminPanelOpen.value
}

const closeLoginModal = () => {
  showLoginModal.value = false
  loginError.value = ''
  loginForm.value = { username: '', password: '' }
}

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Gallery methods
const openGallery = (gallery: GalleryMeta) => {
  selectedGallery.value = gallery
}

// Gallery modal state
const selectedGallery = ref<GalleryMeta | null>(null)
const lightboxImage = ref<string | null>(null)
const lightboxIndex = ref<number>(0)

const closeGalleryModal = () => {
  selectedGallery.value = null
  lightboxImage.value = null
  lightboxIndex.value = 0
}

const openImageLightbox = (image: string, index: number) => {
  lightboxImage.value = image
  lightboxIndex.value = index
}

const closeLightbox = () => {
  lightboxImage.value = null
  lightboxIndex.value = 0
}

const previousImage = () => {
  if (selectedGallery.value && lightboxIndex.value > 0) {
    lightboxIndex.value--
    lightboxImage.value = selectedGallery.value.images[lightboxIndex.value]
  }
}

const nextImage = () => {
  if (selectedGallery.value && lightboxIndex.value < selectedGallery.value.images.length - 1) {
    lightboxIndex.value++
    lightboxImage.value = selectedGallery.value.images[lightboxIndex.value]
  }
}

const scrollGalleries = (direction: 'left' | 'right') => {
  if (!galleriesContainer.value) return
  
  const scrollAmount = 400 // Adjust scroll distance as needed
  const currentScroll = galleriesContainer.value.scrollLeft
  
  if (direction === 'left') {
    galleriesContainer.value.scrollTo({
      left: currentScroll - scrollAmount,
      behavior: 'smooth'
    })
  } else {
    galleriesContainer.value.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    })
  }
}

const handleLogin = () => {
  // Simple authentication - in production, this would connect to a backend
  if (loginForm.value.username === 'admin' && loginForm.value.password === 'walk4health2025') {
    isAdmin.value = true
    showLoginModal.value = false
    loginError.value = ''
    loginForm.value = { username: '', password: '' }
  } else {
    loginError.value = 'Invalid username or password'
  }
}

const scrollEvents = (direction: 'left' | 'right') => {
  if (eventsContainer.value) {
    const scrollAmount = 400 // Adjust scroll amount as needed
    const currentScroll = eventsContainer.value.scrollLeft
    
    if (direction === 'left') {
      eventsContainer.value.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      })
    } else {
      eventsContainer.value.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }
}



const formatEventDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NZ', { 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-xl text-gray-600">Loading Walk4Health...</p>
    </div>
  </div>

  <!-- Main Content (only show when not loading) -->
  <div v-else>
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex justify-between items-center h-24">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-3xl font-light tracking-wide text-gray-800">WALK4HEALTH</h1>
          </div>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-12">
            <a href="#home" class="nav-item-elegant">HOME</a>
            <a href="#about" class="nav-item-elegant">ABOUT</a>
            <a href="#news" class="nav-item-elegant">NEWS</a>
            <a href="#events" class="nav-item-elegant">EVENTS</a>
            <a href="#gallery" class="nav-item-elegant">GALLERY</a>
            <a href="#contact" class="nav-item-elegant">CONTACT</a>
          </div>
          

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button @click="toggleMobileMenu" class="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Elegant Separator Line -->
        <div class="w-full h-px bg-gray-300"></div>
        
        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen" class="md:hidden py-8 bg-white/95 backdrop-blur-sm">
          <div class="flex flex-col space-y-6">
            <a href="#home" @click="closeMobileMenu" class="mobile-nav-item-elegant">HOME</a>
            <a href="#about" @click="closeMobileMenu" class="mobile-nav-item-elegant">ABOUT</a>
            <a href="#news" @click="closeMobileMenu" class="mobile-nav-item-elegant">NEWS</a>
            <a href="#events" @click="closeMobileMenu" class="mobile-nav-item-elegant">EVENTS</a>
            <a href="#gallery" @click="closeMobileMenu" class="mobile-nav-item-elegant">GALLERY</a>
            <a href="#contact" @click="closeMobileMenu" class="mobile-nav-item-elegant">CONTACT</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-24">
      <!-- Home Section -->
      <section id="home" class="section bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
          <img src="/src/assets/kitera-dent-jWv1ILisuSc-unsplash.jpg" 
               alt="Group of people walking together" 
               class="w-full h-full object-cover opacity-20">
        </div>
        
        <div class="container relative z-10">
          <div class="text-center">
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Walk4Health
            </h1>
            <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {{ clubContent.clubDescription }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#events" class="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200 shadow-lg">
                Join Our Walks
              </a>
              <a href="#contact" class="bg-white hover:bg-gray-50 text-gray-800 font-semibold text-lg px-8 py-4 rounded-lg border-2 border-gray-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200 shadow-lg">
                Get in Touch
              </a>
            </div>
          </div>
          
          <!-- Walking Schedule -->
          <div class="mt-16 grid md:grid-cols-2 gap-8">
            <div class="card bg-white/90 backdrop-blur-sm">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Sunday Walks</h3>
              </div>
              <p class="text-gray-600 mb-2">Summer: {{ clubContent.walkingSchedule.sundaySummer }}</p>
              <p class="text-gray-600 mb-2">Winter: {{ clubContent.walkingSchedule.sundayWinter }}</p>
              <p class="text-gray-600">Various locations around Hutt Valley</p>
            </div>
            <div class="card bg-white/90 backdrop-blur-sm">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Tuesday Walks</h3>
              </div>
              <p class="text-gray-600 mb-2">{{ clubContent.walkingSchedule.tuesday }}</p>
              <p class="text-gray-600">Lower Hutt, Upper Hutt, Petone, Wellington, Coast</p>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="section bg-white">
        <div class="container">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">About Our Club</h2>
          
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">24 Years of Walking</h3>
              <p class="text-gray-600 mb-6">
                {{ clubContent.clubDescription }}
              </p>
              
              <!-- Walking Stats -->
              <div class="grid grid-cols-3 gap-4 mt-8">
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary-600">24</div>
                  <div class="text-sm text-gray-600">Years Active</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary-600">50+</div>
                  <div class="text-sm text-gray-600">Members</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary-600">2</div>
                  <div class="text-sm text-gray-600">Walks/Week</div>
                </div>
              </div>
            </div>
            
            <div class="space-y-6">
              <!-- Club Image -->
              <div class="relative rounded-xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                     alt="Walking group on trail" 
                     class="w-full h-64 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-4 left-4 text-white">
                  <p class="text-sm font-medium">Walking together since 2001</p>
                </div>
              </div>
              
              <!-- Committee Info -->
              <div class="bg-primary-50 p-6 rounded-xl border border-primary-100">
                <h4 class="text-xl font-bold text-primary-800 mb-4">Our Committee 2025/26</h4>
                <div class="grid grid-cols-1 gap-2 text-primary-700 text-sm">
                  <div class="flex justify-between">
                    <span class="font-medium">Chairperson:</span>
                    <span>Lynn Young</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Secretary:</span>
                    <span>Neil Edwards</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Treasurer:</span>
                    <span>Nina Wortman</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Membership:</span>
                    <span>Andrew Young</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Website & Sunday:</span>
                    <span>Dave Morrell</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Tuesday walking:</span>
                    <span>Lyne Morrell, Ian Andrews, Patsie Barltrop</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Events:</span>
                    <span>Kaye Plunket</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Financial Reviewer:</span>
                    <span>Bob Metcalf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- News Section -->
      <section id="news" class="section bg-gray-50">
        <div class="container">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Latest News</h2>
          
          <!-- News Items -->
          <div v-if="newsItems.length > 0" class="space-y-6">
            <!-- First 3 News Items (Always Visible) -->
            <div v-for="(item, index) in displayedNewsItems" :key="item.id" 
                 class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <span class="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {{ formatNewsDate(item.date) }}
                    </span>
                    <span v-if="item.galleryLink" class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      📸 Gallery
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">{{ item.title }}</h3>
                  <p class="text-gray-600 leading-relaxed">{{ item.content }}</p>
                  
                  <!-- Gallery Link -->
                  <div v-if="item.galleryLink" class="mt-4">
                    <button @click="openGalleryFromNews(item.galleryLink)" 
                            class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path>
                      </svg>
                      View Related Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Show More Button -->
            <div v-if="newsItems.length > 3" class="text-center pt-6">
              <button @click="toggleNewsExpansion" 
                      class="btn-primary px-8 py-3 text-lg">
                {{ showAllNews ? 'Show Less' : `Show ${newsItems.length - 3} More News Items` }}
              </button>
            </div>
            
            <!-- Additional News Items (Hidden by Default) -->
            <div v-if="showAllNews" class="space-y-6">
              <div v-for="(item, index) in additionalNewsItems" :key="item.id" 
                   class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <span class="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        {{ formatNewsDate(item.date) }}
                      </span>
                      <span v-if="item.galleryLink" class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        📸 Gallery
                      </span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">{{ item.title }}</h3>
                    <p class="text-gray-600 leading-relaxed">{{ item.content }}</p>
                    
                    <!-- Gallery Link -->
                    <div v-if="item.galleryLink" class="mt-4">
                      <button @click="openGalleryFromNews(item.galleryLink)" 
                              class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path>
                        </svg>
                        View Related Gallery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-gray-500 text-lg">No news items yet</p>
            <p class="text-gray-400 text-sm">Check back soon for updates!</p>
          </div>
        </div>
      </section>

      <!-- Events Section -->
      <section id="events" class="section bg-gray-50">
        <div class="container">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Upcoming Events</h2>
          
          <!-- Events Container with Horizontal Scroll -->
          <div class="relative">
            <!-- Scroll Buttons for Desktop -->
            <button 
              v-if="canScrollLeft" 
              @click="scrollEvents('left')" 
              class="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              v-if="canScrollRight" 
              @click="scrollEvents('right')" 
              class="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <!-- Events Grid - Fixed width to show exactly 3 panels -->
            <div ref="eventsContainer" class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <!-- Recurring Events -->
              <div v-for="event in recurringEvents" :key="`recurring-${event.id}`" class="card group hover:shadow-xl transition-all duration-300 w-[calc(33.333%-1rem)] min-w-0 flex-shrink-0">
                <div class="relative mb-4">
                  <img src="/src/assets/upcoming-image-1.jpg" 
                       :alt="event.title" 
                       class="w-full h-48 object-cover rounded-lg">
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ event.title }}</h3>
                <p class="text-gray-600 mb-4">{{ event.message || `Join us for our regular ${event.day} walk around the beautiful Hutt Valley trails.` }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ event.time }}</span>
                  </div>
                  <button class="bg-white hover:bg-gray-50 text-primary-600 font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary-50 focus:outline-none text-sm">
                    Join Walk
                  </button>
                </div>
              </div>
              
              <!-- Special Events -->
              <div v-for="event in specialEvents" :key="`special-${event.id}`" class="card group hover:shadow-xl transition-all duration-300 w-[calc(33.333%-1rem)] min-w-0 flex-shrink-0">
                <div class="relative mb-4">
                  <img src="/src/assets/upcoming-image-3.jpg" 
                       :alt="event.title" 
                       class="w-full h-48 object-cover rounded-lg">
                  <div class="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {{ formatEventDate(event.date) }}
                  </div>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ event.title }}</h3>
                <p class="text-gray-600 mb-4">{{ event.message || 'Join us for this special walking event and community activity.' }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ event.time }}</span>
                  </div>
                  <button class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none text-sm">
                    More Info
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Scroll Indicator for Mobile -->
            <div class="lg:hidden flex justify-center mt-4 space-x-2">
              <div v-for="(_, index) in Math.ceil((recurringEvents.length + specialEvents.length) / 3)" :key="index" 
                   class="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section id="gallery" class="section bg-white">
        <div class="container">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Photo Gallery</h2>
          
          <!-- Dynamic Galleries with Horizontal Scrolling -->
          <div v-if="galleries.length > 0" class="relative">
            <!-- Gallery Cards Container -->
            <div ref="galleriesContainer" class="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              <div v-for="gallery in galleries" :key="gallery.id" 
                   class="flex-none w-[calc(33.333%-1rem)] min-w-0 cursor-pointer"
                   @click="openGallery(gallery)">
                <!-- Gallery Card -->
                <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <!-- Featured Image -->
                  <div class="aspect-[4/3] overflow-hidden">
                    <img v-if="gallery.images.length > 0" 
                         :src="gallery.images[0]" 
                         :alt="gallery.title"
                         class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
                    <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Gallery Info -->
                  <div class="p-4">
                    <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{{ gallery.title }}</h3>
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ gallery.description }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>{{ formatDate(gallery.date) }}</span>
                      <span>{{ gallery.images.length }} photos</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ gallery.location }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Scroll Arrows -->
            <button v-if="canScrollGalleriesLeft" 
                    @click="scrollGalleries('left')" 
                    class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0 z-10">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button v-if="canScrollGalleriesRight" 
                    @click="scrollGalleries('right')" 
                    class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0 z-10">
              <svg class="w-5 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <!-- Scroll Indicator for Mobile -->
            <div class="lg:hidden flex justify-center mt-4 space-x-2">
              <div v-for="(_, index) in Math.ceil(galleries.length / 3)" :key="index" 
                   class="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
          
          <!-- Fallback Gallery (when no galleries exist) -->
          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Walking Trail -->
            <div class="group relative overflow-hidden rounded-lg aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                   alt="Beautiful walking trail" 
                   class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div class="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="font-medium">Hutt Valley Trail</p>
                <p class="text-sm">Beautiful walking paths</p>
              </div>
            </div>
            
            <!-- Club Members -->
            <div class="group relative overflow-hidden rounded-lg aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                   alt="Club members walking" 
                   class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div class="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="font-medium">Club Members</p>
                <p class="text-sm">Walking together</p>
              </div>
            </div>
            
            <!-- Scenic View -->
            <div class="group relative overflow-hidden rounded-lg aspect-square cursor-pointer">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                   alt="Scenic mountain view" 
                   class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div class="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="font-medium">Mountain Views</p>
                <p class="text-sm">Stunning scenery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="section bg-gray-50">
        <div class="container">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
          
          <div class="grid md:grid-cols-2 gap-12">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              <div class="space-y-6">
                <div class="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 mb-1">Email</p>
                    <p class="text-gray-700 text-lg">walk4healthhutt@gmail.com</p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 mb-1">Phone</p>
                    <p class="text-gray-700 text-lg">Lynn Young (Chairperson): 021 0482790</p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 mb-1">Location</p>
                    <p class="text-gray-700 text-lg">Hutt Valley, New Zealand</p>
                    <p class="text-gray-700">Lower Hutt, Upper Hutt, Petone, Wellington, Coast</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card bg-white shadow-lg">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Send us a Message</h3>
              <form @submit.prevent="submitContactForm" class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-semibold text-gray-800 mb-2">Name</label>
                  <input type="text" id="name" v-model="contactForm.name" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500">
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                  <input type="email" id="email" v-model="contactForm.email" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500">
                </div>
                
                <div>
                  <label for="subject" class="block text-sm font-semibold text-gray-800 mb-2">Subject</label>
                  <select id="subject" v-model="contactForm.subject" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900">
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="membership">Membership Question</option>
                    <option value="event">Event Information</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label for="message" class="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                  <textarea id="message" v-model="contactForm.message" rows="4" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"></textarea>
                </div>
                
                <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 text-base">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Gallery Detail Modal -->
    <div v-if="selectedGallery" 
         class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
         @click="closeGalleryModal">
      <!-- Modal Content -->
      <div class="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
           @click.stop>
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">{{ selectedGallery.title }}</h2>
              <p class="text-orange-100 mb-1">{{ selectedGallery.description }}</p>
              <div class="flex items-center space-x-4 text-sm text-orange-100">
                <span>{{ formatDate(selectedGallery.date) }}</span>
                <span>•</span>
                <span>{{ selectedGallery.location }}</span>
                <span>•</span>
                <span>{{ selectedGallery.images.length }} photos</span>
              </div>
            </div>
            <button @click="closeGalleryModal" 
                    class="text-white hover:text-orange-100 p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Gallery Images Grid -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div v-if="selectedGallery && selectedGallery.images.length > 0" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="(image, index) in selectedGallery.images" :key="index" 
                 class="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
                 @click="openImageLightbox(image, index)">
              <img :src="image" 
                   :alt="`${selectedGallery.title} - Image ${index + 1}`"
                   class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {{ index + 1 }}
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-gray-500 text-lg">No photos in this gallery yet</p>
            <p class="text-gray-400 text-sm">Add some photos through the admin panel</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Image Lightbox Modal -->
    <div v-if="lightboxImage" 
         class="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4"
         @click="closeLightbox">
      <div class="relative max-w-7xl max-h-[90vh]">
        <!-- Navigation Arrows -->
        <button v-if="lightboxIndex > 0" 
                @click="previousImage"
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button v-if="selectedGallery && lightboxIndex < selectedGallery.images.length - 1" 
                @click="nextImage"
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        <!-- Close Button -->
        <button @click="closeLightbox" 
                class="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Image Counter -->
        <div class="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
          {{ lightboxIndex + 1 }} / {{ selectedGallery?.images.length || 0 }}
        </div>
        
        <!-- Main Image -->
        <img :src="lightboxImage" 
             :alt="`${selectedGallery?.title || 'Gallery'} - Image ${lightboxIndex + 1}`"
             class="max-w-full max-h-[90vh] object-contain rounded-lg">
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
      <div class="container text-center">
        <p>&copy; 2025 Walk4Health | 24 Years of Walking in the Hutt Valley</p>
      </div>
    </footer>

    <!-- Admin Panel -->
    <AdminPanel 
      :is-admin="isAdmin" 
      :is-open="adminPanelOpen"
      :galleries="galleries"
      @close="adminPanelOpen = false"
      @events-updated="handleEventsUpdated"
      @content-updated="handleContentUpdated"
      @galleries-updated="handleGalleriesUpdated"
    />

    <!-- Admin Login Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Admin Login</h3>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              v-model="loginForm.username" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
          </div>
          
          <div v-if="loginError" class="text-red-600 text-sm">{{ loginError }}</div>
          
          <div class="flex space-x-3">
            <button type="submit" class="btn-primary flex-1">Login</button>
            <button type="button" @click="closeLoginModal" class="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Admin Toggle Button - Show when admin IS logged in -->
    <button 
      v-if="isAdmin"
      @click="toggleAdminPanel" 
      class="fixed right-4 top-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
      title="Toggle Admin Panel"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>

    <!-- Admin Login Button - Show when admin is NOT logged in -->
    <button 
      v-else
      @click="showLoginModal = true" 
      class="fixed right-4 top-4 z-40 bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
      title="Admin Login"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
      </svg>
    </button>


  </div>
</template>


