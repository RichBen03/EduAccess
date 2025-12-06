import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SchoolManagement = () => {
  const [schools, setSchools] = useState([])

  React.useEffect(() => {
    // This would be an API call
    setSchools([
      {
        _id: '1',
        name: 'Central High School',
        code: 'CHS001',
        address: {
          city: 'New York',
          state: 'NY'
        },
        contact: {
          email: 'contact@centralhigh.edu'
        },
        isActive: true,
        statistics: {
          totalResources: 150,
          totalDownloads: 2500,
          activeUsers: 45
        }
      }
    ])
  }, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">School Management</h2>
          <p className="text-gray-600">Manage school profiles and settings</p>
        </div>
        <button className="btn-primary">
          Add School
        </button>
      </div>

      <div className="space-y-4">
        {schools.map((school) => (
          <div key={school._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{school.name}</h3>
                <p className="text-gray-600 text-sm">{school.code}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                school.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {school.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Location:</span> {school.address.city}, {school.address.state}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {school.contact.email}
              </div>
              <div>
                <span className="font-medium">Resources:</span> {school.statistics.totalResources}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="btn-secondary">Edit</button>
              <Link to={`/schools/${school._id}`} className="btn-primary">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SchoolManagement