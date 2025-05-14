'use server'

import supabase from '../../lib/supabase';
import { hashPassword } from '../../utils/password';
import {z} from 'zod'

const userSchema = z.object({
    username: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string(),
    role: z.string(),
})

export async function createUser(credentials: z.infer<typeof userSchema>) {
    const data = userSchema.safeParse(credentials)   

    if(data.success === false){
        return { error: data.error.errors.map(e => e.message).join(', ') }
    }
    
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .maybeSingle()

    if (selectError) {
        return { error: selectError.message }
    }
    
    if (existingUser) {
        return { error: 'User with this email already exists' }
    }

    const { data: user, error: insertError } = await supabase
        .from('users')
        .insert({
            name: credentials.username,
            email: credentials.email,
            password_hash: await hashPassword(credentials.password),
            role: credentials.role || 'user',
        })
        .select()
        .single()

    if (insertError) {
        return { error: insertError.message }
    }
    
    return { data: user }
}

export async function updateUser(userId: string, data: z.infer<typeof userSchema>) {
    try {
      const user = await supabase.from('users').update({
        data
      }).eq('id', userId);
      return user;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2023') {
        return {
          data: "User not found",
          status: 404
        }
      } else {
        return {
          data: "Failed to update user",
          status: 500
        }
      }
    }
  }

  export async function getUsers() {
    const users = await supabase.from('users').select('*');
   if(users){
      return {data: users,status: 200}
   }  else {
      return {data: "No users found",status: 404}
   }
  }
