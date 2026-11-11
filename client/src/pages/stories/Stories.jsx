import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'

export default function Stories() {
  const { session } = useAuth()
  const [stories, setStories] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/success-stories?page=${page}`)
      .then((result) => { setStories(result.data || []); setPages(result.pagination?.totalPages || 1); setError('') })
      .catch((err) => setError(err.message))
  }, [page])

  return <section className="mx-auto max-w-6xl px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Alumni success stories</h1><p className="mt-2 text-slate-600">Discover achievements from our alumni community.</p></div>
      {session?.role === 'ALUMNI' && <Link to="/stories/new" className="rounded bg-indigo-700 px-5 py-3 text-white">Share your story</Link>}
    </div>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!error && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => <article key={story.id} className="overflow-hidden rounded-xl border bg-white">
        {story.imageUrl && <img src={story.imageUrl} alt="" className="h-44 w-full object-cover" />}
        <div className="p-6"><h2 className="text-xl font-bold">{story.title}</h2><p className="mt-2 text-sm text-slate-600">By {story.authorName}</p><p className="mt-3 line-clamp-3">{story.content}</p><Link to={`/stories/${story.id}`} className="mt-4 inline-block font-semibold text-indigo-700">Read story</Link></div>
      </article>)}
    </div>}
    {!error && !stories.length && <p className="mt-8">No published stories yet.</p>}
    <nav aria-label="Story pages" className="mt-8 flex justify-center gap-4">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </nav>
  </section>
}
