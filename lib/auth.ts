import type { NextAuthOptions } from "next-auth"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import clientPromise from "./mongodb"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const existingUser = await clientPromise.then((db) =>
          db.db("alika").collection("users").findOne({ email: user.email }),
        )

        if (!existingUser) {
          // Create new user with default role
          await clientPromise.then((db) =>
            db
              .db("alika")
              .collection("users")
              .updateOne(
                { email: user.email },
                {
                  $set: {
                    name: user.name || "",
                    email: user.email,
                    image: user.image || "",
                    role: "user",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                },
                { upsert: true },
              ),
          )
        } else {
          // Update user info if needed
          const updates: any = {}
          if (user.name && user.name !== existingUser.name) {
            updates.name = user.name
          }
          if (user.image && user.image !== existingUser.image) {
            updates.image = user.image
          }
          updates.updatedAt = new Date()

          if (Object.keys(updates).length > 0) {
            await clientPromise.then((db) =>
              db.db("alika").collection("users").updateOne({ _id: existingUser._id }, { $set: updates }),
            )
          }
        }

        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await clientPromise.then((db) =>
          db.db("alika").collection("users").findOne({ email: session.user.email }),
        )
        if (user) {
          session.user.id = user._id!.toString()
          session.user.role = user.role
          session.user.isActive = user.isActive
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "user" | "admin" | "moderator"
      isActive?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "user" | "admin" | "moderator"
  }
}
