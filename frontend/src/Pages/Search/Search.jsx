import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  BookOpen,
  Download,
  Calendar,
  User,
  School
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { resourcesAPI, schoolsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    subject: searchParams.get('subject') || '',
    grade: searchParams.get('grade') || '',
    school: searchParams.get('school') || '',
    strand: searchParams.get('strand') || '',
    tags: searchParams.get('tags') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuth()

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-results', filters, currentPage],
    queryFn: () => resourcesAPI.getAll({
      search: filters.search,
      subject: filters.subject,
      grade: filters.grade,
      school: filters.school,
      strand: filters.strand,
      tags: filters.tags,
      page: currentPage,
      limit: 12
    }),
    keepPreviousData: true
  })

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolsAPI.getAll({ limit: 100 })
  })

  const { data: filtersData } = useQuery({
    queryKey: ['search-filters'],
    queryFn: () => resourcesAPI.getAll({ limit: 1 })
  })

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      subject: '',
      grade: '',
      school: '',
      strand: '',
      tags: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'createdAt' && value !== 'desc'
  )

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'downloadCount', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' }
  ]

  const getFileTypeIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📈'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('video')) return '🎬'
    if (mimeType.includes('audio')) return '🎵'
    return '📁'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>Search Resources - EduAccess</title>
      </Helmet>

      {/* Search Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Search for educational resources..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input-field"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                showFilters || hasActiveFilters
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Subjects</option>
                  {filtersData?.filters?.subjects?.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Grade Level</label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Grades</option>
                  {filtersData?.filters?.grades?.map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">School</label>
                <select
                  value={filters.school}
                  onChange={(e) => handleFilterChange('school', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Schools</option>
                  {schools?.schools?.map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Strand/Track</label>
                <input
                  type="text"
                  value={filters.strand}
                  onChange={(e) => handleFilterChange('strand', e.target.value)}
                  className="input-field"
                  placeholder="e.g., STEM, HUMSS"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label">Tags</label>
              <input
                type="text"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="input-field"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="card">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
            </h2>
            {searchResults && (
              <p className="text-gray-600 mt-1">
                Found {searchResults.pagination.total} resources
                {filters.search && ` for "${filters.search}"`}
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && searchResults?.resources && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.resources.map((resource) => (
                <Link
                  key={resource._id}
                  to={`/resources/${resource._id}`}
                  className="block border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">
                        {getFileTypeIcon(resource.file.mimeType)}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloadCount}</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {resource.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{resource.uploader.firstName} {resource.uploader.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <School className="h-3 w-3" />
                        <span>{resource.school.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {resource.subject}
                      </span>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {resource.grade}
                      </span>
                      {resource.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 2 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          +{resource.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {searchResults.resources.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No resources found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all resources.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {searchResults.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {searchResults.pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, searchResults.pagination.pages))}
                    disabled={currentPage === searchResults.pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search