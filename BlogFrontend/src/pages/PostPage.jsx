import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'
import { formatDate } from '../lib/date'

function PostPage({ post, loading, error, onBack, session, onGoLogin, onPostUpdated, onPostDeleted }) {
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentSubmitError, setCommentSubmitError] = useState('')
  const [postEditMode, setPostEditMode] = useState(false)
  const [postFormState, setPostFormState] = useState({ title: '', content: '' })
  const [postActionError, setPostActionError] = useState('')
  const [postActionLoading, setPostActionLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentBody, setEditingCommentBody] = useState('')
  const [commentActionError, setCommentActionError] = useState('')
  const [commentActionLoadingId, setCommentActionLoadingId] = useState(null)

  const currentUser = session?.user ?? null
  const canManagePost =
    !!currentUser && !!post && (currentUser.id === post.authorId || currentUser.role === 'admin')

  useEffect(() => {
    if (!post?.id) {
      setComments([])
      setCommentsLoading(false)
      setCommentsError('')
      return
    }

    let cancelled = false

    async function loadComments() {
      setCommentsLoading(true)
      setCommentsError('')

      try {
        const result = await requestJson('/api/comments')

        if (!cancelled) {
          setComments(result.filter((comment) => comment.postId === post.id))
        }
      } catch (loadError) {
        if (!cancelled) {
          setCommentsError('Unable to load comments for this post right now.')
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      cancelled = true
    }
  }, [post?.id])

  useEffect(() => {
    if (!post) {
      return
    }

    setPostFormState({
      title: post.title ?? '',
      content: post.content ?? '',
    })
    setPostEditMode(false)
    setPostActionError('')
  }, [post])

  async function handleCommentSubmit(event) {
    event.preventDefault()

    if (!session?.token || !post?.id) {
      setCommentSubmitError('You need to sign in before commenting.')
      return
    }

    setCommentSubmitting(true)
    setCommentSubmitError('')

    try {
      const createdComment = await requestJson('/api/comments', {
        method: 'POST',
        auth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: commentBody,
          parentId: null,
        }),
      })

      setComments((currentComments) => [createdComment, ...currentComments])
      setCommentBody('')
    } catch (submissionError) {
      setCommentSubmitError(submissionError.message)
    } finally {
      setCommentSubmitting(false)
    }
  }

  async function handlePostUpdate(event) {
    event.preventDefault()

    if (!post?.id) {
      return
    }

    setPostActionLoading(true)
    setPostActionError('')

    try {
      const updatedPost = await requestJson(`/api/posts/${post.id}`, {
        method: 'PUT',
        auth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postFormState.title,
          content: postFormState.content,
        }),
      })

      onPostUpdated(updatedPost)
      setPostEditMode(false)
    } catch (requestError) {
      setPostActionError(requestError.message)
    } finally {
      setPostActionLoading(false)
    }
  }

  async function handlePostDelete() {
    if (!post?.id) {
      return
    }

    setPostActionLoading(true)
    setPostActionError('')

    try {
      await requestJson(`/api/posts/${post.id}`, {
        method: 'DELETE',
        auth: true,
      })

      onPostDeleted(post.id)
    } catch (requestError) {
      setPostActionError(requestError.message)
      setPostActionLoading(false)
    }
  }

  async function handleCommentDelete(commentId) {
    setCommentActionLoadingId(commentId)
    setCommentActionError('')

    try {
      await requestJson(`/api/comments/${commentId}`, {
        method: 'DELETE',
        auth: true,
      })

      setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId))
    } catch (requestError) {
      setCommentActionError(requestError.message)
    } finally {
      setCommentActionLoadingId(null)
    }
  }

  async function handleCommentUpdate(event) {
    event.preventDefault()

    if (!editingCommentId) {
      return
    }

    setCommentActionLoadingId(editingCommentId)
    setCommentActionError('')

    try {
      const updatedComment = await requestJson(`/api/comments/${editingCommentId}`, {
        method: 'PUT',
        auth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editingCommentBody,
        }),
      })

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        )
      )
      setEditingCommentId(null)
      setEditingCommentBody('')
    } catch (requestError) {
      setCommentActionError(requestError.message)
    } finally {
      setCommentActionLoadingId(null)
    }
  }

  function startCommentEdit(comment) {
    setEditingCommentId(comment.id)
    setEditingCommentBody(comment.content)
    setCommentActionError('')
  }

  function cancelCommentEdit() {
    setEditingCommentId(null)
    setEditingCommentBody('')
    setCommentActionError('')
  }

  return (
    <div className="page-shell container-xl">
      <button className="btn btn-link back-link" onClick={onBack}>
        Back to posts
      </button>

      {loading ? <section className="post-view skeleton-block post-view--loading" /> : null}
      {error ? <section className="notice notice--error">{error}</section> : null}

      {!loading && !error && post ? (
        <article className="post-view">
          <div className="post-view__header">
            <p className="eyebrow">Single Post View</p>
            <h1>{post.title}</h1>
            <div className="post-view__meta">
              <span className="post-card__pill">Created {formatDate(post.createdAt)}</span>
              <span className="post-card__pill">Updated {formatDate(post.updatedAt)}</span>
              <span className="post-card__pill post-card__pill--accent">
                Author {post.author?.displayName ?? post.author?.username ?? post.authorId}
              </span>
            </div>
          </div>

          <div className="post-view__content">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={`${post.id}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {canManagePost ? (
            <section className="editor-panel editor-panel--inline">
              <div className="comments-panel__header">
                <div>
                  <p className="eyebrow">Post controls</p>
                  <h2>Manage this post</h2>
                </div>
                <div className="editor-form__actions">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setPostEditMode((current) => !current)}
                  >
                    {postEditMode ? 'Close editor' : 'Edit post'}
                  </button>
                  <button
                    className="btn btn-brand-outline"
                    type="button"
                    onClick={handlePostDelete}
                    disabled={postActionLoading}
                  >
                    {postActionLoading ? 'Deleting...' : 'Delete post'}
                  </button>
                </div>
              </div>

              {postActionError ? <div className="notice notice--error">{postActionError}</div> : null}

              {postEditMode ? (
                <form className="editor-form" onSubmit={handlePostUpdate}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        required
                        value={postFormState.title}
                        onChange={(event) =>
                          setPostFormState((current) => ({ ...current, title: event.target.value }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Content</label>
                      <textarea
                        className="form-control form-control--tall"
                        rows="10"
                        required
                        value={postFormState.content}
                        onChange={(event) =>
                          setPostFormState((current) => ({ ...current, content: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <button className="btn btn-brand editor-form__submit mt-4" disabled={postActionLoading}>
                    {postActionLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              ) : null}
            </section>
          ) : null}

          <section className="comments-panel">
            <div className="comments-panel__header">
              <div>
                <p className="eyebrow">Comments</p>
                <h2>{comments.length} conversation{comments.length === 1 ? '' : 's'}</h2>
              </div>
              {session?.user ? (
                <div className="comments-panel__auth-state">
                  Signed in as <strong>{session.user.username}</strong>
                </div>
              ) : (
                <button className="btn btn-ghost" onClick={onGoLogin}>
                  Sign in to comment
                </button>
              )}
            </div>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <label className="form-label">Add a comment</label>
              <textarea
                className="form-control"
                required
                rows="4"
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder={
                  session?.user
                    ? 'Share your thoughts about this post...'
                    : 'Sign in first to leave a comment.'
                }
                disabled={!session?.user || commentSubmitting}
              />

              {commentSubmitError ? (
                <div className="notice notice--error">{commentSubmitError}</div>
              ) : null}

              <button
                className="btn btn-brand comment-form__submit"
                disabled={!session?.user || commentSubmitting || !commentBody.trim()}
              >
                {commentSubmitting ? 'Publishing comment...' : 'Publish comment'}
              </button>
            </form>

            {commentsLoading ? <div className="notice">Loading comments...</div> : null}
            {commentsError ? <div className="notice notice--error">{commentsError}</div> : null}
            {commentActionError ? <div className="notice notice--error">{commentActionError}</div> : null}

            {!commentsLoading && !commentsError && comments.length === 0 ? (
              <div className="notice">No comments yet. Be the first to respond.</div>
            ) : null}

            {!commentsLoading && !commentsError && comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment) => (
                  <article key={comment.id} className="comment-card">
                    <div className="comment-card__meta">
                      <span className="post-card__pill">{formatDate(comment.createdAt)}</span>
                      <span className="post-card__pill post-card__pill--accent">
                        Author {comment.author?.displayName ?? comment.author?.username ?? comment.authorId}
                      </span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <form className="comment-form" onSubmit={handleCommentUpdate}>
                        <label className="form-label">Edit comment</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          required
                          value={editingCommentBody}
                          onChange={(event) => setEditingCommentBody(event.target.value)}
                        />
                        <div className="editor-form__actions">
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={cancelCommentEdit}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-brand"
                            disabled={commentActionLoadingId === comment.id}
                          >
                            {commentActionLoadingId === comment.id ? 'Saving...' : 'Save comment'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p>{comment.content}</p>
                    )}

                    {!!currentUser &&
                    (currentUser.id === comment.authorId || currentUser.role === 'admin') &&
                    editingCommentId !== comment.id ? (
                      <div className="editor-form__actions">
                        <button className="btn btn-ghost" onClick={() => startCommentEdit(comment)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-brand-outline"
                          onClick={() => handleCommentDelete(comment.id)}
                          disabled={commentActionLoadingId === comment.id}
                        >
                          {commentActionLoadingId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </article>
      ) : null}
    </div>
  )
}

export default PostPage
