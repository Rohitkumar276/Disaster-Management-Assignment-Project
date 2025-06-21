import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './lib/utils/logger.js';

const PORT = process.env.SOCKET_PORT || 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://disaster-management-assignment-proj-eight.vercel.app",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  logger.info(`🔌 New client connected: ${socket.id}. Total online: ${onlineUsers}`);
  io.emit('online_users', onlineUsers);

  socket.on('join_disaster', (disasterId) => {
    socket.join(`disaster_${disasterId}`);
    logger.info(`Client ${socket.id} joined room for disaster ${disasterId}`);
  });

  socket.on('leave_disaster', (disasterId) => {
    socket.leave(`disaster_${disasterId}`);
    logger.info(`Client ${socket.id} left room for disaster ${disasterId}`);
  });

  socket.on('disconnect', () => {
    onlineUsers--;
    logger.info(`🔌 Client disconnected: ${socket.id}. Total online: ${onlineUsers}`);
    io.emit('online_users', onlineUsers);
  });
});

// This is a placeholder for a more robust pub/sub mechanism (e.g., Redis)
// For now, we'll expose a simple endpoint to receive events from our Next.js API
httpServer.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/emit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { event, room, data } = JSON.parse(body);
        if (event && room) {
          io.to(room).emit(event, data);
          logger.info(`Emitted event "${event}" to room "${room}"`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          throw new Error('Invalid event data');
        }
      } catch (e) {
        logger.error('Invalid emit request:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

httpServer.listen(PORT, () => {
  logger.info(`🚀 WebSocket server listening on port ${PORT}`);
}); 