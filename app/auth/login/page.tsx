"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const searchParams = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(errorParam);
        }
    }, [searchParams]);

    const handleSignIn = async (provider: string, credentials?: { email: string; password: string }) => {
        try {
            if (!provider) throw new Error('Provider is required');
            if (credentials && (!credentials.email || !credentials.password)) {
                throw new Error('Email and password are required');
            }
            await signIn(provider, { callbackUrl: '/dashboard' });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Sign-in failed');
        }
    };

    return (
        <div className="w-96 mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            
            <button
                onClick={() => handleSignIn('google')}
                className="w-full bg-red-600 text-white p-2 rounded mb-4"
            >
                Continue with Google
            </button>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                    handleSignIn('credentials', { email, password });
                }}
                className="space-y-4"
            >
                <div>
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="w-full p-2 border rounded"
                        autoComplete="current-password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                >
                    Sign In
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link href="/auth/signup" className="text-blue-600">
                    Don't have an account? Sign Up
                </Link>
            </div>
        </div>
    );
}
