const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

console.log("🔥 SERVER FILE LOADED");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check (VERY IMPORTANT - keep at top)
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running!', status: 'ok' });
});

// Routes (wrap in try to avoid crash)
try {
  // app.use('/api/auth', require('./routes/authRoutes'));
  // app.use('/api/users', require('./routes/userRoutes'));
  // app.use('/api/projects', require('./routes/projectRoutes'));
  // app.use('/api/tasks', require('./routes/taskRoutes'));
  // app.use('/api/dashboard', require('./routes/dashboardRoutes'));
} catch (err) {
  console.error("❌ Route loading error:", err.message);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 🔥 START SERVER SAFELY
const startServer = async () => {
  try {
    console.log("📦 Connecting to DB...");
    await connectDB();

    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

startServer();
