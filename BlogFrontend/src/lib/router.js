export const homeRoute = { type: 'home' }

export function getRouteFromLocation() {
  const [, resource, id] = window.location.pathname.split('/')

  if (resource === 'posts' && id) {
    return { type: 'post', id }
  }

  if (resource === 'login') {
    return { type: 'login' }
  }

  if (resource === 'register') {
    return { type: 'register' }
  }

  if (resource === 'write') {
    return { type: 'write' }
  }

  if (resource === 'profile') {
    return { type: 'profile' }
  }

  return homeRoute
}

export function navigateTo(route) {
  const path =
    route.type === 'post'
      ? `/posts/${route.id}`
      : route.type === 'login'
        ? '/login'
        : route.type === 'register'
          ? '/register'
        : route.type === 'write'
            ? '/write'
            : route.type === 'profile'
              ? '/profile'
          : '/'
  window.history.pushState({}, '', path)
}
