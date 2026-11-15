import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function StoryDetails() {
  const { storyId } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    apiRequest(`/success-stories/${storyId}`)
      .then((result) => {
        if (!isMounted) return
        setStory(result.data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [storyId])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-500">
        Loading story details…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <p className="font-semibold">Unable to display story</p>
          <p className="mt-1">{error}</p>
          <Link to="/stories" className="mt-4 inline-block font-semibold text-[#0878D1] hover:underline">
            ← Back to all stories
          </Link>
        </div>
      </div>
    )
  }

  if (!story) return null

  const authorName = story.author?.fullName || story.authorName || 'Alumni Member'
  const authorYear = story.author?.graduationYear
    ? `Class of ${story.author.graduationYear}`
    : null
  const authorDept = story.author?.department
  const publishDate = story.publishedAt || story.createdAt
    ? new Date(story.publishedAt || story.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  // Approximate reading time
  const wordCount = story.content ? story.content.split(/\s+/).length : 0
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Navigation link */}
      <div>
        <Link
          to="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0878D1] hover:underline"
        >
          ← Back to Stories
        </Link>
      </div>

      {/* Main Story Container */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
        <span className="inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#0878D1]">
          Alumni Spotlight
        </span>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B45] sm:text-4xl leading-tight">
          {story.title}
        </h1>

        {/* Author & Meta bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-100 py-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878D1] to-[#004B87] font-bold text-white shadow-xs">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900">{authorName}</p>
              <p className="text-[11px] text-slate-500">
                {authorDept} {authorYear ? `• ${authorYear}` : ''}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-slate-400">
            {publishDate && <span>📅 {publishDate}</span>}
            <span>•</span>
            <span>⏱️ {readTimeMinutes} min read</span>
          </div>
        </div>

        {/* Featured Image */}
        {story.imageUrl && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="max-h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="mt-8 prose prose-slate max-w-none text-base text-slate-700 leading-relaxed whitespace-pre-line">
          {story.content}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl bg-slate-50 p-6 text-center border border-slate-200/80">
          <h3 className="text-base font-bold text-[#172B45]">Inspired by this story?</h3>
          <p className="mt-1 text-xs text-slate-600">
            Share your own journey or connect with fellow alumni on the platform.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/stories/new"
              className="rounded-xl bg-[#0878D1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2] transition"
            >
              Share Your Story
            </Link>
            <Link
              to="/directory"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              Browse Alumni Directory
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
