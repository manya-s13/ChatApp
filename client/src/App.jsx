import './App.css'
import Login from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import React, { useState } from 'react'

function App() {

  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {user && <Navbar user={user} />}
      <div className="pt-16">
   <Routes>  
    <Route path='/' element={<Login />} />
    <Route path='/signup' element={<Signup />} />
    <Route path='/chat' element={<Chat />} />
    <Route path='/profile' element={<Profile />} />
   </Routes>
   </div>
   </div>
  )
}

export default App
