import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function StoryDetails() {
  const { storyId } = useParams()
  const [story, setStory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/success-stories/${storyId}`).then((result) => setStory(result.data)).catch((err) => setError(err.message))
  }, [storyId])

  if (error) return <p role="alert" className="mx-auto max-w-3xl px-6 py-12 text-red-700">{error}</p>
  if (!story) return <p className="mx-auto max-w-3xl px-6 py-12">Loading story…</p>
  return <article className="mx-auto max-w-3xl px-6 py-12">
    <Link to="/stories" className="text-indigo-700">← All stories</Link>
    <h1 className="mt-6 text-3xl font-bold">{story.title}</h1>
    <p className="mt-2 text-slate-600">By {story.authorName}</p>
    {story.imageUrl && <img src={story.imageUrl} alt="" className="mt-8 w-full rounded-xl" />}
    <p className="mt-8 whitespace-pre-wrap leading-relaxed">{story.content}</p>
  </article>
}
