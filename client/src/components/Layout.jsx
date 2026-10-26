import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
