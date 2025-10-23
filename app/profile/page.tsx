"use client"

import { useAuth } from "@/lib/auth-context"
import { usePosts } from "@/lib/posts-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Grid } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import dynamic from "next/dynamic"

const ProfileDesigner = dynamic(() => import("@/components/profile-designer"), { ssr: false })
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user, isLoading, logout, scheduleDeletion, restoreAccount } = useAuth()
  const { posts } = usePosts()
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editedBio, setEditedBio] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setEditedBio(user.bio || "")
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  const userPosts = posts.filter((post) => post.userId === user.id)

  const handleSaveProfile = () => {
    // Update user bio in localStorage
    const storedUser = localStorage.getItem("darkChatUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      userData.bio = editedBio
      localStorage.setItem("darkChatUser", JSON.stringify(userData))
      window.location.reload()
    }
    setIsEditOpen(false)
  }

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="space-y-6">
          <div className="flex items-start gap-8">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-xl font-semibold">{user.username}</h1>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" defaultValue={user.fullName} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={user.username} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => router.push('/profile/design')}>
                  Design Avatar
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <Settings className="w-5 h-5" />
                </Button>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule account deletion</DialogTitle>
                        <DialogDescription>
                          This will schedule your account for permanent deletion in 30 days. During this time you can restore your account. Do you want to continue?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { /* DialogClose handles */ }}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                          try {
                            scheduleDeletion(user.id, 30)
                            try { localStorage.removeItem('darkChatUser') } catch (e) { }
                            try { logout() } catch (e) { }
                            alert('Your account is scheduled for deletion in 30 days. You can restore it during this period from the profile restore action.')
                            router.push('/signup')
                          } catch (e) {
                            console.warn(e)
                            alert('Failed to schedule deletion')
                          }
                        }}>Confirm delete</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Deletion status */}
                  {user.isDeleted && (
                    <div className="mt-3 p-3 bg-muted rounded-md flex items-center justify-between">
                      <div>
                        <p className="text-sm">Account scheduled for deletion on <span className="font-medium">{user.deletionScheduledAt ? new Date(Number(user.deletionScheduledAt)).toLocaleString() : 'unknown'}</span></p>
                        <p className="text-xs text-muted-foreground">Time left: <DeletionCountdown target={user.deletionScheduledAt} /></p>
                      </div>
                      <div>
                        <Button variant="secondary" size="sm" onClick={() => {
                          if (!confirm('Restore your account?')) return
                          try {
                            restoreAccount(user.id)
                            alert('Your account has been restored.')
                            window.location.reload()
                          } catch (e) {
                            console.warn(e)
                            alert('Failed to restore account')
                          }
                        }}>Restore account</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-8 text-sm">
                <div>
                  <span className="font-semibold">{userPosts.length}</span> posts
                </div>
                {/* followers/following removed per user request */}
              </div>

              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio || "No bio yet"}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="gap-2">
                <Grid className="w-4 h-4" />
                Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Grid className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Start sharing your moments with the world</p>
                  <Button onClick={() => router.push("/messages")}>Create Post</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="relative aspect-square bg-muted rounded-sm overflow-hidden group">
                      <Image src={post.image || "/placeholder.svg"} alt={post.caption} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved tab removed */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function DeletionCountdown({ target }: { target?: number | string | undefined }) {
  const [left, setLeft] = useState<string>('calculating...')

  useEffect(() => {
    if (!target) return
    const targetMs = Number(target)
    const update = () => {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        setLeft('Expired')
        return
      }
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
      const secs = Math.floor((diff % (60 * 1000)) / 1000)
      setLeft(`${days}d ${hours}h ${mins}m ${secs}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [target])

  return <span>{left}</span>
}
