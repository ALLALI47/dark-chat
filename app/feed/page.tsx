"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FeedRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/messages')
  }, [router])
  return null
}
