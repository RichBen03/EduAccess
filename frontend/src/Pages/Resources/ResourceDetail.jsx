import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  Download, 
  Calendar, 
  User, 
  School, 
  Tag, 
  ArrowLeft,
  Eye,
  BookOpen,
  Share2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesAPI } from '../../services/api'
import { offlineStorage } from '../../services/offlineStorage'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const ResourceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isDownloading, setIsDownloading] = useState(false)

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesAPI.getById(id),
    enabled: !!id
  })

  const { data: relatedResources } = useQuery({
    queryKey: ['related-resources', id],
    queryFn: () => resourcesAPI.getRelated(id),
    enabled: !!resource
  })

  const downloadMutation = useMutation({
    mutationFn: () => resourcesAPI.download(id),
    onSuccess: async (data) => {
      // Download the file
      const response = await fetch(data.downloadUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = resource.file.originalName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      // Store for offline access
      await offlineStorage.storeResource(id, resource, blob)
      
      toast.success('Resource downloaded successfully!')
      queryClient.invalidateQueries(['resource', id])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Download failed')
    },
    onSettled: () => {
      setIsDownloading(false)
    }
  })

  const handleDownload = async () => {
    if (!user) {
      toast.error('Please log in to download resources')
      navigate('/login')
      return
    }

    setIsDownloading(true)
    downloadMutation.mutate()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Not Found</h2>
          <p className="text-gray-600 mb-4">The resource you're looking for doesn't exist.</p>
          <Link to="/search" className="btn-primary">
            Browse Resources
          </Link>
        </div>
      </div>
    )
  }

  const fileType = resource.file.mimeType.split('/')[0]
  const fileSize = (resource.file.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="max-w-6xl mx-auto">
      <Helmet>
        <title>{resource.title} - EduAccess</title>
      </Helmet>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resource.title}
                </h1>
                <p className="text-lg text-gray-600">{resource.description}</p>
              </div>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{resource.uploader.firstName} {resource.uploader.lastName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <School className="h-4 w-4 mr-2" />
                <span>{resource.school.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="h-4 w-4 mr-2" />
                <span>{resource.downloadCount} downloads</span>
              </div>
            </div>

            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {resource.file.originalName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {fileType.toUpperCase()} • {fileSize} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || downloadMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Subject Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Subject</dt>
                    <dd className="font-medium">{resource.subject}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Grade Level</dt>
                    <dd className="font-medium">{resource.grade}</dd>
                  </div>
                  {resource.strand && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Strand/Track</dt>
                      <dd className="font-medium">{resource.strand}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Resources */}
          {relatedResources && relatedResources.length > 0 && (
            <div className="card mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Related Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedResources.slice(0, 4).map((related) => (
                  <Link
                    key={related._id}
                    to={`/resources/${related._id}`}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {related.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {related.subject} • {related.grade}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Uploader Info */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-3">Uploaded By</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {resource.uploader.firstName} {resource.uploader.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">{resource.uploader.role}</p>
              </div>
            </div>
          </div>

          {/* School Info */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-3">School</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <School className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{resource.school.name}</p>
                <p className="text-sm text-gray-600">{resource.school.code}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading || downloadMutation.isLoading}
                className="w-full flex items-center justify-center space-x-2 btn-primary"
              >
                {isDownloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Download Resource</span>
              </button>
              
              <Link
                to={`/schools/${resource.school._id}`}
                className="w-full flex items-center justify-center space-x-2 btn-secondary"
              >
                <School className="h-4 w-4" />
                <span>View School</span>
              </Link>

              <Link
                to={`/search?uploader=${resource.uploader._id}`}
                className="w-full flex items-center justify-center space-x-2 btn-secondary"
              >
                <User className="h-4 w-4" />
                <span>More from Uploader</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetail