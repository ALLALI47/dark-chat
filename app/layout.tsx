import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { PostsProvider } from "@/lib/posts-context"
import { CartProvider } from "@/lib/cart-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Dark Chat - Share Your Moments",
  description: "A modern social media platform for sharing photos and connecting with friends",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans bg-background text-foreground">
        <AuthProvider>
          <PostsProvider>
            <CartProvider>{children}</CartProvider>
          </PostsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
