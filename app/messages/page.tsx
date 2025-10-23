"use client"

import { useEffect, useRef, useState } from "react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMessages, MessagesProvider } from "@/lib/messages-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function ChatUI() {
  const { user } = useAuth()
  const { messages, sendMessage } = useMessages()
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const [text, setText] = useState("")
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // try connect to backend websocket
    try {
      const ws = new WebSocket('ws://localhost:4000')
      wsRef.current = ws
      ws.onopen = () => setWsConnected(true)
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          if (data.type === 'message') {
            // append to messages via sendMessage-style local persist
            // We don't have direct setter here; write to localStorage and rely on MessagesProvider reload on mount
            const existing = JSON.parse(localStorage.getItem('darkChatMessages') || '[]')
            existing.push(data.payload)
            localStorage.setItem('darkChatMessages', JSON.stringify(existing))
            // trigger a storage event for other windows
            window.dispatchEvent(new Event('storage'))
          }
        } catch (e) { console.warn(e) }
      }
      ws.onclose = () => setWsConnected(false)
      ws.onerror = () => setWsConnected(false)
      return () => { ws.close() }
    } catch (e) {
      setWsConnected(false)
    }
  }, [])

  const handleFile = (f?: File) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setAttachments((s) => [...s, { name: f.name, type: f.type, url: String(reader.result) }])
    }
    reader.readAsDataURL(f)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    if (f) handleFile(f)
    e.currentTarget.value = ''
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return alert('You must be logged in to send messages')
    if (!text.trim() && attachments.length === 0) return
    const payload: any = { userId: user.id, username: user.username, avatar: user.avatar || '', text: text.trim() }
    if (attachments.length) payload.attachments = attachments
    if (wsConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // send via REST to persist and backend will broadcast
      fetch('http://localhost:4000/api/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch((e) => { console.warn(e); sendMessage(text.trim(), { id: user.id, username: user.username, avatar: user.avatar }, attachments) })
    } else {
      // fallback to localStorage based behavior
      sendMessage(text.trim(), { id: user.id, username: user.username, avatar: user.avatar }, attachments)
    }
    setText("")
    setAttachments([])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[70vh] md:h-[75vh]">
      <h1 className="text-2xl font-semibold mb-4">Public Chat</h1>

      <div className="flex-1 overflow-y-auto border rounded-md p-3 space-y-3 bg-card" aria-live="polite">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No messages yet — say hello!</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                {m.avatar ? <AvatarImage src={m.avatar} alt={m.username} /> : <AvatarFallback>{m.username[0]?.toUpperCase()}</AvatarFallback>}
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{m.username} <span className="text-xs text-muted-foreground ml-2">{new Date(m.createdAt).toLocaleString()}</span></div>
                <div className="mt-1 text-sm">{m.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { handleSend(e) }} className="mt-3 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder={user ? `Message as ${user.username}...` : 'Login to send messages'} value={text} onChange={(e) => setText(e.target.value)} disabled={!user} />
          <div className="flex gap-2 items-center">
            <label htmlFor="chat-attach" className="sr-only">Attach file</label>
            <input id="chat-attach" type="file" accept="image/*,video/*" onChange={onFileChange} className="block" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setAttachments([])} disabled={attachments.length === 0} className="w-full sm:w-auto">Clear</Button>
            <Button type="submit" disabled={!user || (!text.trim() && attachments.length === 0)} className="w-full sm:w-auto">Send</Button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mt-2">
            {attachments.map((a, idx) => (
              <div key={idx} className="w-24 h-24 rounded overflow-hidden border relative">
                <button type="button" onClick={() => setAttachments((s) => s.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                {a.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt={a.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm">{a.name}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <Navigation />
      <MessagesProvider>
        <ChatUI />
      </MessagesProvider>
    </div>
  )
}
