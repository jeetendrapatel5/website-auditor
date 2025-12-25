import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseServer } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const { data: user, error } = await supabaseServer
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()
        
        if (error || !user) {
          console.log('User not found or error:', error)
          return null
        }
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )
        
        if (!isValid) {
          console.log('Invalid password')
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}