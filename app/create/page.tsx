"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { usePosts } from "@/lib/posts-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addPost } = usePosts()

  const [caption, setCaption] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // redirect to login if not authenticated
    if (user === null) {
      router.replace("/login")
    }
  }, [user, router])

  const handleFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFilePreview(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    if (f) {
      handleFile(f)
      setImageUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      setError("You must be logged in to create a post")
      return
    }
    if (!caption.trim() && !filePreview && !imageUrl.trim()) {
      setError("Please add a caption or an image")
      return
    }
    setIsSubmitting(true)
    try {
      addPost({
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar || "",
        image: filePreview || imageUrl || "",
        caption: caption.trim(),
      })
      // small delay to ensure storage is persisted
      setTimeout(() => router.push("/messages"), 200)
    } catch (err: any) {
      setError(err?.message || "Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Create Post</h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.username} />
            ) : (
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-transparent"
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">Image URL (optional)</label>
                  <Input
                    placeholder="https://...jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      if (e.target.value) setFilePreview(null)
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="post-image" className="text-sm block mb-1">Upload image (optional)</label>
                  <input id="post-image" type="file" accept="image/*" onChange={onFileChange} className="w-full" />
                </div>
              </div>

              {filePreview || imageUrl ? (
                <div className="mt-2 rounded overflow-hidden border border-border">
                  <div className="relative h-64">
                    <Image src={filePreview || imageUrl} alt="preview" fill className="object-cover" />
                  </div>
                </div>
              ) : null}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
