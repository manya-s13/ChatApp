
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, User, MoreVertical } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setMenuOpen(false);
  };

  const handleEditProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#1a1a1a] p-3 fixed top-0 w-full z-50">
      <div className="flex justify-between items-center">
        <div className='flex gap-2'>
            <img src='/logo.png' alt='logo' height={50} width={50} />
        <Link to="/chat" className="text-white text-xl font-bold pt-3">Direct Chat</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/avatar.jpg';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-white">{user?.name}</span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-700 rounded-full"
            >
              <MoreVertical size={20} className="text-white" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-50 py-1">
                <button 
                  onClick={handleEditProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600"
                >
                  <User size={16} className="mr-2" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-600 text-red-400"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;