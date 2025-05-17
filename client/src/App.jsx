import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Chat from './pages/Chat'

function App() {

  return (
   <Routes>
    <Route path='/' element={<Login />} />
    <Route path='/signup' element={<Signup />} />
    <Route path='/chat' element={<Chat />} />
   </Routes>
  )
}

export default App
