import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Search, 
  Upload, 
  Download, 
  Settings,
  Shield,
  School,
  Users
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Resources', href: '/search', icon: BookOpen },
    { name: 'Search', href: '/search?recent=true', icon: Search },
    ...(user?.role === 'teacher' || user?.role === 'admin' 
      ? [{ name: 'Upload', href: '/upload', icon: Upload }]
      : []
    ),
    { name: 'My Downloads', href: '/downloads', icon: Download },
    { name: 'Schools', href: `/schools/${user?.school?.id}`, icon: School },
  ]

  const adminNavigation = [
    { name: 'Moderation', href: '/admin/moderation', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Schools', href: '/admin/schools', icon: School },
  ]

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Sidebar component */}
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Admin section */}
          {user?.role === 'admin' && (
            <>
              <div className="px-4 mt-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
              </div>
              <nav className="flex-1 px-4 mt-2 space-y-2">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href)
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </>
          )}

          {/* Settings link at bottom */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              to="/settings"
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 capitalize">
                    {user?.role}
                  </p>
                </div>
                <Settings className="ml-auto h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar