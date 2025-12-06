import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Download, 
  Trash2, 
  Wifi, 
  WifiOff,
  Calendar,
  FileText,
  Search,
  Filter
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../../services/api'
import { offlineStorage, syncManager } from '../../services/offlineStorage'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const MyDownloads = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, offline, online
  const [offlineDownloads, setOfflineDownloads] = useState([])

  const { data: downloadHistory, isLoading } = useQuery({
    queryKey: ['user-downloads', user?.id],
    queryFn: () => usersAPI.getDownloads(user?.id, { limit: 50 }),
    enabled: !!user?.id
  })

  const deleteMutation = useMutation({
    mutationFn: async (resourceId) => {
      await offlineStorage.removeResource(resourceId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-downloads'])
      loadOfflineDownloads()
      toast.success('Resource removed from offline storage')
    },
    onError: () => {
      toast.error('Failed to remove resource')
    }
  })

  const loadOfflineDownloads = async () => {
    const downloads = await offlineStorage.getDownloads()
    setOfflineDownloads(downloads)
  }

  useEffect(() => {
    loadOfflineDownloads()
  }, [])

  const combinedDownloads = React.useMemo(() => {
    const onlineDownloads = downloadHistory?.downloads || []
    const offlineMap = new Map(offlineDownloads.map(d => [d.id, d]))
    
    // Merge online and offline data
    return onlineDownloads.map(download => ({
      ...download,
      offline: offlineMap.has(download.resource?._id),
      offlineData: offlineMap.get(download.resource?._id)
    }))
  }, [downloadHistory, offlineDownloads])

  const filteredDownloads = combinedDownloads.filter(download => {
    const matchesSearch = download.resource?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.resource?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'offline' && download.offline) ||
                         (filter === 'online' && !download.offline)
    
    return matchesSearch && matchesFilter
  })

  const handleDeleteOffline = async (resourceId) => {
    if (window.confirm('Are you sure you want to remove this resource from offline storage?')) {
      deleteMutation.mutate(resourceId)
    }
  }

  const handleDownloadAgain = async (resource) => {
    // This would trigger the download process again
    toast.success('Downloading resource again...')
  }

  const getStorageUsage = async () => {
    const usage = await offlineStorage.getStorageUsage()
    return (usage / (1024 * 1024)).toFixed(2) // Convert to MB
  }

  const [storageUsage, setStorageUsage] = useState('0')

  useEffect(() => {
    getStorageUsage().then(setStorageUsage)
  }, [offlineDownloads])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Helmet>
          <title>My Downloads - EduAccess</title>
        </Helmet>
        <div className="card">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Helmet>
        <title>My Downloads - EduAccess</title>
      </Helmet>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Downloads</h1>
            <p className="text-gray-600">
              Access your downloaded resources anytime, anywhere
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span>{storageUsage} MB offline storage used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search your downloads..."
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Downloads</option>
              <option value="offline">Available Offline</option>
              <option value="online">Online Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="card">
        {filteredDownloads.length > 0 ? (
          <div className="space-y-4">
            {filteredDownloads.map((download) => (
              <div
                key={download._id || download.resource?._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {download.resource?.title}
                      </h3>
                      {download.offline && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Offline
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {download.resource?.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Downloaded {new Date(download.downloadedAt).toLocaleDateString()}
                        </span>
                      </span>
                      <span>{download.resource?.subject}</span>
                      <span>{download.resource?.grade}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {download.offline ? (
                    <>
                      <Link
                        to={`/resources/${download.resource?._id}`}
                        className="btn-secondary"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteOffline(download.resource?._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Remove from offline storage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownloadAgain(download.resource)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Again</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Download className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No downloads found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'You haven\'t downloaded any resources yet'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/search" className="btn-primary">
                Browse Resources
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Offline Storage Info */}
      <div className="card mt-6">
        <h3 className="font-medium text-gray-900 mb-4">Offline Storage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <WifiOff className="h-4 w-4 text-green-600" />
              <span className="font-medium">Offline Resources</span>
            </div>
            <p className="text-gray-600">
              {offlineDownloads.length} resources available offline
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Download className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Storage Used</span>
            </div>
            <p className="text-gray-600">{storageUsage} MB</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Wifi className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Sync Status</span>
            </div>
            <p className="text-gray-600">All downloads synced</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Resources marked with the offline icon are available without an internet connection. 
            You can remove them to free up storage space.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MyDownloads