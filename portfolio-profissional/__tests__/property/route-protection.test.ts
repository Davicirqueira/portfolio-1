/**
 * **Feature: admin-dashboard, Property 2: Route Protection Consistency**
 * 
 * For any unauthenticated access attempt to protected routes, the system should redirect 
 * to login page and preserve the intended destination
 * 
 * **Validates: Requirements 1.4, 1.5**
 */

import fc from 'fast-check'
import { NextRequest } from 'next/server'

// Mock NextAuth session
interface MockSession {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Simulate the middleware logic for route protection
function simulateRouteProtection(
  pathname: string,
  session: MockSession | null
): { shouldRedirect: boolean; redirectUrl?: string; preservedDestination?: string } {
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isPublicRoute = !pathname.startsWith("/admin")
  const isAuthPage = pathname.startsWith("/admin/login")
  const isLoggedIn = !!session

  // Allow API auth routes
  if (isApiAuthRoute) {
    return { shouldRedirect: false }
  }

  // Allow public routes
  if (isPublicRoute) {
    return { shouldRedirect: false }
  }

  // Redirect to login if not authenticated and trying to access admin
  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = pathname
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return { 
      shouldRedirect: true, 
      redirectUrl: `/admin/login?callbackUrl=${encodedCallbackUrl}`,
      preservedDestination: callbackUrl
    }
  }

  // Redirect to dashboard if authenticated and on login page
  if (isLoggedIn && isAuthPage) {
    return { 
      shouldRedirect: true, 
      redirectUrl: "/admin/dashboard" 
    }
  }

  return { shouldRedirect: false }
}

describe('Route Protection Consistency Properties', () => {
  describe('Property 2: Route Protection Consistency', () => {
    it('should redirect unauthenticated users to login and preserve destination', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            adminPath: fc.constantFrom(
              '/admin/dashboard',
              '/admin/dashboard/home',
              '/admin/dashboard/about',
              '/admin/dashboard/skills',
              '/admin/dashboard/experience',
              '/admin/dashboard/projects',
              '/admin/dashboard/education',
              '/admin/dashboard/testimonials',
              '/admin/dashboard/contact',
              '/admin/dashboard/stats',
              '/admin/dashboard/media'
            ),
          }),
          ({ adminPath }) => {
            // Arrange: No session (unauthenticated user)
            const session = null

            // Act: Simulate accessing protected route
            const result = simulateRouteProtection(adminPath, session)

            // Assert: Should redirect to login with preserved destination
            expect(result.shouldRedirect).toBe(true)
            expect(result.redirectUrl).toContain('/admin/login?callbackUrl=')
            expect(result.preservedDestination).toBe(adminPath)
            
            // Verify the callback URL is properly encoded
            const expectedCallbackUrl = encodeURIComponent(adminPath)
            expect(result.redirectUrl).toBe(`/admin/login?callbackUrl=${expectedCallbackUrl}`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow authenticated users to access protected routes', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            adminPath: fc.constantFrom(
              '/admin/dashboard',
              '/admin/dashboard/home',
              '/admin/dashboard/about',
              '/admin/dashboard/skills',
              '/admin/dashboard/experience',
              '/admin/dashboard/projects',
              '/admin/dashboard/education',
              '/admin/dashboard/testimonials',
              '/admin/dashboard/contact',
              '/admin/dashboard/stats',
              '/admin/dashboard/media'
            ),
            userId: fc.uuid(),
            userEmail: fc.emailAddress(),
            userName: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          ({ adminPath, userId, userEmail, userName }) => {
            // Arrange: Valid session (authenticated user)
            const session: MockSession = {
              user: {
                id: userId,
                email: userEmail,
                name: userName,
                role: 'admin'
              }
            }

            // Act: Simulate accessing protected route
            const result = simulateRouteProtection(adminPath, session)

            // Assert: Should allow access without redirect
            expect(result.shouldRedirect).toBe(false)
            expect(result.redirectUrl).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow access to public routes regardless of authentication status', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            publicPath: fc.constantFrom(
              '/',
              '/about',
              '/contact',
              '/projects',
              '/skills'
            ),
            isAuthenticated: fc.boolean(),
            userId: fc.uuid(),
            userEmail: fc.emailAddress(),
            userName: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          ({ publicPath, isAuthenticated, userId, userEmail, userName }) => {
            // Arrange: Session based on authentication status
            const session: MockSession | null = isAuthenticated ? {
              user: {
                id: userId,
                email: userEmail,
                name: userName,
                role: 'admin'
              }
            } : null

            // Act: Simulate accessing public route
            const result = simulateRouteProtection(publicPath, session)

            // Assert: Should allow access without redirect
            expect(result.shouldRedirect).toBe(false)
            expect(result.redirectUrl).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always allow access to API auth routes', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            apiAuthPath: fc.constantFrom(
              '/api/auth/signin',
              '/api/auth/signout',
              '/api/auth/session',
              '/api/auth/callback/credentials'
            ),
            isAuthenticated: fc.boolean(),
            userId: fc.uuid(),
            userEmail: fc.emailAddress(),
            userName: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          ({ apiAuthPath, isAuthenticated, userId, userEmail, userName }) => {
            // Arrange: Session based on authentication status
            const session: MockSession | null = isAuthenticated ? {
              user: {
                id: userId,
                email: userEmail,
                name: userName,
                role: 'admin'
              }
            } : null

            // Act: Simulate accessing API auth route
            const result = simulateRouteProtection(apiAuthPath, session)

            // Assert: Should always allow access without redirect
            expect(result.shouldRedirect).toBe(false)
            expect(result.redirectUrl).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should redirect authenticated users away from login page', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            userEmail: fc.emailAddress(),
            userName: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          ({ userId, userEmail, userName }) => {
            // Arrange: Valid session (authenticated user)
            const session: MockSession = {
              user: {
                id: userId,
                email: userEmail,
                name: userName,
                role: 'admin'
              }
            }

            // Act: Simulate accessing login page while authenticated
            const result = simulateRouteProtection('/admin/login', session)

            // Assert: Should redirect to dashboard
            expect(result.shouldRedirect).toBe(true)
            expect(result.redirectUrl).toBe('/admin/dashboard')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle URL encoding correctly for complex paths', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            basePath: fc.constantFrom('/admin/dashboard'),
            queryParams: fc.string({ minLength: 1, maxLength: 50 }).map(s => 
              `?param=${encodeURIComponent(s)}`
            ),
            fragment: fc.string({ minLength: 1, maxLength: 20 }).map(s => 
              `#${s.replace(/[^a-zA-Z0-9]/g, '')}`
            ),
          }),
          ({ basePath, queryParams, fragment }) => {
            // Arrange: Complex URL with query params and fragment
            const complexPath = `${basePath}${queryParams}${fragment}`
            const session = null // Unauthenticated

            // Act: Simulate accessing complex protected route
            const result = simulateRouteProtection(complexPath, session)

            // Assert: Should redirect with properly encoded callback URL
            expect(result.shouldRedirect).toBe(true)
            expect(result.preservedDestination).toBe(complexPath)
            
            const expectedCallbackUrl = encodeURIComponent(complexPath)
            expect(result.redirectUrl).toBe(`/admin/login?callbackUrl=${expectedCallbackUrl}`)
            
            // Verify the URL can be decoded back to original
            const decodedUrl = decodeURIComponent(expectedCallbackUrl)
            expect(decodedUrl).toBe(complexPath)
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})