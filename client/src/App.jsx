import './App.css'
import Login from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

function App() {

  return (
    <>
    {/* <Toaster position='top-right' /> */}
   <Routes>  
    <Route path='/' element={<Login />} />
    <Route path='/signup' element={<Signup />} />
    <Route path='/chat' element={<Chat />} />
    <Route path='/profile' element={<Profile />} />
   </Routes>
   </>
  )
}

export default App
