import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./app/lib/config/db"
import { validateUserCredentials } from "./app/lib/auth-actions"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [Google({authorization: {params: {prompt: "select_account"}}}),
        Credentials({
          name: "Credentials",
          credentials: {},
          async authorize(credentials) {
            return await validateUserCredentials(credentials as Record<string, string>)
          }
        })
  ],
  session: {
    strategy: "jwt", 
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
