import PostCard from '../components/PostCard'
import { formatDate } from '../lib/date'

function HomePage({ posts, loading, error, onOpenPost }) {
  const featuredPost = posts[0]

  return (
    <div className="page-shell container-xl">
      <header className="hero-panel row g-4 align-items-stretch">
        <div className="col-lg-7">
          <div className="hero-panel__copy">
            <p className="eyebrow">Editorial Frontend</p>
            <h1>White space, rose gold accents, and stories that stay center stage.</h1>
            <p className="hero-panel__summary">
              This interface reads directly from your .NET blog API and presents your posts in a
              cleaner editorial layout built for desktop and mobile.
            </p>
            <div className="hero-panel__actions">
              <button
                className="btn btn-brand"
                onClick={() => featuredPost && onOpenPost(featuredPost.id)}
                disabled={!featuredPost}
              >
                Read latest story
              </button>
              <span className="hero-panel__microcopy">Responsive, animated, and API-backed.</span>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="hero-panel__stats">
            <div>
              <span className="eyebrow mb-0">Live count</span>
              <strong>{posts.length}</strong>
              <span>Published entries</span>
            </div>
            <div>
              <span className="eyebrow mb-0">Latest activity</span>
              <strong>{featuredPost ? formatDate(featuredPost.createdAt) : 'Waiting'}</strong>
              <span>Newest update from the backend</span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <section className="row g-4 posts-grid posts-grid--loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="col-md-6 col-xl-4">
              <article className="post-card skeleton-block" />
            </div>
          ))}
        </section>
      ) : null}
      {error ? <section className="notice notice--error">{error}</section> : null}

      {!loading && !error && featuredPost ? (
        <section className="featured-post">
          <div className="featured-post__label">Latest article</div>
          <h2>{featuredPost.title}</h2>
          <p>{featuredPost.content}</p>
          <button className="btn btn-brand" onClick={() => onOpenPost(featuredPost.id)}>
            Open latest post
          </button>
        </section>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <section className="notice">No posts yet. Create one from the backend first.</section>
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <section className="row g-4 posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="col-md-6 col-xl-4">
              <PostCard post={post} onOpen={onOpenPost} />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default HomePage
