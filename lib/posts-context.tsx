"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Post {
  id: string
  userId: string
  username: string
  userAvatar: string
  image: string
  caption: string
  likes: number
  likedBy: string[]
  comments: Comment[]
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  username: string
  text: string
  createdAt: string
}

interface PostsContextType {
  posts: Post[]
  addPost: (post: Omit<Post, "id" | "likes" | "likedBy" | "comments" | "createdAt">) => void
  likePost: (postId: string, userId: string) => void
  addComment: (postId: string, comment: Omit<Comment, "id" | "createdAt">) => void
  deletePost: (postId: string) => void
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

// Mock initial posts
const initialPosts: Post[] = [
  {
    id: "1",
    userId: "demo1",
    username: "sarah_designs",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    image: "/modern-architecture-building.png",
    caption: "Beautiful architecture in the city center",
    likes: 234,
    likedBy: [],
    comments: [
      {
        id: "c1",
        userId: "demo2",
        username: "mike_photo",
        text: "Amazing shot!",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "2",
    userId: "demo2",
    username: "mike_photo",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    image: "/sunset-landscape-mountains.jpg",
    caption: "Golden hour at the mountains",
    likes: 567,
    likedBy: [],
    comments: [],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "3",
    userId: "demo3",
    username: "emma_travels",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    image: "/tropical-beach-paradise.png",
    caption: "Paradise found",
    likes: 892,
    likedBy: [],
    comments: [
      {
        id: "c2",
        userId: "demo1",
        username: "sarah_designs",
        text: "I need to visit this place!",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "c3",
        userId: "demo2",
        username: "mike_photo",
        text: "Stunning colors",
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
]

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const storedPosts = localStorage.getItem("darkChatPosts")
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    } else {
      setPosts(initialPosts)
      localStorage.setItem("darkChatPosts", JSON.stringify(initialPosts))
    }
  }, [])

  const addPost = (post: Omit<Post, "id" | "likes" | "likedBy" | "comments" | "createdAt">) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("darkChatPosts", JSON.stringify(updatedPosts))
  }

  const likePost = (postId: string, userId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const hasLiked = post.likedBy.includes(userId)
        return {
          ...post,
          likes: hasLiked ? post.likes - 1 : post.likes + 1,
          likedBy: hasLiked ? post.likedBy.filter((id) => id !== userId) : [...post.likedBy, userId],
        }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("darkChatPosts", JSON.stringify(updatedPosts))
  }

  const addComment = (postId: string, comment: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        }
      }
      return post
    })
    setPosts(updatedPosts)
    localStorage.setItem("darkChatPosts", JSON.stringify(updatedPosts))
  }

  const deletePost = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    setPosts(updatedPosts)
    localStorage.setItem("darkChatPosts", JSON.stringify(updatedPosts))
  }

  return (
    <PostsContext.Provider value={{ posts, addPost, likePost, addComment, deletePost }}>
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
}
