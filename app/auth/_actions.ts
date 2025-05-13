'use server'

import supabase from '../../lib/supabase';
import { hashPassword } from '../../utils/password';
import {z} from 'zod'

interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

const userSchema = z.object({
    username: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string(),
    role: z.string(),
})

export async function createUser(credentials: z.infer<typeof userSchema>) {
    const data = userSchema.safeParse(credentials)   

    if(data.success === false){
        return data.error.cause
    }
    
    const registedUser = await supabase.from('users').select('*').eq('email', credentials.email).single()

    if(registedUser){
        return {data: "user already exists",status: 409}
    } else {
        const user = await supabase.from('users').insert({
            data: {
                name: credentials.username,
                email: credentials.email,
                password_hash: await hashPassword(credentials.password),
                role: credentials.role || 'user',
            },
        })
       
        return {data: user,status: 201}
    }
}

export async function updateUser(userId: string, data: any) {
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

  export async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase
      .from('users')
      .insert<Omit<User, 'id'>>({ email, password_hash: await hashPassword(password), name })
      .single();

    if (error) throw error;
    return data as User;
  }