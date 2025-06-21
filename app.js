const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("./configs/passport.config");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");

const connectDB = require("./db/connectDB");
const initSocket = require("./socket");

const app = express();
const server = http.createServer(app); // tạo HTTP server

// Khởi tạo socket.io
const io = initSocket(server);
app.set("io", io); // inject io vào req.app trong route

// Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS config
const corsOptions = {
  origin: "http://localhost:5173", // Frontend local
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
};
app.use(cors(corsOptions));

// Session và Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true nếu production (https)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const appRoutes = require("./router/appRoutes");
app.use("/", appRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error: err.stack,
  });
});

// Server khởi chạy
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
