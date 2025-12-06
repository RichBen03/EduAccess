import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Upload, X, FileText } from 'lucide-react'
import { resourcesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const UploadResource = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    strand: '',
    tags: '',
    isPublic: true
  })
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('subject', formData.subject)
      submitData.append('grade', formData.grade)
      submitData.append('strand', formData.strand)
      submitData.append('tags', formData.tags)
      submitData.append('isPublic', formData.isPublic)
      submitData.append('file', file)

      await resourcesAPI.upload(submitData)
      
      toast.success('Resource uploaded successfully! It will be available after moderation.')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const commonSubjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
    'Music', 'Physical Education', 'Economics', 'Business', 'Languages'
  ]

  const commonGrades = [
    'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
    'College', 'University', 'Graduate'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet>
        <title>Upload Resource - EduAccess</title>
      </Helmet>

      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Resource</h1>
            <p className="text-gray-600">Share educational materials with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="label">Resource File</label>
            {!file ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, PPT, XLS, images, videos up to 50MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter a descriptive title for your resource"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Describe the content and purpose of this resource"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="label">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select a subject</option>
                {commonSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Grade Level */}
            <div>
              <label htmlFor="grade" className="label">
                Grade Level
              </label>
              <select
                id="grade"
                name="grade"
                required
                value={formData.grade}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select grade level</option>
                {commonGrades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strand/Track */}
            <div>
              <label htmlFor="strand" className="label">
                Strand/Track (Optional)
              </label>
              <input
                type="text"
                id="strand"
                name="strand"
                value={formData.strand}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., STEM, HUMSS, ABM"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="label">
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., algebra, worksheet, quiz"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate tags with commas
              </p>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
              Make this resource publicly visible
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="btn-primary"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload Resource'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Upload Guidelines */}
      <div className="card mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Upload Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Ensure you have the rights to share the content</li>
          <li>• Provide accurate and descriptive metadata</li>
          <li>• Files must be appropriate for educational use</li>
          <li>• Maximum file size is 50MB</li>
          <li>• All uploads are subject to moderation and approval</li>
          <li>• Supported formats: PDF, DOC, PPT, XLS, images, videos, audio</li>
        </ul>
      </div>
    </div>
  )
}

export default UploadResource