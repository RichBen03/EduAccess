import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  School, 
  Users, 
  BookOpen, 
  Download, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { schoolsAPI, resourcesAPI } from '../../services/api'

const SchoolProfile = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [resourcesPage, setResourcesPage] = useState(1)

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school', id],
    queryFn: () => schoolsAPI.getById(id)
  })

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['school-statistics', id],
    queryFn: () => schoolsAPI.getStatistics(id),
    enabled: !!school
  })

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['school-resources', id, resourcesPage],
    queryFn: () => schoolsAPI.getResources(id, { page: resourcesPage, limit: 12 }),
    enabled: !!school
  })

  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">School Not Found</h2>
          <p className="text-gray-600 mb-4">The school you're looking for doesn't exist.</p>
          <Link to="/search" className="btn-primary">
            Browse Resources
          </Link>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Resources',
      value: statistics?.statistics?.totalResources || 0,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Downloads',
      value: statistics?.statistics?.totalDownloads || 0,
      icon: Download,
      color: 'bg-green-500'
    },
    {
      name: 'Active Users',
      value: statistics?.statistics?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Popular Subjects',
      value: statistics?.statistics?.popularSubjects?.length || 0,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'resources', name: 'Resources' },
    { id: 'statistics', name: 'Statistics' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>{school.name} - EduAccess</title>
      </Helmet>

      {/* School Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* School Logo/Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              {school.logo ? (
                <img
                  src={school.logo}
                  alt={school.name}
                  className="w-16 h-16 object-contain rounded-lg"
                />
              ) : (
                <School className="h-10 w-10 text-blue-600" />
              )}
            </div>
          </div>

          {/* School Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {school.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {school.description || 'Educational institution dedicated to learning and growth.'}
                </p>
                
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {school.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{school.address.street}, {school.address.city}, {school.address.state} {school.address.zipCode}</span>
                    </div>
                  )}
                  {school.contact?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{school.contact.phone}</span>
                    </div>
                  )}
                  {school.contact?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{school.contact.email}</span>
                    </div>
                  )}
                  {school.contact?.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={school.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* School Code */}
              <div className="mt-4 md:mt-0">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">School Code</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{school.code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                <p className="text-gray-600">
                  {school.description || `Welcome to ${school.name}, a leading educational institution committed to providing quality education and resources to students and educators.`}
                </p>
              </div>

              {/* Recent Resources */}
              {statistics?.recentResources && statistics.recentResources.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statistics.recentResources.slice(0, 4).map((resource) => (
                      <Link
                        key={resource._id}
                        to={`/resources/${resource._id}`}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            By {resource.uploader.firstName} {resource.uploader.lastName}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Subjects */}
              {statistics?.statistics?.popularSubjects && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {statistics.statistics.popularSubjects.map((subject, index) => (
                      <span
                        key={subject._id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {subject._id} ({subject.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  School Resources ({resources?.pagination?.total || 0})
                </h3>
                <Link
                  to={`/search?school=${id}`}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all in search
                </Link>
              </div>

              {resourcesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : resources?.resources && resources.resources.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.resources.map((resource) => (
                      <Link
                        key={resource._id}
                        to={`/resources/${resource._id}`}
                        className="block border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-2xl">
                            {resource.file.mimeType.includes('pdf') ? '📄' : '📁'}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Download className="h-3 w-3" />
                            <span>{resource.downloadCount}</span>
                          </div>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {resource.title}
                        </h4>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {resource.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{resource.subject}</span>
                          <span>{resource.grade}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {resources.pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Page {resourcesPage} of {resources.pagination.pages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setResourcesPage(prev => Math.max(prev - 1, 1))}
                          disabled={resourcesPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setResourcesPage(prev => Math.min(prev + 1, resources.pagination.pages))}
                          disabled={resourcesPage === resources.pagination.pages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No resources yet
                  </h3>
                  <p className="text-gray-600">
                    This school hasn't uploaded any resources yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="font-medium text-gray-900 mb-4">Resource Distribution</h4>
                  <div className="space-y-3">
                    {statistics?.statistics?.popularSubjects?.map((subject) => (
                      <div key={subject._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{subject._id}</span>
                        <span className="text-sm font-medium text-gray-900">{subject.count} resources</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h4 className="font-medium text-gray-900 mb-4">Platform Engagement</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Resources</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.statistics?.totalResources || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Downloads</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.statistics?.totalDownloads || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.statistics?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchoolProfile