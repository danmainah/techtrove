import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import supabase from "./lib/supabase";


const providers =  [
    Credentials({
        name: "Password",
        credentials: {
            email: {
                label: "Email",
                type: "email",
                placeholder: "Email",
            },
            password: {
                label: "Password",
                type: "password",
                placeholder: "Password",
            },
        },
        async authorize(credentials) {
           const user = await supabase.from('users').select().eq('email', credentials?.email as string).single()
            if (!user) {
                return null
            }
            const isValid = await compare(credentials?.password as string, user.data.password_hash)
            if (!isValid) {
                return null
            }
            return {
              id: user.data.id,
              name: user.data.name,
              email: user.data.email,
            }
        }
    }), GoogleProvider({
        clientId: process.env.GOOGLE_ID as string,
        clientSecret: process.env.GOOGLE_SECRET as string,
        async profile(profile: { email: string; name: string; picture: string }) {
          const user = await supabase.from('users').select().eq('email', profile.email).single()  
          if (!user) {
            throw new Error(`No user found with this email, please signup first.`);
          }
          return {
            id:user.data.id,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          }
        },
      })
]

export default NextAuth({
    providers,
    pages: {
       signIn: '/auth/signin',
       signOut: '/',
        error: '/auth/error', // Error code passed in query string as ?error=
      },
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            const dbUser = await supabase.from('users').select().eq('email', user.email ?? "").single();
            if (dbUser) {
              token.id = dbUser.data.id; 
            }
          }
          return token;
        },
        async session({ session, token }) {
          if (token && session.user) {
            const user = await supabase.from('users').select().eq('email', session.user.email ?? "").single();
            if (user) {
              (session.user as any).id = user.data.id;
              (session.user as any).role = user.data.role;
            }
          }
          return session;
        },
        async signIn({ user, account }) {
          if (account && account.provider !== "credentials") {
            const data = await supabase.from('users').select().eq('email', user.email?? "").single();
            if (!data) {
              return '/auth/signin?error=No user found with this email, please signup first';
            }
          }
          return true;
      },
      },
})