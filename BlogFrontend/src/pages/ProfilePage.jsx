import { useState } from 'react'
import { requestJson } from '../lib/api'

function ProfilePage({ session, onProfileUpdated, onGoHome, onGoLogin }) {
  const user = session?.user
  const [formState, setFormState] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'user',
    firstName: user?.profile?.firstName ?? '',
    lastName: user?.profile?.lastName ?? '',
    bio: user?.profile?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
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

    if (!user?.id) {
      setError('Please sign in to update your profile.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const updatedUser = await requestJson(`/api/users/${user.id}`, {
        method: 'PUT',
        auth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formState.username,
          email: formState.email,
          role: formState.role,
          profile: {
            firstName: formState.firstName,
            lastName: formState.lastName,
            bio: formState.bio,
          },
        }),
      })

      onProfileUpdated(updatedUser)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="page-shell container-xl">
        <section className="auth-panel">
          <p className="eyebrow">Profile</p>
          <h1>Sign in to manage your profile.</h1>
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
          <p className="eyebrow">Profile</p>
          <h1>Update your account details.</h1>
        </div>

        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input className="form-control" required {...bindField('username')} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" required type="email" {...bindField('email')} />
            </div>

            <div className="col-md-6">
              <label className="form-label">First name</label>
              <input className="form-control" {...bindField('firstName')} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Last name</label>
              <input className="form-control" {...bindField('lastName')} />
            </div>

            <div className="col-12">
              <label className="form-label">Bio</label>
              <textarea className="form-control" rows="4" {...bindField('bio')} />
            </div>
          </div>

          {error ? <div className="notice notice--error mt-4">{error}</div> : null}

          <div className="editor-form__actions mt-4">
            <button className="btn btn-ghost" type="button" onClick={onGoHome}>
              Cancel
            </button>
            <button className="btn btn-brand" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage
