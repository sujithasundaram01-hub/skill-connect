import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'skillshare_super_secret_jwt_key_2025_community_safe_production_ready';

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as { id: string; email: string };
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;

    // Join user's personal notification room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join a specific connection conversation room
    socket.on('join_conversation', (connectionId: string) => {
      socket.join(`connection:${connectionId}`);
    });

    socket.on('leave_conversation', (connectionId: string) => {
      socket.leave(`connection:${connectionId}`);
    });

    // Send chat message event in room
    socket.on('send_message', (data: { connectionId: string; message: any }) => {
      io.to(`connection:${data.connectionId}`).emit('new_message', data.message);
    });

    // Typing indicators
    socket.on('typing_start', (data: { connectionId: string; userName: string }) => {
      socket.to(`connection:${data.connectionId}`).emit('user_typing', {
        userId,
        userName: data.userName,
      });
    });

    socket.on('typing_stop', (data: { connectionId: string }) => {
      socket.to(`connection:${data.connectionId}`).emit('user_stop_typing', {
        userId,
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}
