import { useState } from 'react'
import { requestJson } from '../lib/api'

function AuthPage({ mode, currentUser, onSwitchMode, onAuthSuccess, onGoHome }) {
  const isRegister = mode === 'register'
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
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
    setSubmitting(true)
    setError('')

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
    const payload = isRegister
      ? {
          username: formState.username,
          email: formState.email,
          password: formState.password,
          role: 'user',
          profile: {
            firstName: formState.firstName,
            lastName: formState.lastName,
            bio: formState.bio,
          },
        }
      : {
          email: formState.email,
          password: formState.password,
        }

    try {
      const session = await requestJson(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      onAuthSuccess(session)
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (currentUser) {
    return (
      <div className="page-shell container-xl">
        <section className="auth-panel">
          <p className="eyebrow">Authentication</p>
          <h1>You are already signed in.</h1>
          <p className="auth-panel__summary">
            Your current session belongs to <strong>{currentUser.username}</strong>.
          </p>
          <button className="btn btn-brand" onClick={onGoHome}>
            Go to homepage
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="page-shell container-xl">
      <section className="auth-panel">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-5">
            <div className="auth-panel__intro">
              <p className="eyebrow">{isRegister ? 'Sign Up' : 'Sign In'}</p>
              <h1>{isRegister ? 'Create your blog account.' : 'Welcome back.'}</h1>
              <p className="auth-panel__summary">
                {isRegister
                  ? 'Join the writing side of the blog and start publishing, commenting, and managing your profile.'
                  : 'Use your email and password to unlock protected writing and discussion tools.'}
              </p>

              <div className="auth-panel__feature-list">
                <div>
                  <strong>Minimal auth flow</strong>
                  <span>JWT-backed access connected to your .NET API.</span>
                </div>
                <div>
                  <strong>Editorial UI</strong>
                  <span>Cleaner forms, clearer feedback, and responsive spacing.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                {isRegister ? (
                  <div className="col-12">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      required
                      {...bindField('username')}
                      placeholder="bengideon"
                    />
                  </div>
                ) : null}

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    required
                    type="email"
                    {...bindField('email')}
                    placeholder="ben@example.com"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    required
                    type="password"
                    {...bindField('password')}
                    placeholder="password123"
                  />
                </div>

                {isRegister ? (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">First name</label>
                      <input className="form-control" {...bindField('firstName')} placeholder="Ben" />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Last name</label>
                      <input className="form-control" {...bindField('lastName')} placeholder="Gideon" />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        {...bindField('bio')}
                        placeholder="Backend developer and blog writer."
                      />
                    </div>
                  </>
                ) : null}
              </div>

              {error ? <div className="notice notice--error mt-4">{error}</div> : null}

              <div className="auth-panel__switch mt-4">
                <button className="btn btn-brand auth-form__submit" disabled={submitting}>
                  {submitting
                    ? isRegister
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isRegister
                      ? 'Create account'
                      : 'Sign in'}
                </button>
                <div className="auth-panel__switch-copy">
                  <span>{isRegister ? 'Already have an account?' : 'Need an account?'}</span>
                  <button className="btn btn-ghost" type="button" onClick={onSwitchMode}>
                    {isRegister ? 'Go to sign in' : 'Go to sign up'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AuthPage
