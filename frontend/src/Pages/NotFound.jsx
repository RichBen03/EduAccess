import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Helmet>
        <title>Page Not Found - EduAccess</title>
      </Helmet>

      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-16 w-16 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
              404
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The resource might have been moved, deleted, or you entered an incorrect URL.
        </p>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 btn-primary"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 btn-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>If you believe this is an error, please contact support.</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/search"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-500"
            >
              <Search className="h-4 w-4" />
              <span>Browse Resources</span>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-50">
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound