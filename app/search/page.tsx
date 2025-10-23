"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type UserItem = {
  id: string
  username: string
  fullName: string
  avatar?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<UserItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('darkChatUsers')
      if (raw) {
        const parsed = JSON.parse(raw)
        const mapped = parsed.map((u: any) => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }))
        setUsers(mapped)
      } else {
        setUsers([])
      }
    } catch (e) {
      console.error('Failed to load users for search', e)
      setUsers([])
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(u => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q))
  }, [query, users])

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Search People</h1>

        <div className="mb-4">
          <Input placeholder="Search by username or name..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-muted-foreground">No users found.</div>
          ) : (
            results.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-card p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {u.avatar ? <AvatarImage src={u.avatar} alt={u.username} /> : <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>}
                  </Avatar>
                  <div>
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-sm text-muted-foreground">@{u.username}</div>
                  </div>
                </div>
                <div>
                  <Button onClick={() => router.push(`/profile?user=${u.id}`)}>View Profile</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
