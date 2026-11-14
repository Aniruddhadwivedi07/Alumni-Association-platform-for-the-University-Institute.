import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#064477] to-[#002D54] text-white">
        {/* Subtle decorative grid/glow inspired by NST modern tech portal */}
        <div className="absolute inset-0 bg-[radial-gradient(#0878D1_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-12 md:items-center md:gap-12 md:py-28">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
              <span className="h-2 w-2 rounded-full bg-[#0878D1] animate-pulse" />
              Newton School of Technology
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
              Connecting NST Graduates.<br />
              <span className="text-sky-300">Building Tomorrow.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sky-100/90 font-normal">
              Stay connected with your peers, explore career opportunities, share experiences and contribute to the growing Newton School of Technology alumni community.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/directory"
                className="rounded-xl bg-[#0878D1] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0665B2] focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Explore Alumni Network
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-sky-300/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
              >
                Join the Community
              </Link>
            </div>
          </div>

          <aside
            aria-label="Community highlights"
            className="rounded-2xl border border-sky-400/20 bg-white/10 p-6 backdrop-blur-md md:col-span-5 sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-sky-300/20 pb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-200">
                Lifelong Belonging
              </span>
              <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-xs font-medium text-sky-100">
                Official Charter
              </span>
            </div>
            <ul className="mt-6 space-y-6">
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0878D1] text-lg font-bold text-white shadow-sm">
                  🤝
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Reconnect</h2>
                  <p className="mt-1 text-sm text-sky-100/80">
                    Find classmates across cohorts, batches, and technical domains.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0878D1] text-lg font-bold text-white shadow-sm">
                  💡
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Inspire & Mentor</h2>
                  <p className="mt-1 text-sm text-sky-100/80">
                    Guide current students with industry insights and 1-on-1 mentorship.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0878D1] text-lg font-bold text-white shadow-sm">
                  🚀
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Grow & Contribute</h2>
                  <p className="mt-1 text-sm text-sky-100/80">
                    Post career opportunities, attend tech meetups, and support student innovation.
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* 2. NST Alumni Association Introduction */}
      <section className="bg-white border-b border-slate-200/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">
                Institutional Network
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
                Connected by our roots.<br />United by possibility.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The Newton School of Technology Alumni Association unites graduates, current students, and faculty. Whether you want to share real-world engineering lessons, recruit talented peers, or support upcoming cohorts, this community is your lifelong home.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
                >
                  Read our mission and vision →
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  to="/alumni-association"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
                >
                  View Association Charter →
                </Link>
              </div>
            </div>

            {/* Visual lecture-style card inspired by portal screenshot */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#F7F9FC] p-6 shadow-xs">
              <div className="rounded-xl bg-gradient-to-r from-[#035388] to-[#0A85EA] p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-100">
                  <span>NST Alumni Hub</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">Active</span>
                </div>
                <h3 className="mt-3 text-xl font-bold">Tech Leaders & Innovators</h3>
                <p className="mt-1 text-xs text-sky-100">
                  Engineering excellence across software, AI, and entrepreneurship.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700">Verified Alumni Records</span>
                  <span className="font-bold text-[#0878D1]">Active Directory</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700">Student & Alumni Pairing</span>
                  <span className="font-bold text-[#0878D1]">Mentorship Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About the Community Pillars */}
      <section className="bg-[#F7F9FC] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">
              Pillars of Engagement
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45]">
              A Community That Grows With You
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
              Discover how NST Alumni Association fosters growth across every stage of your engineering journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                👥
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Alumni Connections</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Reconnect with cohort peers, expand your professional circle, and collaborate across modern engineering fields.
              </p>
              <Link to="/directory" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Browse Directory →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                💼
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Careers & Jobs</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Explore exclusive job listings, refer qualified peers, and discover tech opportunities shared directly by alumni.
              </p>
              <Link to="/jobs" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Explore Job Portal →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                📅
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Events & Reunions</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Join campus reunions, technical webinars, guest lectures, and alumni chapter gatherings throughout the year.
              </p>
              <Link to="/events" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                View Schedule →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                🎓
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Mentorship & Giving</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Guide aspiring engineers through 1-on-1 sessions, review portfolios, and contribute to scholarships and campus labs.
              </p>
              <Link to="/mentorship" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Connect Mentors →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Core Modules Feature Matrix */}
      <section className="bg-white py-16 border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Success Stories Callout */}
            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Milestones</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Alumni Success Stories</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Read inspiring journeys of NST graduates leading teams, publishing research, and building companies.
                </p>
              </div>
              <Link
                to="/stories"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Read stories →
              </Link>
            </div>

            {/* Giving & Campaigns Callout */}
            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Impact</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Institutional Giving</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Contribute to student scholarship funds, lab equipment, and student-led hackathons.
                </p>
              </div>
              <Link
                to="/donations"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Explore campaigns →
              </Link>
            </div>

            {/* Feedback & Voice Callout */}
            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Voice</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Surveys & Feedback</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Help shape future alumni initiatives, suggest events, and share constructive input with association officers.
                </p>
              </div>
              <Link
                to="/feedback"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Share feedback →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Join Call-to-action Banner */}
      <section className="bg-gradient-to-r from-[#064477] to-[#0878D1] py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
            Stay Connected With Newton School of Technology
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-sky-100 leading-relaxed">
            Whether you graduated in the inaugural batch or recently finished your studies, the NST Alumni Association is here to support your growth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#064477] shadow-sm hover:bg-sky-50 transition"
            >
              Create Alumni Account
            </Link>
            <Link
              to="/about"
              className="rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
