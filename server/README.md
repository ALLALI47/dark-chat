This is a minimal local backend for the Dark Chat demo.

Setup:
1. From the repository root, install server deps:

   npm install express ws

2. Start the backend:

   npm run backend

Endpoints:
- GET /api/messages -> list messages
- POST /api/messages -> post a message { userId, username, avatar, text }

WebSocket: ws://localhost:4000/ - send JSON like { type: 'message', payload: { id, userId, username, avatar, text, createdAt } }
