import localforage from 'localforage'

// Configure localforage
localforage.config({
  name: 'EduAccess',
  version: 1.0,
  storeName: 'eduaccess_offline',
  description: 'Offline storage for EduAccess resources'
})

// Offline storage service for PWA functionality
export const offlineStorage = {
  // Store downloaded resource for offline access
  storeResource: async (resourceId, resourceData, fileBlob) => {
    try {
      await localforage.setItem(`resource_${resourceId}`, {
        metadata: resourceData,
        file: fileBlob,
        downloadedAt: new Date().toISOString()
      })
      
      // Update download list
      const downloads = await offlineStorage.getDownloads()
      const existingIndex = downloads.findIndex(d => d.id === resourceId)
      
      if (existingIndex >= 0) {
        downloads[existingIndex] = {
          ...resourceData,
          downloadedAt: new Date().toISOString(),
          offline: true
        }
      } else {
        downloads.push({
          ...resourceData,
          downloadedAt: new Date().toISOString(),
          offline: true
        })
      }
      
      await localforage.setItem('downloads', downloads)
      return true
    } catch (error) {
      console.error('Error storing resource offline:', error)
      return false
    }
  },

  // Get stored resource
  getResource: async (resourceId) => {
    try {
      return await localforage.getItem(`resource_${resourceId}`)
    } catch (error) {
      console.error('Error getting offline resource:', error)
      return null
    }
  },

  // Get all downloaded resources
  getDownloads: async () => {
    try {
      const downloads = await localforage.getItem('downloads')
      return downloads || []
    } catch (error) {
      console.error('Error getting downloads:', error)
      return []
    }
  },

  // Remove resource from offline storage
  removeResource: async (resourceId) => {
    try {
      await localforage.removeItem(`resource_${resourceId}`)
      
      // Update download list
      const downloads = await offlineStorage.getDownloads()
      const filteredDownloads = downloads.filter(d => d.id !== resourceId)
      await localforage.setItem('downloads', filteredDownloads)
      
      return true
    } catch (error) {
      console.error('Error removing offline resource:', error)
      return false
    }
  },

  // Check if resource is available offline
  isAvailableOffline: async (resourceId) => {
    try {
      const resource = await localforage.getItem(`resource_${resourceId}`)
      return !!resource
    } catch (error) {
      return false
    }
  },

  // Get offline storage usage
  getStorageUsage: async () => {
    try {
      let totalSize = 0
      await localforage.iterate((value, key) => {
        if (key.startsWith('resource_') && value.file) {
          totalSize += value.file.size
        }
      })
      return totalSize
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return 0
    }
  },

  // Clear all offline data
  clearAll: async () => {
    try {
      await localforage.clear()
      return true
    } catch (error) {
      console.error('Error clearing offline storage:', error)
      return false
    }
  }
}

// Background sync manager
export const syncManager = {
  // Queue for pending sync operations
  pendingOperations: [],

  // Initialize background sync
  init: () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-download-sync')
      })
    }
  },

  // Add operation to sync queue
  addOperation: (operation) => {
    syncManager.pendingOperations.push(operation)
    syncManager.saveQueue()
  },

  // Process pending operations when online
  processQueue: async () => {
    while (syncManager.pendingOperations.length > 0) {
      const operation = syncManager.pendingOperations.shift()
      try {
        await operation()
      } catch (error) {
        console.error('Sync operation failed:', error)
        // Re-add failed operation to retry later
        syncManager.pendingOperations.push(operation)
      }
    }
    syncManager.saveQueue()
  },

  // Save queue to persistent storage
  saveQueue: async () => {
    try {
      await localforage.setItem('syncQueue', syncManager.pendingOperations)
    } catch (error) {
      console.error('Error saving sync queue:', error)
    }
  },

  // Load queue from persistent storage
  loadQueue: async () => {
    try {
      const queue = await localforage.getItem('syncQueue')
      syncManager.pendingOperations = queue || []
    } catch (error) {
      console.error('Error loading sync queue:', error)
      syncManager.pendingOperations = []
    }
  }
}

// Initialize sync manager when module loads
if (typeof window !== 'undefined') {
  syncManager.loadQueue()
  
  // Listen for online event to process queue
  window.addEventListener('online', () => {
    syncManager.processQueue()
  })
}