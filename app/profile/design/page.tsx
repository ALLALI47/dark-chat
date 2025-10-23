"use client"

import React from "react"
import { Navigation } from "@/components/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const ProfileDesigner = dynamic(() => import("@/components/profile-designer"), { ssr: false })

export default function DesignPage() {
  const router = useRouter()

  // عرض كل المستخدمين المحفوظين
  console.log('darkChatUsers:', JSON.parse(localStorage.getItem('darkChatUsers') || '[]'));

  // عرض المستخدم الحالي المخزن (بعد تسجيل الدخول)
  console.log('darkChatUser:', JSON.parse(localStorage.getItem('darkChatUser') || 'null'));

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Design Your Character</h1>
          <div>
            <Button variant="ghost" onClick={() => router.push('/profile')}>Back to Profile</Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <ProfileDesigner />
        </div>
      </div>
    </div>
  )
}
