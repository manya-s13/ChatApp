import React, { useState, useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'

function Profile() {
  // State for user data
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isUploading, setIsUploading] = useState(false);

  const [profilePic, setProfilePic] = useState('/avatar.jpg');

  const fileInputRef = useRef(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      setIsUploading(true);
      const response = await fetch('http://localhost:3000/api/auth/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to upload image');
      
      if (data.user?.profilePicture) {
        setProfilePic(data.user.profilePicture);
      }
      
      setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
    finally{
      setIsUploading(false);
    }
  };


  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming you have an API endpoint to get user data
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          credentials: 'include' // Equivalent to withCredentials: true
        })
        
        if (!response.ok) throw new Error('Failed to fetch user data')
        
        const userData = await response.json()
        setName(userData.user.name || '')
        setDisplayName(userData.user.name || '')
        setEmail(userData.user.email || '')
        setProfilePic(userData.user.profilePicture || '/avatar.jpg')
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Handle save changes
  const handleSave = async () => {
    try {
      setIsLoading(true)
      setMessage({ text: '', type: '' })

      const currentData = {}
      
      // Only validate fields that have values (allowing partial updates)
      if (name.trim()) {
        currentData.name = name.trim()
      }
      
      if (email.trim()) {
        // Email validation only if provided
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          setMessage({ text: 'Please enter a valid email address', type: 'error' })
          setIsLoading(false);
          return;
        }
        currentData.email = email.trim()
      }
      
     
      if (Object.keys(currentData).length === 0 && !password) {
        setMessage({ text: 'No changes detected to update', type: 'error' })
        return
      }
      
      // Send the update request
      const response = await fetch('http://localhost:3000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Equivalent to withCredentials: true
        body: JSON.stringify({
          ...currentData,
          ...(password ? { password } : {}) // Only include password if it's provided
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }

      // Success! Clear password and show success message
      setPassword('')
      setDisplayName(name)
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
    } catch (error) {
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' })
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#212121] min-h-screen w-full overflow-y-auto py-6 px-4">
      <div className="flex flex-col items-center max-w-md mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-white">My Profile</h2>
        
        {/* Profile Image */}
        <div className="relative rounded-full bg-gray-400 h-32 w-32 overflow-hidden">
          <img
            src={profilePic}
            alt="avatar"
            onError={() => setProfilePic('/avatar.jpg')}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="mt-2 text-white font-medium">{displayName}</span>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        
        {/* Camera/Edit Button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex items-center gap-2 text-sm text-blue-500 hover:underline"
        >
        {/* Camera/Edit Button */}
        
          <Camera size={20} />
          Edit Profile Pic
        </button>
        
        {/* Divider line */}
        <div className="w-full max-w-md my-8 border-b border-gray-700"></div>
        
        {/* Status/Alert Message */}
        {message.text && (
          <div className={`w-full p-3 rounded mb-4 ${
            message.type === 'success' ? 'bg-gray-800 text-green-100' : 'bg-red-800 text-red-100'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Editable Segments */}
        <div className="w-full space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2b2c2e] border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2b2c2e] border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-[#2b2c2e] border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank if you don't want to change it</p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`w-full ${
              isLoading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-2 rounded-md transition duration-200 flex justify-center items-center`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile