"use client"

import {  useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "../_actions";
import Link from "next/link";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const result = await createUser({email, password, username, role: 'user'});
            if (result.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
            }
        } catch (error: Error | unknown) {
            setError('An unexpected error occurred');
            console.error('Signup failed:', error);
        }
    };

    return (
        <div className="w-96 mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoComplete="new-password"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                >
                    Create Account
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link href="/auth/login" className="text-blue-600">
                    Already have an account? Log In
                </Link>
            </div>
        </div>
    );
}
