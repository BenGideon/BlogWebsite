import { formatDate } from '../lib/date'

function PostCard({ post, onOpen }) {
  const preview =
    post.content.length > 180 ? `${post.content.slice(0, 180).trim()}...` : post.content

  return (
    <article className="post-card h-100">
      <div className="post-card__meta">
        <span className="post-card__pill">{formatDate(post.createdAt)}</span>
        <span className="post-card__pill post-card__pill--accent">Post</span>
        <span>{post.author?.displayName ?? post.author?.username ?? 'Unknown author'}</span>
      </div>
      <h2>{post.title}</h2>
      <p>{preview}</p>
      <button className="btn btn-ghost align-self-start" onClick={() => onOpen(post.id)}>
        Read article
      </button>
    </article>
  )
}

export default PostCard
