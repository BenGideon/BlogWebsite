import { useEffect, useState } from 'react'
import './index.css'
import SiteHeader from './components/SiteHeader'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import AuthPage from './pages/AuthPage'
import CreatePostPage from './pages/CreatePostPage'
import ProfilePage from './pages/ProfilePage'
import { requestJson } from './lib/api'
import { getRouteFromLocation, homeRoute, navigateTo } from './lib/router'
import {
  clearSession,
  getStoredSession,
  storeSession,
  updateStoredSessionUser,
} from './lib/session'

function App() {
  const [route, setRoute] = useState(() => getRouteFromLocation())
  const [session, setSession] = useState(() => getStoredSession())
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedPostLoading, setSelectedPostLoading] = useState(false)
  const [selectedPostError, setSelectedPostError] = useState('')

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const syncSession = () => {
      setSession(getStoredSession())
    }

    window.addEventListener('sessionchange', syncSession)
    window.addEventListener('storage', syncSession)

    return () => {
      window.removeEventListener('sessionchange', syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPosts() {
      setPostsLoading(true)
      setPostsError('')

      try {
        const result = await requestJson('/api/posts')
        if (!cancelled) {
          setPosts(result)
        }
      } catch (error) {
        if (!cancelled) {
          setPostsError('Unable to load posts from the backend right now.')
        }
      } finally {
        if (!cancelled) {
          setPostsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (route.type !== 'post') {
      setSelectedPost(null)
      setSelectedPostError('')
      setSelectedPostLoading(false)
      return
    }

    let cancelled = false

    async function loadPost() {
      setSelectedPostLoading(true)
      setSelectedPostError('')

      try {
        const result = await requestJson(`/api/posts/${route.id}`)
        if (!cancelled) {
          setSelectedPost(result)
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedPostError('Unable to load this post. It may not exist anymore.')
        }
      } finally {
        if (!cancelled) {
          setSelectedPostLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      cancelled = true
    }
  }, [route])

  function handleOpenPost(id) {
    goTo({ type: 'post', id })
  }

  function handleBackHome() {
    goTo(homeRoute)
  }

  function handleGoToLogin() {
    goTo({ type: 'login' })
  }

  function handleGoToRegister() {
    goTo({ type: 'register' })
  }

  function handleGoToWrite() {
    goTo({ type: 'write' })
  }

  function handleGoToProfile() {
    goTo({ type: 'profile' })
  }

  function handleAuthSuccess(nextSession) {
    storeSession(nextSession)
    setSession(nextSession)
    handleBackHome()
  }

  function handleLogout() {
    clearSession()
    setSession(null)
    handleBackHome()
  }

  function handleCreatedPost(createdPost) {
    setPosts((currentPosts) => [
      createdPost,
      ...currentPosts.filter((post) => post.id !== createdPost.id),
    ])
    handleOpenPost(createdPost.id)
  }

  function handleUpdatedPost(updatedPost) {
    setSelectedPost(updatedPost)
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    )
  }

  function handleDeletedPost(postId) {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId))
    if (selectedPost?.id === postId) {
      setSelectedPost(null)
    }
    handleBackHome()
  }

  function handleProfileUpdated(updatedUser) {
    updateStoredSessionUser(updatedUser)
    setSession(getStoredSession())
    handleBackHome()
  }

  function goTo(nextRoute) {
    navigateTo(nextRoute)
    setRoute(nextRoute)
  }

  const pageContent =
    route.type === 'post' ? (
      <PostPage
        post={selectedPost}
        loading={selectedPostLoading}
        error={selectedPostError}
        onBack={handleBackHome}
        session={session}
        onGoLogin={handleGoToLogin}
        onPostUpdated={handleUpdatedPost}
        onPostDeleted={handleDeletedPost}
      />
    ) : route.type === 'login' || route.type === 'register' ? (
      <AuthPage
        mode={route.type}
        currentUser={session?.user ?? null}
        onSwitchMode={route.type === 'login' ? handleGoToRegister : handleGoToLogin}
        onAuthSuccess={handleAuthSuccess}
        onGoHome={handleBackHome}
      />
    ) : route.type === 'write' ? (
      <CreatePostPage
        session={session}
        onCreatedPost={handleCreatedPost}
        onGoLogin={handleGoToLogin}
        onGoHome={handleBackHome}
      />
    ) : route.type === 'profile' ? (
      <ProfilePage
        session={session}
        onProfileUpdated={handleProfileUpdated}
        onGoHome={handleBackHome}
        onGoLogin={handleGoToLogin}
      />
    ) : (
      <HomePage
        posts={posts}
        loading={postsLoading}
        error={postsError}
        onOpenPost={handleOpenPost}
      />
    )

  return (
    <div className="app-shell">
      <SiteHeader
        currentUser={session?.user ?? null}
        onGoHome={handleBackHome}
        onGoLogin={handleGoToLogin}
        onGoRegister={handleGoToRegister}
        onGoProfile={handleGoToProfile}
        onGoWrite={handleGoToWrite}
        onLogout={handleLogout}
      />
      <main key={route.type === 'post' ? `post-${route.id}` : route.type} className="app-view">
        {pageContent}
      </main>
    </div>
  )
}

export default App
