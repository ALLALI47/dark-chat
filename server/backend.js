const express = require('express')
const fs = require('fs')
const path = require('path')
const http = require('http')
const WebSocket = require('ws')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const DATA_DIR = path.join(__dirname, 'data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]))

app.use(express.json())

function readMessages() {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '[]')
  } catch (e) {
    console.error('Failed to read messages', e)
    return []
  }
}

function writeMessages(msgs) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2))
  } catch (e) {
    console.error('Failed to write messages', e)
  }
}

// REST endpoints
app.get('/api/messages', (req, res) => {
  res.json(readMessages())
})

app.post('/api/messages', (req, res) => {
  const { userId, username, avatar, text, attachments } = req.body
  if (!text || !username) return res.status(400).json({ error: 'invalid' })
  const msgs = readMessages()
  const msg = { id: Date.now().toString(), userId, username, avatar: avatar || '', text, attachments: attachments || [], createdAt: new Date().toISOString() }
  msgs.push(msg)
  writeMessages(msgs)
  // broadcast to ws clients
  const data = JSON.stringify({ type: 'message', payload: msg })
  wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(data) })
  res.status(201).json(msg)
})

// WebSocket broadcast on connection
wss.on('connection', (ws) => {
  console.log('ws connected')
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(String(message))
      if (parsed.type === 'message') {
        const msgs = readMessages()
        // allow attachments in parsed.payload
        msgs.push(parsed.payload)
        writeMessages(msgs)
        const data = JSON.stringify({ type: 'message', payload: parsed.payload })
        wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(data) })
      }
    } catch (e) {
      console.warn('Bad ws message', e)
    }
  })
})

const PORT = process.env.BACKEND_PORT || 4000
server.listen(PORT, () => console.log(`Backend server listening on http://localhost:${PORT}`))
