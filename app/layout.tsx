import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/app/SessionProvider";


export const metadata: Metadata = {
  title: "Trove Bits",
  description: "Find the best tech products and deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body>
         {children}
        </body>
      </SessionProvider>
    </html>
  );
}
