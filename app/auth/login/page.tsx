"use client";
import { Suspense } from "react";
import Login from "@/components/login";

export default function signIn() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Login />
        </Suspense>
    );
}   
