const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = process.env.SIM_API_URL || 'http://localhost:5000/api/location/update';
const AUTH_TOKEN = process.env.SIM_AUTH_TOKEN || '';
const VEHICLE_IDS = (process.env.SIM_VEHICLE_IDS || '').split(','); // Comma-separated vehicle IDs

// Helper to generate random coordinates near a base point
function randomizeCoord(base, range = 0.01) {
  return base + (Math.random() - 0.5) * range;
}

// Helper to pick random status and speed
function randomStatusAndSpeed() {
  const moving = Math.random() > 0.3;
  return {
    status: moving ? 'moving' : 'stopped',
    speed: moving ? Math.floor(Math.random() * 80) + 20 : 0,
  };
}

async function updateVehicle(vehicleId, baseLat, baseLng) {
  const { status, speed } = randomStatusAndSpeed();
  const latitude = randomizeCoord(baseLat);
  const longitude = randomizeCoord(baseLng);
  try {
    await axios.post(
      API_URL,
      {
        vehicleId,
        latitude,
        longitude,
        speed,
        status,
      },
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );
    console.log(`Updated vehicle ${vehicleId}: (${latitude}, ${longitude}), speed: ${speed}, status: ${status}`);
  } catch (err) {
    console.error(`Failed to update vehicle ${vehicleId}:`, err.response?.data || err.message);
  }
}

// Main simulation loop
async function simulate() {
  if (!AUTH_TOKEN || !VEHICLE_IDS.length) {
    console.error('Set SIM_AUTH_TOKEN and SIM_VEHICLE_IDS in .env');
    process.exit(1);
  }
  // Assign a base location for each vehicle
  const baseLocations = VEHICLE_IDS.map(() => ({ lat: 25 + Math.random(), lng: 55 + Math.random() }));
  setInterval(() => {
    VEHICLE_IDS.forEach((id, idx) => {
      updateVehicle(id, baseLocations[idx].lat, baseLocations[idx].lng);
    });
  }, 5000); // Update every 5 seconds
}

simulate(); 