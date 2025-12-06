import React, { useState } from 'react'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

const ModerationQueue = () => {
  const [pendingResources, setPendingResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // This would be replaced with actual API calls
  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPendingResources([
        {
          _id: '1',
          title: 'Algebra Basics Worksheet',
          description: 'Basic algebra exercises for beginners',
          subject: 'Mathematics',
          grade: 'Grade 9',
          uploader: { firstName: 'John', lastName: 'Smith' },
          school: { name: 'Central High' },
          createdAt: new Date().toISOString(),
          file: { originalName: 'algebra-worksheet.pdf' }
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleApprove = (resourceId) => {
    // API call to approve resource
    setPendingResources(prev => prev.filter(r => r._id !== resourceId))
  }

  const handleReject = (resourceId, notes) => {
    // API call to reject resource
    setPendingResources(prev => prev.filter(r => r._id !== resourceId))
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Moderation Queue</h2>
          <p className="text-gray-600">Review and approve pending resources</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{pendingResources.length} pending</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : pendingResources.length > 0 ? (
        <div className="space-y-4">
          {pendingResources.map((resource) => (
            <div key={resource._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Subject:</span> {resource.subject}
                </div>
                <div>
                  <span className="font-medium">Grade:</span> {resource.grade}
                </div>
                <div>
                  <span className="font-medium">Uploader:</span> {resource.uploader.firstName} {resource.uploader.lastName}
                </div>
                <div>
                  <span className="font-medium">School:</span> {resource.school.name}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Uploaded {new Date(resource.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(resource._id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(resource._id, 'Needs improvement')}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending resources
          </h3>
          <p className="text-gray-600">
            All resources have been moderated. Check back later for new submissions.
          </p>
        </div>
      )}
    </div>
  )
}

export default ModerationQueue