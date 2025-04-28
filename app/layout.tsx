import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Tech Trove",
  description: "Find the best tech products and deals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
