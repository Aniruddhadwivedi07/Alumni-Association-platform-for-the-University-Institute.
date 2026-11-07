import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/profile/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}><Route path="/profile" element={<Profile />} /></Route>
        <Route path="*" element={<section className="mx-auto max-w-6xl px-6 py-16"><h1 className="text-3xl font-bold">Page not found</h1><Link to="/" className="text-indigo-700 underline">Return home</Link></section>} />
      </Route>
    </Routes>
  )
}
