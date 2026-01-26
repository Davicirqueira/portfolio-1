import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SecurityMonitor } from "@/lib/security/monitor"
import { SessionManager } from "@/lib/security/session-manager"
import { headers } from "next/headers"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data
          
          const user = await prisma.user.findUnique({
            where: { email }
          })
          
          if (!user || !user.password) {
            // Record failed login attempt
            const headersList = await headers()
            const ipAddress = headersList.get('x-forwarded-for') || 
                             headersList.get('x-real-ip') || 
                             'unknown'
            const userAgent = headersList.get('user-agent') || 'unknown'
            
            await SecurityMonitor.recordFailedLogin(email, ipAddress, userAgent)
            return null
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password)
          
          if (passwordsMatch) {
            // Create session tracking
            await SessionManager.createSession(user.id, user.email, user.name, user.role)
            
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          } else {
            // Record failed login attempt
            const headersList = await headers()
            const ipAddress = headersList.get('x-forwarded-for') || 
                             headersList.get('x-real-ip') || 
                             'unknown'
            const userAgent = headersList.get('user-agent') || 'unknown'
            
            await SecurityMonitor.recordFailedLogin(email, ipAddress, userAgent)
          }
        }
        
        return null
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login')
      
      if (isOnAdmin) {
        if (isOnLogin) {
          return true // Always allow access to login page
        }
        return isLoggedIn // Require auth for other admin pages
      }
      
      return true // Allow access to public pages
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signOut({ session }) {
      if (session?.user?.id) {
        await SessionManager.removeSession(session.user.id)
      }
    },
  },
}