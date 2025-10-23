"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  text: string
  createdAt: string
}

interface MessagesContextType {
  messages: ChatMessage[]
  sendMessage: (text: string, user: { id: string; username: string; avatar?: string }, attachments?: { name: string; type: string; url: string }[]) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('darkChatMessages')
      if (raw) {
        setMessages(JSON.parse(raw))
      } else {
        setMessages([])
      }
    } catch (e) {
      console.warn('Failed to load messages', e)
      setMessages([])
    }
  }, [])

  const persist = (next: ChatMessage[]) => {
    setMessages(next)
    try {
      localStorage.setItem('darkChatMessages', JSON.stringify(next))
    } catch (e) {
      console.warn('Failed to persist messages', e)
    }
  }
  const sendMessage = (text: string, user: { id: string; username: string; avatar?: string }, attachments?: { name: string; type: string; url: string }[]) => {
    const msg: ChatMessage & { attachments?: { name: string; type: string; url: string }[] } = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      avatar: user.avatar || '',
      text,
      createdAt: new Date().toISOString(),
    }
    if (attachments && attachments.length) msg.attachments = attachments
    persist([...messages, msg])
  }

  return <MessagesContext.Provider value={{ messages, sendMessage }}>{children}</MessagesContext.Provider>
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider')
  return ctx
}
