import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'

// Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import UploadResource from './pages/Resources/UploadResource'
import ResourceDetail from './pages/Resources/ResourceDetail'
import Search from './pages/Search/Search'
import SchoolProfile from './pages/Schools/SchoolProfile'
import AdminPanel from './pages/Admin/AdminPanel'
import MyDownloads from './pages/Downloads/MyDownloads'
import Settings from './pages/Settings/Settings'
import NotFound from './pages/NotFound'

// Hooks
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>EduAccess - Educational Resources</title>
        <meta name="description" content="Share and discover educational resources with EduAccess" />
      </Helmet>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/schools/:id" element={<SchoolProfile />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />

        {/* Protected routes */}
        <Route path="/" element={<Layout />}>
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="upload" 
            element={
              <ProtectedRoute>
                <UploadResource />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="downloads" 
            element={
              <ProtectedRoute>
                <MyDownloads />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin only routes */}
          <Route 
            path="admin/*" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App