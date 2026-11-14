import { Link } from 'react-router-dom'
import nstLogo from '../assets/nst-logo.png'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Institutional Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={nstLogo}
                alt="Newton School of Technology"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm font-semibold text-[#064477]">
              NST Alumni Association
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Connecting Newton School of Technology graduates across batches and industries. Dedicated to mentorship, collaborative careers, and lifelong community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Community</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/about" className="hover:text-[#0878D1] transition-colors">
                  About NST Alumni
                </Link>
              </li>
              <li>
                <Link to="/alumni-association" className="hover:text-[#0878D1] transition-colors">
                  Association Charter
                </Link>
              </li>
              <li>
                <Link to="/directory" className="hover:text-[#0878D1] transition-colors">
                  Alumni Directory
                </Link>
              </li>
              <li>
                <Link to="/stories" className="hover:text-[#0878D1] transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Initiatives</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/donations" className="hover:text-[#0878D1] transition-colors">
                  Giving & Campaigns
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-[#0878D1] transition-colors">
                  Feedback & Surveys
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#0878D1] transition-colors">
                  Contact Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Campus</h4>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Newton School of Technology<br />
              Centre for Engineering Excellence<br />
              alumni@newtonschool.co
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} NST Alumni Association • Newton School of Technology. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-800">Mission</Link>
            <Link to="/contact" className="hover:text-slate-800">Support</Link>
            <Link to="/feedback" className="hover:text-slate-800">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
