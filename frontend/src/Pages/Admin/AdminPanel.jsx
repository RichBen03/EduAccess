import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  Shield, 
  Users, 
  School, 
  FileText, 
  TrendingUp
} from 'lucide-react'
import ModerationQueue from './components/ModerationQueue'
import UserManagement from './components/UserManagement'
import SchoolManagement from './components/SchoolManagement'
import Analytics from './components/Analytics'

const AdminPanel = () => {
  const location = useLocation()

  const navigation = [
    {
      name: 'Moderation Queue',
      href: '/admin/moderation',
      icon: FileText,
      description: 'Review and approve pending resources',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage user accounts and permissions',
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'School Management',
      href: '/admin/schools',
      icon: School,
      description: 'Manage school profiles and settings',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      description: 'Platform usage and statistics',
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>Admin Panel - EduAccess</title>
      </Helmet>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage platform content and users</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm opacity-75">{item.description}</p>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Routes>
            <Route path="moderation" element={<ModerationQueue />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="schools" element={<SchoolManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="/" element={<ModerationQueue />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel