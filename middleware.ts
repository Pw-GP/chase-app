import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/api/items(.*)',
  '/api/projects(.*)'
])

const isDemoRoute = createRouteMatcher(['/demo(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isDemoRoute(req)) return
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
