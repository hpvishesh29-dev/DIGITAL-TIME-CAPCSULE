export const setupSocketHandlers = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket.IO Client Connected]: ${socket.id}`);

    // Join User Room
    socket.on('user_connect', (userData) => {
      if (userData?.uid) {
        connectedUsers.set(socket.id, userData);
        socket.join(`user:${userData.uid}`);
        console.log(`User ${userData.email || userData.uid} connected to socket channel.`);

        io.emit('presence_update', {
          onlineCount: connectedUsers.size,
          activeUsers: Array.from(connectedUsers.values()),
        });
      }
    });

    // Real-Time Memory Actions
    socket.on('memory_created', (memoryData) => {
      console.log('Real-time memory creation event:', memoryData.title);
      // Broadcast to user's rooms or shared users
      if (memoryData.userId) {
        socket.to(`user:${memoryData.userId}`).emit('memory_added', memoryData);
      }
      socket.broadcast.emit('public_memory_activity', {
        type: 'created',
        memoryId: memoryData.id,
        title: memoryData.title,
      });
    });

    socket.on('memory_shared', ({ memoryId, targetEmail, memoryTitle }) => {
      console.log(`Memory "${memoryTitle}" shared with ${targetEmail}`);
      io.emit('live_notification', {
        id: `notif-${Date.now()}`,
        type: 'memory_shared',
        title: 'Memory Shared with You',
        message: `A new time capsule "${memoryTitle}" was shared with you!`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log(`[Socket.IO Client Disconnected]: ${socket.id}`);
      io.emit('presence_update', {
        onlineCount: connectedUsers.size,
      });
    });
  });
};
