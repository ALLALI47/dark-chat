"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
  bio?: string
  // followers and following removed per user request
  gender?: string
  // soft-delete fields
  isDeleted?: boolean
  deletionScheduledAt?: number | string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string, fullName: string, gender?: string) => Promise<void>
  scheduleDeletion: (userId: string, days?: number) => void
  restoreAccount: (userId: string) => void
  updateUser: (patch: Partial<User>) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("darkChatUser")
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        // remove legacy followers/following if present
        if ('followers' in parsed) delete parsed.followers
        if ('following' in parsed) delete parsed.following
        // persist cleaned current user back to localStorage
        try {
          localStorage.setItem("darkChatUser", JSON.stringify(parsed))
        } catch (e) {
          console.warn('Could not write cleaned darkChatUser', e)
        }
        setUser(parsed)
      } catch (e) {
        console.error('Failed to parse stored user', e)
      }
    }
    // Also migrate the users database in localStorage if present
    try {
      const all = localStorage.getItem('darkChatUsers')
      if (all) {
        const arr = JSON.parse(all)
        let mutated = false
        const cleaned = arr.map((u: any) => {
          if (!u) return u
          const copy = { ...u }
          if ('followers' in copy) { delete copy.followers; mutated = true }
          if ('following' in copy) { delete copy.following; mutated = true }
          return copy
        })
        if (mutated) {
          try {
            localStorage.setItem('darkChatUsers', JSON.stringify(cleaned))
          } catch (e) {
            console.warn('Could not persist cleaned darkChatUsers', e)
          }
        }
        // Cleanup expired scheduled deletions (permanent removal)
        try {
          const now = Date.now()
          const filtered = cleaned.filter((u: any) => {
            if (!u) return false
            if (u.isDeleted && u.deletionScheduledAt) {
              return Number(u.deletionScheduledAt) > now
            }
            return true
          })
          if (filtered.length !== cleaned.length) {
            try {
              localStorage.setItem('darkChatUsers', JSON.stringify(filtered))
            } catch (e) {
              console.warn('Could not persist cleaned darkChatUsers after deletion cleanup', e)
            }
          }
        } catch (e) {
          console.warn('Failed to cleanup scheduled deletions', e)
        }
      }
    } catch (e) {
      console.warn('Failed to migrate darkChatUsers', e)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("darkChatUsers") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      // prevent login for accounts scheduled for deletion
      if (foundUser.isDeleted && foundUser.deletionScheduledAt && Number(foundUser.deletionScheduledAt) > Date.now()) {
        const until = new Date(Number(foundUser.deletionScheduledAt)).toLocaleString()
        throw new Error(`This account is scheduled for deletion on ${until}. Contact support to restore.`)
      }
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("darkChatUser", JSON.stringify(userWithoutPassword))
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const signup = async (email: string, password: string, username: string, fullName: string, gender?: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem("darkChatUsers") || "[]")

    // Check if user already exists
    const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const newNorm = normalize(username)
    if (users.some((u: any) => {
      const n = normalize(u.username)
      return u.email === email || n === newNorm || n.includes(newNorm) || newNorm.includes(n)
    })) {
      throw new Error("User already exists or similar username exists")
    }

    // Generate a zero-padded 5-digit incremental id (e.g. 00001, 00002)
    const existingIds = users.map((u: any) => String(u.id || "")).filter(Boolean)
    // Find numeric ids and determine the max
    const numericVals = existingIds
      .map((id: string) => {
        const n = parseInt(id, 10)
        return Number.isFinite(n) ? n : null
      })
      .filter((n: any) => n !== null) as number[]
    const max = numericVals.length ? Math.max(...numericVals) : 0
    const next = max + 1
    const idString = String(next).padStart(5, "0")

    const seed = gender ? `${username}-${gender}` : username
    const style = 'avataaars'
    let finalId = idString
    // Ensure uniqueness even if some non-numeric ids collide with the generated one
    if (users.some((u: any) => String(u.id) === finalId)) {
      // If collision, increment until unique
      let counter = next + 1
      while (users.some((u: any) => String(u.id) === String(counter).padStart(5, "0"))) {
        counter += 1
      }
      finalId = String(counter).padStart(5, "0")
    }

    const newUser = {
      id: finalId,
      email,
      password,
      username,
      fullName,
      avatar: `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`,
      bio: "",
      gender: gender || undefined,
    }

    users.push(newUser)
    localStorage.setItem("darkChatUsers", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("darkChatUser", JSON.stringify(userWithoutPassword))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("darkChatUser")
  }

  const scheduleDeletion = (userId: string, days = 30) => {
    try {
      const raw = localStorage.getItem('darkChatUsers')
      if (!raw) return
      const arr = JSON.parse(raw)
      const scheduledAt = Date.now() + days * 24 * 60 * 60 * 1000
      const updated = arr.map((u: any) => {
        if (String(u.id) === String(userId)) {
          const updatedUser = { ...u, isDeleted: true, deletionScheduledAt: scheduledAt }
          // also update current logged-in snapshot if this is the same user
          try {
            const currentRaw = localStorage.getItem('darkChatUser')
            if (currentRaw) {
              const curr = JSON.parse(currentRaw)
              if (String(curr.id) === String(userId)) {
                const merged = { ...curr, ...updatedUser }
                localStorage.setItem('darkChatUser', JSON.stringify(merged))
                setUser(merged)
              }
            }
          } catch (e) {
            console.warn('Failed to update current darkChatUser during scheduleDeletion', e)
          }
          return updatedUser
        }
        return u
      })
      localStorage.setItem('darkChatUsers', JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to schedule deletion', e)
    }
  }

  const restoreAccount = (userId: string) => {
    try {
      const raw = localStorage.getItem('darkChatUsers')
      if (!raw) return
      const arr = JSON.parse(raw)
      const updated = arr.map((u: any) => {
        if (String(u.id) === String(userId)) {
          const copy = { ...u }
          delete copy.isDeleted
          delete copy.deletionScheduledAt
          // also update current logged-in snapshot if this is the same user
          try {
            const currentRaw = localStorage.getItem('darkChatUser')
            if (currentRaw) {
              const curr = JSON.parse(currentRaw)
              if (String(curr.id) === String(userId)) {
                const merged = { ...curr, ...copy }
                localStorage.setItem('darkChatUser', JSON.stringify(merged))
                setUser(merged)
              }
            }
          } catch (e) {
            console.warn('Failed to update current darkChatUser during restoreAccount', e)
          }
          return copy
        }
        return u
      })
      localStorage.setItem('darkChatUsers', JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to restore account', e)
    }
  }

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      localStorage.setItem("darkChatUser", JSON.stringify(updated))
      return updated
    })
  }

  return <AuthContext.Provider value={{ user, login, signup, scheduleDeletion, restoreAccount, logout, updateUser, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
