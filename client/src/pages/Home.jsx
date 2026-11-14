import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#064477] to-[#002D54] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0878D1_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-12 md:items-center md:gap-12 md:py-28">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
              <span className="h-2 w-2 rounded-full bg-[#0878D1] animate-pulse" />
              Alumni Association Platform
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
              Connecting Alumni.<br />
              <span className="text-sky-300">Empowering Tomorrow.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sky-100/90 font-normal">
              Stay connected with your peers, discover career opportunities, mentor current students, and contribute to meaningful community initiatives across generations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/directory"
                className="rounded-xl bg-[#0878D1] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0665B2] focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                Explore Alumni Directory
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
                Lifelong Network
              </span>
              <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-xs font-medium text-sky-100">
                Community Charter
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
                    Find classmates across batches, disciplines, and geographic regions.
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
                    Guide students and junior peers with career advice and technical insights.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0878D1] text-lg font-bold text-white shadow-sm">
                  🚀
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Grow & Give Back</h2>
                  <p className="mt-1 text-sm text-sky-100/80">
                    Share job opportunities, publish success stories, and support community causes.
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* 2. Introduction */}
      <section className="bg-white border-b border-slate-200/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">
                Professional Network
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl">
                Connected by our roots.<br />United by possibility.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The Alumni Association brings graduates, current students, and faculty closer together. Whether you want to reconnect with your batch, discover exciting careers, or support the next generation through mentorship and giving, you belong here.
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

            <div className="rounded-2xl border border-slate-200/90 bg-[#F7F9FC] p-6 shadow-xs">
              <div className="rounded-xl bg-gradient-to-r from-[#035388] to-[#0A85EA] p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-100">
                  <span>Alumni Community Hub</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">Active</span>
                </div>
                <h3 className="mt-3 text-xl font-bold">Leaders, Innovators & Mentors</h3>
                <p className="mt-1 text-xs text-sky-100">
                  Fostering excellence across professional domains, technology, and entrepreneurship.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700">Verified Alumni Roster</span>
                  <span className="font-bold text-[#0878D1]">Searchable Directory</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700">1-on-1 Student Guidance</span>
                  <span className="font-bold text-[#0878D1]">Mentorship Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Community Pillars */}
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
              Discover how the Alumni Association fosters growth across every stage of your career.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                👥
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Alumni Directory</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Discover fellow alumni across graduating batches, search by discipline, role, and industry.
              </p>
              <Link to="/directory" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Browse Directory →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                💼
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Career Portal</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Explore job listings, share vacancies within your company, and discover opportunities.
              </p>
              <Link to="/jobs" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Explore Jobs →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                📅
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Events & Reunions</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Participate in reunions, professional webinars, technical workshops, and chapter meetups.
              </p>
              <Link to="/events" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                View Events →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-xl font-bold text-[#0878D1]">
                🎓
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#172B45]">Mentorship</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Guide students through 1-on-1 mentorship, resume reviews, and career transition discussions.
              </p>
              <Link to="/mentorship" className="mt-4 inline-block text-xs font-semibold text-[#0878D1] hover:underline">
                Connect Mentors →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Core Features Spotlight */}
      <section className="bg-white py-16 border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Milestones</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Alumni Success Stories</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Read inspiring journeys of graduates leading teams, publishing groundbreaking research, and building ventures.
                </p>
              </div>
              <Link
                to="/stories"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Read Stories →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Impact</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Support the Community</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Contribute to student scholarship campaigns, laboratory equipment funds, and community hackathons.
                </p>
              </div>
              <Link
                to="/donations"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Explore Campaigns →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0878D1]">Voice</span>
                <h3 className="mt-2 text-xl font-bold text-[#172B45]">Feedback & Surveys</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Share your suggestions, recommend upcoming event topics, and provide constructive thoughts.
                </p>
              </div>
              <Link
                to="/feedback"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0878D1] hover:text-[#0665B2]"
              >
                Share Feedback →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="bg-gradient-to-r from-[#064477] to-[#0878D1] py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
            Stay Connected With Your Alumni Network
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-sky-100 leading-relaxed">
            Whether you graduated years ago or recently completed your degree, your experience matters to our growing community.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#064477] shadow-sm hover:bg-sky-50 transition"
            >
              Create Account
            </Link>
            <Link
              to="/directory"
              className="rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              Search Directory
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
