"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePosts, type Post } from "@/lib/posts-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const { likePost, addComment } = usePosts()
  const [comment, setComment] = useState("")
  const [showComments, setShowComments] = useState(false)

  const isLiked = user ? post.likedBy.includes(user.id) : false

  const handleLike = () => {
    if (user) {
      likePost(post.id, user.id)
    }
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (user && comment.trim()) {
      addComment(post.id, {
        userId: user.id,
        username: user.username,
        text: comment,
      })
      setComment("")
      setShowComments(true)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.userAvatar || "/placeholder.svg"} alt={post.username} />
            <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <Image src={post.image || "/placeholder.svg"} alt={post.caption} fill className="object-cover" />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLike} className={cn(isLiked && "text-red-500")}>
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <Send className="w-6 h-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon">
            <Bookmark className="w-6 h-6" />
          </Button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm">{post.likes} likes</p>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{post.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-sm text-muted-foreground hover:text-foreground">
            View all {post.comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="space-y-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2">{comment.username}</span>
                <span>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <form onSubmit={handleComment} className="flex items-center gap-2">
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-0"
          />
          {comment.trim() && (
            <Button type="submit" variant="ghost" size="sm" className="text-primary">
              Post
            </Button>
          )}
        </form>
      </div>
    </article>
  )
}
