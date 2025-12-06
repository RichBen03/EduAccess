import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Download, 
  Upload, 
  Users, 
  TrendingUp,
  FileText,
  School
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { resourcesAPI, schoolsAPI } from '../../services/api'

const Dashboard = () => {
  const { user } = useAuth()

  const { data: recentResources } = useQuery({
    queryKey: ['recent-resources'],
    queryFn: () => resourcesAPI.getAll({ limit: 6 }),
    enabled: !!user
  })

  const { data: schoolStats } = useQuery({
    queryKey: ['school-stats', user?.school?.id],
    queryFn: () => schoolsAPI.getStatistics(user?.school?.id),
    enabled: !!user?.school?.id
  })

  const stats = [
    {
      name: 'Total Resources',
      value: schoolStats?.statistics?.totalResources || 0,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Downloads',
      value: schoolStats?.statistics?.totalDownloads || 0,
      icon: Download,
      color: 'bg-green-500'
    },
    {
      name: 'Active Users',
      value: schoolStats?.statistics?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Popular Subjects',
      value: schoolStats?.statistics?.popularSubjects?.length || 0,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  const quickActions = [
    {
      name: 'Browse Resources',
      description: 'Discover educational materials',
      href: '/search',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'Upload Resource',
      description: 'Share your materials',
      href: '/upload',
      icon: Upload,
      color: 'text-green-600 bg-green-100',
      requiredRole: ['teacher', 'admin']
    },
    {
      name: 'My Downloads',
      description: 'View your downloaded files',
      href: '/downloads',
      icon: Download,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'School Profile',
      description: 'View school information',
      href: `/schools/${user?.school?.id}`,
      icon: School,
      color: 'text-orange-600 bg-orange-100'
    }
  ].filter(action => 
    !action.requiredRole || 
    action.requiredRole.includes(user?.role)
  )

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard - EduAccess</title>
      </Helmet>

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your educational resources today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Resources */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Resources
            </h2>
            <Link
              to="/search"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentResources?.resources?.slice(0, 4).map((resource) => (
              <div
                key={resource._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {resource.subject} • {resource.grade}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}

            {(!recentResources?.resources || recentResources.resources.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No resources available yet</p>
                <Link
                  to="/upload"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Upload the first resource
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific content */}
      {user?.role === 'teacher' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Teacher Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Upload className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Upload Resources</h3>
              <p className="text-sm text-gray-600 mt-1">
                Share your educational materials with students
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Track Performance</h3>
              <p className="text-sm text-gray-600 mt-1">
                See how your resources are being used
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Student Engagement</h3>
              <p className="text-sm text-gray-600 mt-1">
                Monitor student downloads and feedback
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Admin Panel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/moderation"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Moderation Queue</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review pending resources
              </p>
            </Link>
            <Link
              to="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage user accounts and permissions
              </p>
            </Link>
            <Link
              to="/admin/schools"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <School className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Schools</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage school profiles and settings
              </p>
            </Link>
            <div className="p-4 border border-gray-200 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">
                Platform usage and statistics
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard