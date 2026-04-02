function SiteHeader({
  currentUser,
  onGoHome,
  onGoLogin,
  onGoRegister,
  onGoProfile,
  onGoWrite,
  onLogout,
}) {
  return (
    <header className="site-header">
      <div className="container-xl site-header__inner">
        <button className="site-header__brand" onClick={onGoHome}>
          <span className="site-header__kicker">SimplyCodes</span>
          <span className="site-header__title">Blog Atelier</span>
        </button>

        <div className="site-header__actions">
          {currentUser ? (
            <>
              <button className="btn btn-ghost" onClick={onGoProfile}>
                Profile
              </button>
              <button className="btn btn-ghost" onClick={onGoWrite}>
                Write post
              </button>
              <div className="site-header__user">
                <span className="site-header__welcome">Signed in as</span>
                <strong>{currentUser.username}</strong>
              </div>
              <button className="btn btn-brand-outline" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onGoLogin}>
                Sign in
              </button>
              <button className="btn btn-brand" onClick={onGoRegister}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
