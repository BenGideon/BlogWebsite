import { useState } from 'react'
import { requestJson } from '../lib/api'

function CreatePostPage({ session, onCreatedPost, onGoLogin, onGoHome }) {
  const [formState, setFormState] = useState({
    title: '',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function bindField(field) {
    return {
      value: formState[field],
      onChange: (event) => {
        setFormState((current) => ({ ...current, [field]: event.target.value }))
      },
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!session?.token) {
      setError('You need to sign in before creating a post.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const createdPost = await requestJson('/api/posts', {
        method: 'POST',
        auth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          content: formState.content,
        }),
      })

      onCreatedPost(createdPost)
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="page-shell container-xl">
        <section className="auth-panel">
          <p className="eyebrow">Protected Writing</p>
          <h1>Sign in before publishing.</h1>
          <p className="auth-panel__summary">
            Post creation is protected by your backend, so this screen needs a valid
            JWT session first.
          </p>
          <div className="auth-panel__switch">
            <button className="btn btn-ghost" onClick={onGoHome}>
              Back home
            </button>
            <button className="btn btn-brand" onClick={onGoLogin}>
              Go to sign in
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-shell container-xl">
      <section className="editor-panel">
        <div className="editor-panel__intro">
          <p className="eyebrow">Create Post</p>
          <h1>Write something worth publishing.</h1>
          <p className="auth-panel__summary">
            This form sends your post to the protected backend endpoint using the JWT
            from your current session.
          </p>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Title</label>
              <input
                className="form-control"
                required
                {...bindField('title')}
                placeholder="A better way to structure a blog frontend"
              />
            </div>

            <div className="col-12">
              <label className="form-label">Content</label>
              <textarea
                className="form-control form-control--tall"
                required
                rows="12"
                {...bindField('content')}
                placeholder="Write your post content here..."
              />
            </div>
          </div>

          {error ? <div className="notice notice--error mt-4">{error}</div> : null}

          <div className="editor-form__actions mt-4">
            <button className="btn btn-ghost" type="button" onClick={onGoHome}>
              Cancel
            </button>
            <button className="btn btn-brand" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish post'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreatePostPage
