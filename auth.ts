/* eslint-disable */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { comparePassword } from "./utils/password";
import supabase from "./lib/supabase";

interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  role: string;
}

const providers = [
  Credentials({
    name: "Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials: any) {
      const { data: user } = await supabase
        .from('users')
        .select()
        .eq('email', credentials.email)
        .single<User>();
      if (!user) {
        throw new Error(`No user found with email ${credentials.email}, please signup first.`);
      }
      const isValid = await comparePassword(credentials.password, user.password_hash);
      if (!isValid){
        throw new Error("Kindly enter correct password");
      }
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }),
  Google({
    clientId: process.env.GOOGLE_ID || "",
    clientSecret: process.env.GOOGLE_SECRET || "",
  }),
];

export default NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user, error }: any) {
      if (error) {
        token.error = error.message;
      }
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token}: any) {
      if (token && session.user) {
        const { data: user } = await supabase
          .from('users')
          .select()
          .eq('email', session.user.email! )
          .single<User>();
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
        if (account && account.provider !== "credentials") {
          const { data } = await supabase
            .from('users')
            .select()
            .eq('email', user.email?? "" )
            .single<User>();
          if (!data) {
            return '/auth/signin?error=No user found with this email, please signup first';
          }
        }
        return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    signOut: "/",
  },
});