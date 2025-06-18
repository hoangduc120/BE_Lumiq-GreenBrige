// socket.js
const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("joinOrder", (orderId) => {
      socket.join(orderId);
      console.log(`🔒 Socket ${socket.id} joined order room ${orderId}`);
      console.log(`📊 Current rooms for socket ${socket.id}:`, Array.from(socket.rooms));
    });

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;
