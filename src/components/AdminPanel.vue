<template>
  <!-- Admin Panel - Only show when explicitly opened -->
  <div v-if="isAdmin && isOpen" class="admin-panel bg-white border-l border-gray-200 fixed inset-0 md:right-0 md:left-auto md:top-24 md:h-[calc(100vh-6rem)] w-full md:w-[32rem] shadow-xl z-[70] transform transition-transform duration-300">
    <div class="p-4 md:p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Admin Panel</h2>
        <button @click="closePanel" class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Close Button (Full Width) -->
      <div class="md:hidden mb-4">
        <button @click="closePanel" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Close Admin Panel</span>
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
        <div class="flex flex-col md:flex-row md:space-x-1 space-y-1 md:space-y-0 mb-6 bg-gray-100 rounded-lg p-1">
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
            

            
            <div class="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
              <h3 class="text-lg font-semibold text-gray-900">Manage Events</h3>
              <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
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
              <div v-if="newRecurringEvent.time" class="text-xs text-gray-500">
                Will display as: {{ formatTime(newRecurringEvent.time) }}
              </div>
              <textarea v-model="newRecurringEvent.message" placeholder="Optional message or description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
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
              <div v-if="newSpecialEvent.time" class="text-xs text-gray-500">
                Will display as: {{ formatTime(newSpecialEvent.time) }}
              </div>
              <textarea v-model="newSpecialEvent.message" placeholder="Event description or message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
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
                    <!-- Edit Form (when editing) -->
                    <div v-if="editingRecurringEvent?.id === event.id" class="space-y-3">
                      <h5 class="font-medium text-gray-900">Edit Recurring Event</h5>
                      <input v-model="editingRecurringEvent.title" type="text" placeholder="Event Title" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                      <select v-model="editingRecurringEvent.day" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                      <input v-model="editingRecurringEvent.time" type="time" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                      <div v-if="editingRecurringEvent.time" class="text-xs text-gray-500">
                        Will display as: {{ formatTime(editingRecurringEvent.time) }}
                      </div>
                      <textarea v-model="editingRecurringEvent.message" placeholder="Optional message" rows="2" class="w-full px-2 py-1 border border-gray-300 rounded text-sm"></textarea>
                      <div class="flex space-x-2">
                        <button @click="saveRecurringEventEdit" class="btn-primary text-xs">Save</button>
                        <button @click="cancelRecurringEventEdit" class="btn-secondary text-xs">Cancel</button>
                      </div>
                    </div>
                    
                    <!-- Display View (when not editing) -->
                    <div v-else class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ event.title }}</h5>
                        <p class="text-sm text-gray-600">{{ capitalizeDay(event.day) }} at {{ formatTime(event.time) }}</p>
                        <p v-if="event.message" class="text-sm text-gray-600 mt-1">{{ event.message }}</p>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="editRecurringEvent(event)" class="text-blue-600 hover:text-blue-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button @click="deleteRecurringEvent(event.id)" class="text-red-600 hover:text-red-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Special Events -->
              <div v-if="events.specialEvents.length > 0">
                <h4 class="font-medium text-gray-700 mb-2 text-sm">Special Events</h4>
                <div class="space-y-2">
                  <div v-for="event in events.specialEvents" :key="event.id" class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <!-- Edit Form (when editing) -->
                    <div v-if="editingSpecialEvent?.id === event.id" class="space-y-3">
                      <h5 class="font-medium text-gray-900">Edit Special Event</h5>
                      <input v-model="editingSpecialEvent.title" type="text" placeholder="Event Title" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                      <input v-model="editingSpecialEvent.date" type="date" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                      <input v-model="editingSpecialEvent.time" type="time" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                      <div v-if="editingSpecialEvent.time" class="text-xs text-gray-500">
                        Will display as: {{ formatTime(editingSpecialEvent.time) }}
                      </div>
                      <textarea v-model="editingSpecialEvent.message" placeholder="Event description" rows="2" class="w-full px-2 py-1 border border-gray-300 rounded text-sm"></textarea>
                      <div class="flex space-x-2">
                        <button @click="saveSpecialEventEdit" class="btn-primary text-xs">Save</button>
                        <button @click="cancelSpecialEventEdit" class="btn-secondary text-xs">Cancel</button>
                      </div>
                    </div>
                    
                    <!-- Display View (when not editing) -->
                    <div v-else class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ event.title }}</h5>
                        <p class="text-sm text-gray-600">{{ formatDate(event.date) }} at {{ formatTime(event.time) }}</p>
                        <p v-if="event.message" class="text-sm text-gray-600 mt-1">{{ event.message }}</p>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="editSpecialEvent(event)" class="text-blue-600 hover:text-blue-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button @click="deleteSpecialEvent(event.id)" class="text-red-600 hover:text-red-800">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
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

          <!-- News Tab -->
          <div v-if="activeTab === 'news'" class="space-y-4">
            <!-- Status Display -->
            <div v-if="saveStatus" class="p-3 rounded-lg text-sm" :class="saveStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ saveStatus }}
            </div>
            
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Manage News</h3>
              <button @click="showAddNewsForm = true" class="btn-primary text-sm">
                Add News Item
              </button>
            </div>
            
            <!-- Add News Form -->
            <div v-if="showAddNewsForm" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 class="font-medium text-gray-900">Add News Item</h4>
              <input v-model="newNewsItem.title" type="text" placeholder="News Title" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <textarea v-model="newNewsItem.content" placeholder="News content" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              <input v-model="newNewsItem.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <select v-model="newNewsItem.galleryLink" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">No Gallery Link (Optional)</option>
                <option v-for="gallery in galleries" :key="gallery.id" :value="gallery.id">
                  {{ gallery.title }}
                </option>
              </select>
              <div class="flex space-x-2">
                <button @click="createNewsItem" class="btn-primary text-sm flex-1">Save News</button>
                <button @click="showAddNewsForm = false" class="btn-secondary text-sm flex-1">Cancel</button>
              </div>
            </div>
            
            <!-- News List -->
            <div class="space-y-3">
              <div v-if="newsItems.length > 0">
                <h4 class="font-medium text-gray-700 mb-2 text-sm">News Items</h4>
                <div class="space-y-2">
                  <div v-for="item in newsItems" :key="item.id" class="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ item.title }}</h5>
                        <p class="text-sm text-gray-600">{{ formatDate(item.date) }}</p>
                        <p class="text-sm text-gray-600 mt-1">{{ item.content }}</p>
                        <p v-if="item.galleryLink" class="text-xs text-blue-600 mt-1">
                          📸 Linked to gallery: {{ galleries.find(g => g.id === item.galleryLink)?.title }}
                        </p>
                      </div>
                      <button @click="deleteNewsItem(item.id)" class="text-red-600 hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <p>No news items added yet.</p>
                <p class="text-sm">Add news items to keep members updated.</p>
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
              <!-- Debug Info -->
              <!-- <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                <h4 class="font-medium text-yellow-900 mb-2">Debug Info</h4>
                <p class="text-xs text-yellow-700">Galleries loaded: {{ galleries.length }}</p>
                <p class="text-xs text-yellow-700">Total images: {{ galleries.reduce((sum, g) => sum + g.images.length, 0) }}</p>
                <button @click="debugGalleries" class="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded">
                  Debug Galleries
                </button>
              </div> -->

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
                        <div class="space-y-2">
                          <input 
                            type="file" 
                            @change="handlePhotoUpload" 
                            multiple 
                            accept="image/*" 
                            class="w-full"
                            :disabled="loading"
                          >
                          <div class="text-xs text-gray-500">
                            <p>• Maximum file size: 10MB per image</p>
                            <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                            <p>• Images will be automatically compressed and optimized</p>
                          </div>
                        </div>
                        
                        <!-- File Selection Info -->
                        <div v-if="selectedFiles.length > 0" class="bg-gray-50 p-3 rounded-lg">
                          <p class="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                          <div class="space-y-1">
                            <div v-for="file in selectedFiles" :key="file.name" class="flex items-center justify-between text-xs">
                              <span class="text-gray-600">{{ file.name }}</span>
                              <span class="text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }}MB</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex space-x-2">
                          <button 
                            @click="uploadPhotosToGallery(gallery.id)" 
                            :disabled="loading || selectedFiles.length === 0"
                            class="btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {{ loading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}` }}
                          </button>
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
            <h3 class="text-lg font-semibold text-gray-900">Manage Club Content</h3>
            
            <!-- Status Display -->
            <div v-if="saveStatus" class="p-3 rounded-lg text-sm" :class="saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ saveStatus }}
            </div>
            
            <div class="space-y-6">
              <!-- Club Mission -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Club Mission</label>
                <textarea v-model="content.clubMission" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="What is your club's mission?"></textarea>
              </div>
              
              <!-- Club Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Club Description (About Our Club)</label>
                <textarea v-model="content.clubDescription" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Describe your walking club..."></textarea>
              </div>
              
              <!-- Committee Management -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Committee Title</label>
                <input v-model="content.committee!.title" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Our Committee 2025/26">
                
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Committee Members</label>
                  <div class="space-y-3">
                    <div v-for="(member, index) in content.committee!.members" :key="index" class="flex gap-2 items-center">
                      <input v-model="member.position" type="text" placeholder="Position" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                      <input v-model="member.name" type="text" placeholder="Name" class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                      <button @click="removeCommitteeMember(index)" class="text-red-600 hover:text-red-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    <button @click="addCommitteeMember" class="btn-secondary text-sm">Add Member</button>
                  </div>
                </div>
              </div>
              
              <!-- Walking Stats -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-3">Walking Statistics</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Years Active</label>
                    <input v-model="content.walkingStats!.yearsActive" type="text" class="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., 24">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Members</label>
                    <input v-model="content.walkingStats!.members" type="text" class="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="50+">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Walks/Week</label>
                    <input v-model="content.walkingStats!.walksPerWeek" type="text" class="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="2">
                  </div>
                </div>
              </div>
              
              <!-- Club Image Caption -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Club Image Caption</label>
                <input v-model="content.clubImageCaption" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Walking together since 2001">
              </div>
              
              <button @click="saveContent" class="btn-primary w-full">Save Changes</button>
            </div>
          </div>

          <!-- Email Configuration Tab -->
          <div v-if="activeTab === 'email'" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Email Configuration</h3>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Inquiry Email Address</label>
                <input v-model="emailConfig.inquiryEmail" type="email" placeholder="admin@walk4health.co.nz" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <p class="text-xs text-gray-500 mt-1">This email will receive all contact form inquiries from the website.</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Subject Prefix</label>
                <input v-model="emailConfig.subjectPrefix" type="text" placeholder="[Walk4Health]" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <p class="text-xs text-gray-500 mt-1">Optional prefix for inquiry emails (e.g., [Walk4Health] General Inquiry)</p>
              </div>
              
              <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 class="font-medium text-blue-900 mb-2">Email Test</h4>
                <p class="text-sm text-blue-700 mb-3">Test if your email configuration is working by sending a test email.</p>
                <button @click="testEmail" class="btn-secondary text-sm">Send Test Email</button>
                <div v-if="emailTestResult" class="mt-2 text-xs">
                  <div class="bg-white p-2 rounded border">
                    <span class="font-medium">Test Result:</span> 
                    <span :class="emailTestResult.success ? 'text-green-600' : 'text-red-600'">
                      {{ emailTestResult.success ? '✅ Email sent successfully' : '❌ Email failed' }}
                    </span>
                    <div v-if="emailTestResult.error" class="text-red-600 mt-1">{{ emailTestResult.error }}</div>
                  </div>
                </div>
              </div>
              
              <button @click="saveEmailConfig" class="btn-primary w-full">Save Email Configuration</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { dataService, type EventsData, type ClubContent, type GalleryMeta } from '../services/dataService'

// Types
interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  galleryLink?: string
}

// Props
const props = defineProps<{
  isAdmin: boolean
  isOpen: boolean
  galleries: GalleryMeta[]
  events: EventsData
  news: NewsItem[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  eventsUpdated: [EventsData]
  'content-updated': [ClubContent]
  galleriesUpdated: [GalleryMeta[]]
  newsUpdated: [NewsItem[]]
}>()

// Reactive data
const activeTab = ref('events')
const showAddRecurringForm = ref(false)
const showAddSpecialForm = ref(false)
const showPhotoUpload = ref(false)
const showAddGalleryForm = ref(false)
const showPhotoUploadFor = ref<string | null>(null)
const showAddNewsForm = ref(false)

// Event editing state
const editingRecurringEvent = ref<any>(null)
const editingSpecialEvent = ref<any>(null)

// Tabs configuration
const tabs = [
  { id: 'events', name: 'Events' },
  { id: 'news', name: 'News' },
  { id: 'photos', name: 'Photos' },
  { id: 'content', name: 'Content' },
  { id: 'email', name: 'Email' }
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

// Form data for new news item
const newNewsItem = reactive({
  title: '',
  content: '',
  date: '',
  galleryLink: ''
})

// Data state - local events that sync with props
const events = ref<EventsData>({
  recurringEvents: [],
  specialEvents: []
})

// Watch for prop changes and sync local state
watch(() => props.events, (newEvents) => {
  if (newEvents) {
    events.value = { ...newEvents }
  }
}, { immediate: true })

const content = ref<ClubContent>({
  clubMission: '',
  clubDescription: '',
  walkingSchedule: {
    sundaySummer: '',
    sundayWinter: '',
    tuesday: ''
  },
  committee: {
    title: '',
    members: []
  },
  walkingStats: {
    yearsActive: '',
    members: '',
    walksPerWeek: ''
  },
  clubImageCaption: '',
  lastUpdated: new Date().toISOString()
})

// Local galleries state that syncs with props
const galleries = ref<GalleryMeta[]>([])

// Watch for prop changes and sync local state
watch(() => props.galleries, (newGalleries) => {
  galleries.value = [...newGalleries]
}, { immediate: true })

// News data - local news that syncs with props
const newsItems = ref<NewsItem[]>([])

// Watch for news prop changes and sync local state
watch(() => props.news, (newNews) => {
  if (newNews) {
    newsItems.value = [...newNews]
  }
}, { immediate: true })
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
    
    const [eventsData, contentData, galleriesData, emailConfigData] = await Promise.all([
      dataService.getEvents(),
      dataService.getContent(),
      dataService.getGalleries(),
      dataService.getEmailConfig()
    ])
    
    console.log('🔄 AdminPanel: API responses received:', {
      eventsData,
      contentData,
      galleriesData,
      emailConfigData
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
        clubMission: contentData.clubMission || '',
        clubDescription: contentData.clubDescription || '',
        walkingSchedule: {
          sundaySummer: contentData.walkingSchedule?.sundaySummer || '',
          sundayWinter: contentData.walkingSchedule?.sundayWinter || '',
          tuesday: contentData.walkingSchedule?.tuesday || ''
        },
        committee: contentData.committee || {
          title: '',
          members: []
        },
        walkingStats: contentData.walkingStats || {
          yearsActive: '',
          members: '',
          walksPerWeek: ''
        },
        clubImageCaption: contentData.clubImageCaption || '',
        lastUpdated: contentData.lastUpdated || new Date().toISOString()
      }
    } else {
      content.value = {
        clubMission: '',
        clubDescription: '',
        walkingSchedule: {
          sundaySummer: '',
          sundayWinter: '',
          tuesday: ''
        },
        committee: {
          title: '',
          members: []
        },
        walkingStats: {
          yearsActive: '',
          members: '',
          walksPerWeek: ''
        },
        clubImageCaption: '',
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Load email configuration
    if (emailConfigData && typeof emailConfigData === 'object') {
      emailConfig.inquiryEmail = emailConfigData.inquiryEmail || ''
      emailConfig.subjectPrefix = emailConfigData.subjectPrefix || ''
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
          clubMission: storedContent.clubMission || content.value.clubMission || '',
          clubDescription: storedContent.clubDescription || 'In the Hutt Valley we are blessed with some of the best walking areas in New Zealand with the beautiful river trail, etc.',
          walkingSchedule: {
            sundaySummer: storedContent.walkingSchedule?.sundaySummer || '09:00',
            sundayWinter: storedContent.walkingSchedule?.sundayWinter || '09:30',
            tuesday: storedContent.walkingSchedule?.tuesday || '10:00'
          },
          committee: storedContent.committee || content.value.committee || {
            title: 'Our Committee',
            members: []
          },
          walkingStats: storedContent.walkingStats || content.value.walkingStats || undefined,
          clubImageCaption: storedContent.clubImageCaption || content.value.clubImageCaption || '',
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
        sundaySummer: '',
        sundayWinter: '',
        tuesday: ''
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
      emit('content-updated', content.value)
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

// Edit recurring event
const editRecurringEvent = (event: any) => {
  editingRecurringEvent.value = { ...event }
}

// Save recurring event edit
const saveRecurringEventEdit = () => {
  if (editingRecurringEvent.value) {
    const index = events.value.recurringEvents.findIndex(e => e.id === editingRecurringEvent.value.id)
    if (index !== -1) {
      events.value.recurringEvents[index] = { ...editingRecurringEvent.value }
      saveEvents()
      editingRecurringEvent.value = null
    }
  }
}

// Cancel recurring event edit
const cancelRecurringEventEdit = () => {
  editingRecurringEvent.value = null
}

// Edit special event
const editSpecialEvent = (event: any) => {
  editingSpecialEvent.value = { ...event }
}

// Save special event edit
const saveSpecialEventEdit = () => {
  if (editingSpecialEvent.value) {
    const index = events.value.specialEvents.findIndex(e => e.id === editingSpecialEvent.value.id)
    if (index !== -1) {
      events.value.specialEvents[index] = { ...editingSpecialEvent.value }
      saveEvents()
      editingSpecialEvent.value = null
    }
  }
}

// Cancel special event edit
const cancelSpecialEventEdit = () => {
  editingSpecialEvent.value = null
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
      
      // Reload galleries and emit update
      await loadData()
      
      // Emit updated galleries to parent
      emit('galleriesUpdated', galleries.value)
      
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
    
    // Reload galleries and emit update
    await loadData()
    emit('galleriesUpdated', galleries.value)
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
    
    console.log('🔄 Starting upload to gallery:', galleryId)
    console.log('📁 Files to upload:', selectedFiles.value)
    
    const uploadedImages = []
    
    for (const file of selectedFiles.value) {
      try {
        console.log('📤 Processing file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
        
        // Compress and optimize image before upload
        const optimizedFile = await compressImage(file)
        console.log('📦 Compressed file:', optimizedFile.name, 'Size:', (optimizedFile.size / 1024 / 1024).toFixed(2) + 'MB')
        
        const result = await dataService.uploadImage(optimizedFile)
        console.log('✅ Upload result:', result)
        uploadedImages.push(result.url)
      } catch (error) {
        console.error('❌ Failed to upload:', file.name, error)
        saveStatus.value = `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    
    console.log('📸 All uploaded images:', uploadedImages)
    
    if (uploadedImages.length > 0) {
      // Add images to the specific gallery
      const gallery = galleries.value.find(g => g.id === galleryId)
      console.log('🎯 Found gallery:', gallery)
      
      if (gallery) {
        const updatedImages = [...gallery.images, ...uploadedImages]
        console.log('🔄 Updating gallery images:', updatedImages)
        
        const success = await dataService.updateGallery(galleryId, { images: updatedImages })
        console.log('💾 Gallery update success:', success)
        
        if (success) {
          gallery.images = updatedImages
          console.log('✅ Gallery updated locally:', gallery.images)
          saveStatus.value = `Successfully uploaded ${uploadedImages.length} images to gallery!`
          showPhotoUploadFor.value = null
          selectedFiles.value = []
          
          // Force a refresh of the galleries data and emit update
          await loadData()
          emit('galleriesUpdated', galleries.value)
        } else {
          saveStatus.value = 'Error saving gallery updates'
        }
      }
    } else {
      saveStatus.value = 'No images were uploaded successfully'
    }
  } catch (error) {
    saveStatus.value = 'Error uploading images to gallery'
    console.error('❌ Upload error:', error)
  } finally {
    loading.value = false
    setTimeout(() => saveStatus.value = '', 3000)
  }
}

// Image compression and optimization
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check file size first
    const maxSize = 10 * 1024 * 1024 // 10MB limit
    if (file.size > maxSize) {
      reject(new Error(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`))
      return
    }
    
    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Try WebP first, fallback to JPEG if not supported
        const tryWebP = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now()
                })
                
                console.log('📦 Image compressed to WebP:', {
                  original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                  compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
                  reduction: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`
                })
                
                resolve(compressedFile)
              } else {
                // WebP failed, try JPEG
                tryJPEG()
              }
            },
            'image/webp',
            0.8
          )
        }
        
        const tryJPEG = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                
                console.log('📦 Image compressed to JPEG:', {
                  original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                  compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
                  reduction: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`
                })
                
                resolve(compressedFile)
              } else {
                reject(new Error('Failed to compress image to any format'))
              }
            },
            'image/jpeg',
            0.8
          )
        }
        
        // Start with WebP, fallback to JPEG
        tryWebP()
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
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
      
      // Emit updated galleries to parent
      emit('galleriesUpdated', galleries.value)
    } else {
      saveStatus.value = 'Error removing image from gallery'
    }
    setTimeout(() => saveStatus.value = '', 3000)
  }
}

// Debug galleries
const debugGalleries = () => {
  console.log('🔍 Debug Galleries:')
  console.log('📊 Galleries array:', galleries.value)
  galleries.value.forEach((gallery, index) => {
    console.log(`🎯 Gallery ${index}:`, {
      id: gallery.id,
      title: gallery.title,
      images: gallery.images,
      imageCount: gallery.images.length
    })
  })
}

// Helper functions
const capitalizeDay = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
}

const formatTime = (time: string): string => {
  if (!time) return ''
  
  try {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    
    return `${displayHour}:${minutes} ${ampm}`
  } catch (error) {
    // Fallback to original time if parsing fails
    console.warn('Time formatting failed for:', time, error)
    return time
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

// News methods
const createNewsItem = async () => {
  if (newNewsItem.title && newNewsItem.content && newNewsItem.date) {
    try {
      loading.value = true
      saveStatus.value = 'Creating news item...'
      
      const newsItem: NewsItem = {
        id: Date.now().toString(),
        title: newNewsItem.title,
        content: newNewsItem.content,
        date: newNewsItem.date,
        galleryLink: newNewsItem.galleryLink || undefined
      }
      
      // Add to local state
      newsItems.value.unshift(newsItem)
      
      // Save to backend via data service
      const success = await dataService.saveNews(newsItems.value)
      
      if (success) {
        // Emit update to parent component
        emit('newsUpdated', newsItems.value)
        
        // Reset form
        newNewsItem.title = ''
        newNewsItem.content = ''
        newNewsItem.date = ''
        newNewsItem.galleryLink = ''
        showAddNewsForm.value = false
        
        saveStatus.value = 'News item created and saved successfully!'
        setTimeout(() => saveStatus.value = '', 3000)
      } else {
        throw new Error('Failed to save news to backend')
      }
    } catch (error) {
      saveStatus.value = 'Error creating news item'
      console.error('Error creating news item:', error)
      // Remove from local state if save failed
      newsItems.value = newsItems.value.filter(item => item.id !== Date.now().toString())
    } finally {
      loading.value = false
    }
  }
}

const deleteNewsItem = async (id: string) => {
  try {
    loading.value = true
    saveStatus.value = 'Deleting news item...'
    
    // Remove from local state
    newsItems.value = newsItems.value.filter(item => item.id !== id)
    
    // Save to backend via data service
    const success = await dataService.saveNews(newsItems.value)
    
    if (success) {
      // Emit update to parent component
      emit('newsUpdated', newsItems.value)
      
      saveStatus.value = 'News item deleted and saved successfully!'
      setTimeout(() => saveStatus.value = '', 3000)
    } else {
      throw new Error('Failed to save news changes to backend')
    }
  } catch (error) {
    saveStatus.value = 'Error deleting news item'
    console.error('Error deleting news item:', error)
    // Revert local state if save failed
    // Note: We'd need to restore the deleted item here, but we don't have it
  } finally {
    loading.value = false
  }
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    const validFiles: File[] = []
    const errors: string[] = []
    
    // Validate each file
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`)
        continue
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 10MB)`)
        continue
      }
      
      validFiles.push(file)
    }
    
    // Store valid files
    selectedFiles.value = validFiles
    
    // Show validation results
    if (validFiles.length > 0) {
      console.log('✅ Valid files selected:', validFiles)
      if (errors.length > 0) {
        saveStatus.value = `Selected ${validFiles.length} valid files. ${errors.length} files were rejected.`
      } else {
        saveStatus.value = `Selected ${validFiles.length} file${validFiles.length !== 1 ? 's' : ''} for upload`
      }
    } else {
      saveStatus.value = 'No valid files selected'
      console.log('❌ No valid files selected')
    }
    
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors)
      setTimeout(() => saveStatus.value = '', 5000)
    } else {
      setTimeout(() => saveStatus.value = '', 3000)
    }
    
    // Clear the input to allow selecting the same file again
    target.value = ''
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

// Committee management functions
const addCommitteeMember = () => {
  if (!content.value.committee) {
    content.value.committee = {
      title: 'Our Committee',
      members: []
    }
  }
  
  // Create a new array to ensure Vue reactivity
  content.value.committee.members = [
    ...content.value.committee.members,
    { position: '', name: '' }
  ]
}

const removeCommitteeMember = (index: number) => {
  if (content.value.committee && content.value.committee.members) {
    // Create a new array to ensure Vue reactivity
    content.value.committee.members = content.value.committee.members.filter((_, i) => i !== index)
  }
}

// Email Configuration
const emailConfig = reactive({
  inquiryEmail: '',
  subjectPrefix: ''
})

const emailTestResult = ref<{ success: boolean; error?: string } | null>(null)

const testEmail = async () => {
  emailTestResult.value = null
  try {
    // Send a test email using the contact API
    const testData = {
      name: 'Admin Test',
      email: 'admin@walk4health.co.nz',
      subject: 'Test Email',
      message: 'This is a test email to verify the email configuration is working correctly. If you receive this, the email system is properly configured!'
    }

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    if (response.ok) {
      emailTestResult.value = { success: true }
      saveStatus.value = 'Test email sent successfully!'
      setTimeout(() => saveStatus.value = '', 3000)
    } else {
      const errorData = await response.json()
      emailTestResult.value = { 
        success: false, 
        error: errorData.error || `HTTP ${response.status}` 
      }
      saveStatus.value = 'Error sending test email'
    }
  } catch (error) {
    emailTestResult.value = { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
    saveStatus.value = 'Error sending test email'
    console.error('Error sending test email:', error)
  }
}

const saveEmailConfig = async () => {
  try {
    console.log('🔄 AdminPanel: Starting to save email config...')
    console.log('🔄 AdminPanel: Email config to save:', emailConfig)
    console.log('🔄 AdminPanel: Current hostname:', window.location.hostname)
    console.log('🔄 AdminPanel: Is production:', window.location.hostname !== 'localhost' && !window.location.hostname.includes('localhost'))
    
    const configToSave = {
      ...emailConfig,
      lastUpdated: new Date().toISOString()
    }
    
    const success = await dataService.saveEmailConfig(configToSave)
    
    console.log('🔄 AdminPanel: DataService.saveEmailConfig result:', success)
    
    if (success) {
      saveStatus.value = 'Email configuration saved successfully!'
      console.log('✅ AdminPanel: Email configuration saved successfully')
      setTimeout(() => saveStatus.value = '', 3000)
    } else {
      saveStatus.value = 'Failed to save email configuration'
      console.error('❌ AdminPanel: Email config save returned false')
    }
  } catch (error) {
    saveStatus.value = 'Error saving email configuration'
    console.error('❌ AdminPanel: Error saving email configuration:', error)
    console.error('❌ AdminPanel: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
  }
}


</script>




