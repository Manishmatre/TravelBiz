// server.js
// Main entry point for the backend Express server

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const clientRoutes = require('./routes/client');
app.use('/api/clients', clientRoutes);

const fileRoutes = require('./routes/file');
app.use('/api/files', fileRoutes);

const vehicleRoutes = require('./routes/vehicle');
app.use('/api/vehicles', vehicleRoutes);

const locationRoutes = require('./routes/location');
app.use('/api/location', locationRoutes);

// TODO: Import routes and middlewares here

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.send('TravelBiz API is running');
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io); // Make io accessible in controllers

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 