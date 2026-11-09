import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import AlumniAssociation from './pages/AlumniAssociation'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Profile from './pages/profile/Profile'
import Directory from './pages/directory/Directory'
import Jobs from './pages/jobs/Jobs'
import JobDetails from './pages/jobs/JobDetails'
import JobForm from './pages/jobs/JobForm'
import MyJobs from './pages/jobs/MyJobs'
import Apply from './pages/jobs/Apply'
import MyApplications from './pages/jobs/MyApplications'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVerification from './pages/admin/AdminVerification'
import AdminPlaceholder from './pages/admin/AdminPlaceholder'

export default function App() {
  return (
    <Routes>
      {/* Public & Student/Alumni User Shell */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/alumni-association" element={<AlumniAssociation />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/directory" element={<Directory />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/:jobId/edit" element={<JobForm />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/jobs/:jobId/apply" element={<Apply />} />
          <Route path="/applications" element={<MyApplications />} />
        </Route>
      </Route>

      {/* Admin Shell - Protected by RBAC (Role: ADMIN) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="alumni" element={<AdminPlaceholder title="Alumni Management" description="Manage verified alumni member records, search profiles, and edit cohorts." moduleKey="admin-alumni" />} />
          <Route path="events" element={<AdminPlaceholder title="Events Management" description="Create and administer institutional alumni reunions, webinars, and regional meetups." moduleKey="admin-events" />} />
          <Route path="jobs" element={<AdminPlaceholder title="Jobs Portal Management" description="Moderate career opportunity listings, internship posts, and hiring referrals." moduleKey="admin-jobs" />} />
          <Route path="donations" element={<AdminPlaceholder title="Donations & Campaigns" description="Track alumni contributions, endowments, scholarship funds, and campaign progress." moduleKey="admin-donations" />} />
          <Route path="mentorship" element={<AdminPlaceholder title="Mentorship Programs" description="Oversee mentor-mentee pairings, track mentoring sessions, and review feedback." moduleKey="admin-mentorship" />} />
          <Route path="success-stories" element={<AdminPlaceholder title="Success Stories" description="Curate and publish alumni spotlights, career achievements, and institutional news." moduleKey="admin-success-stories" />} />
          <Route path="surveys" element={<AdminPlaceholder title="Feedback & Surveys" description="Design alumni feedback questionnaires, run sentiment surveys, and analyze responses." moduleKey="admin-surveys" />} />
          <Route path="users" element={<AdminPlaceholder title="User Management" description="Administer user accounts, manage role allocations, and enforce security policies." moduleKey="admin-users" />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route
        path="*"
        element={
          <section className="mx-auto max-w-6xl px-6 py-16">
            <h1 className="text-3xl font-bold">Page not found</h1>
            <p className="mt-2 text-slate-600">The requested resource could not be found.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-700 underline">
              Return home
            </Link>
          </section>
        }
      />
    </Routes>
  )
}
