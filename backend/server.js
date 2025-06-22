// server.js
// Main entry point for the backend Express server

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/uploads', express.static('backend/uploads'));

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

const agencyRoutes = require('./routes/agency');
app.use('/api/agencies', agencyRoutes);

// User management (agency)
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

const bookingRoutes = require('./routes/booking');
app.use('/api/bookings', bookingRoutes);

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

// Test auth route
app.get('/api/test-auth', (req, res) => {
  res.json({ 
    message: 'Auth test endpoint',
    headers: req.headers.authorization ? 'Authorization header present' : 'No authorization header'
  });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io); // Make io accessible in controllers

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('authenticate', async (data) => {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      const user = await User.findById(socket.userId);
      if (user && user.role === 'admin') {
        socket.join('admins');
        console.log(`Admin ${socket.userId} joined the 'admins' room`);
      }
      console.log(`Socket ${socket.id} authenticated as user ${socket.userId}`);
    } catch (err) {
      console.log('Authentication error:', err.message);
      socket.disconnect();
    }
  });

  socket.on('updateLocation', async (location) => {
    if (!socket.userId) {
      return console.log('Location update from unauthenticated socket');
    }
    console.log(`Location update from ${socket.userId}:`, location);
    
    // Optional: Save location to the database
    try {
      await User.findByIdAndUpdate(socket.userId, {
        lastLocation: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        lastLocationUpdate: Date.now(),
      });
    } catch (err) {
      console.error('Error saving location to DB:', err);
    }
    
    // Broadcast the location update to all admins
    io.to('admins').emit('driverLocationUpdate', {
      driverId: socket.userId,
      location: location,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 