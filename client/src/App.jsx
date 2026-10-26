import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<main className="p-8"><h1 className="text-3xl font-bold">Page not found</h1><Link to="/" className="text-indigo-700 underline">Return home</Link></main>} />
    </Routes>
  )
}
