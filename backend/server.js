import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { verifyTransporter } from './config/nodemailer.js';

let PORT = parseInt(process.env.PORT || '5000', 10);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSocketHandlers(io);

const startServer = async (portToTry) => {
  // Call transporter.verify() during server startup
  await verifyTransporter();

  server.listen(portToTry, () => {
    console.log(`
  =======================================================
  🚀 CHRONA BACKEND SERVER RUNNING ON PORT ${portToTry}
  =======================================================
  • REST API:     http://localhost:${portToTry}/api/health
  • Socket.IO:    ws://localhost:${portToTry}
  • Mode:         ${process.env.NODE_ENV || 'development'}
  =======================================================
  `);
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[CHRONA SERVER WARNING] Port ${PORT} is currently in use. Trying port ${PORT + 1}...`);
    PORT += 1;
    setTimeout(() => {
      startServer(PORT);
    }, 500);
  } else {
    console.error('Server execution error:', err);
  }
});

startServer(PORT);
