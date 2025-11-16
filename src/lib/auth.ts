import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import VkProvider from 'next-auth/providers/vk'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Необходимо указать email и пароль')
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email
        },
        include: {
          ngo: true
        }
      })

      if (!user || !user.password) {
        throw new Error('Неверный email или пароль')
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error('Неверный email или пароль')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      }
    }
  })
]

// Add VK OAuth provider only if credentials are configured
if (process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET) {
  providers.push(
    VkProvider({
      clientId: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.user_id?.toString() || profile.id?.toString(),
          name: profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.screen_name,
          email: profile.email || `vk${profile.user_id || profile.id}@vk.com`,
          image: profile.photo_200 || profile.photo_100,
        }
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On sign in, add role and id to token
      if (user) {
        // Fetch the user from database to get the role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        token.role = dbUser?.role || 'VOLUNTEER'
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  events: {
    async createUser({ user }) {
      // Set default role for OAuth users
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'VOLUNTEER' }
        })
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
