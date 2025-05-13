"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../_actions";
import Link from "next/link";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await signUp(email, password, username);
            console.log(result);
            router.push('/dashboard');
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };

    return (
        <div className="w-96 mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

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
