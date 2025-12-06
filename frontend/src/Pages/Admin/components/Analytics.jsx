import React from 'react'

const Analytics = () => {
  const stats = [
    { name: 'Total Resources', value: '1,234' },
    { name: 'Total Downloads', value: '45,678' },
    { name: 'Active Users', value: '2,345' },
    { name: 'Schools', value: '156' }
  ]

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-600">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Popular Subjects</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mathematics</span>
              <span className="font-medium">234 resources</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Science</span>
              <span className="font-medium">198 resources</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>English</span>
              <span className="font-medium">156 resources</span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2 text-sm">
            <div>New resource uploaded: Algebra Basics</div>
            <div>User registration: John Doe</div>
            <div>School added: West High School</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics