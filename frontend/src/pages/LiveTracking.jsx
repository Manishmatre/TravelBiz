/**
 * Add route playback UI and logic:
 * - Vehicle dropdown
 * - Time range selector (last 1 hour, last 24 hours, custom)
 * - Fetch and display location history as a polyline on the map
 */
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { getAllLocations, getLocationHistory } from '../services/locationService';
import { getVehicles } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import StatCard from '../components/common/StatCard';
import { FaMapMarkerAlt, FaBars, FaTimes, FaCarSide, FaSyncAlt } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAgents, getUsers } from '../services/userService';
import { getClients } from '../services/clientService';
import VehicleDetailsCard from '../components/VehicleDetailsCard';
import { getBookingsByVehicle } from '../services/bookingService';
import Draggable from 'react-draggable';
import axios from 'axios';
import DriverDetailsCard from '../components/DriverDetailsCard';
import AgentDetailsCard from '../components/AgentDetailsCard';
import ClientDetailsCard from '../components/ClientDetailsCard';

const containerStyle = {
  width: '100%',
  height: '400px',
};

// Placeholder center (Dubai)
const center = {
  lat: 25.2048,
  lng: 55.2708,
};

// Pulsing marker SVG as a React component
const PulsingMarker = ({ color = '#007bff', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <circle cx="16" cy="16" r="8" fill={color} fillOpacity="0.7">
      <animate attributeName="r" values="8;14;8" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="16" r="5" fill={color} />
    <circle cx="16" cy="16" r="2" fill="#fff" />
  </svg>
);

// Map style options
const MAP_STYLES = [
  { label: 'Default', value: 'roadmap', mapTypeId: 'roadmap', styles: null },
  { label: 'Dark', value: 'dark', mapTypeId: 'roadmap', styles: [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
  ] },
  { label: 'Satellite', value: 'satellite', mapTypeId: 'satellite', styles: null },
  { label: 'Terrain', value: 'terrain', mapTypeId: 'terrain', styles: null },
];

function LiveTracking() {
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Route playback state
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('1h'); // '1h', '24h', 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null); // { type: 'live'|'history', vehicleId, idx }
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const playbackIntervalRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);

  // Add sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add sidebar tab state and search/filter state
  const [sidebarTab, setSidebarTab] = useState('vehicles'); // 'vehicles' | 'agents' | 'clients' | 'drivers'
  const [showOnline, setShowOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Map style state
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0]);

  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState(null);
  const [clientsError, setClientsError] = useState(null);

  // Add search/filter state for agents and clients
  const [agentSearch, setAgentSearch] = useState('');
  const [showAgentsOnline, setShowAgentsOnline] = useState(true);
  const [showAgentsOffline, setShowAgentsOffline] = useState(true);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientsOnline, setShowClientsOnline] = useState(true);
  const [showClientsOffline, setShowClientsOffline] = useState(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [vehicleTrip, setVehicleTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState(null);
  const [tripCoords, setTripCoords] = useState(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  const [mapCenter, setMapCenter] = useState(userLocation || center);
  const [mapZoom, setMapZoom] = useState(12);

  const [isCardFloating, setIsCardFloating] = useState(false);
  const detailsCardRef = useRef(null);

  const [driverLocations, setDriverLocations] = useState({});

  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driversError, setDriversError] = useState(null);
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriversOnline, setShowDriversOnline] = useState(true);
  const [showDriversOffline, setShowDriversOffline] = useState(true);

  // --- Animated marker movement state ---
  const [animatedVehiclePositions, setAnimatedVehiclePositions] = useState({}); // { vehicleId: { lat, lng } }
  const [animatedDriverPositions, setAnimatedDriverPositions] = useState({}); // { driverId: { lat, lng } }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locs, vehs] = await Promise.all([
          getAllLocations(token),
          getVehicles(token),
        ]);
        setLocations(locs);
        setVehicles(vehs);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // Connect to socket.io backend
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('locationUpdate', (location) => {
      setLocations((prev) => {
        const idx = prev.findIndex(l => l.vehicleId === location.vehicleId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = location;
          return updated;
        } else {
          return [location, ...prev];
        }
      });
    });
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAgentsLoading(true);
      setAgentsError(null);
      getAgents(token)
        .then(setAgents)
        .catch(e => setAgentsError(e.message))
        .finally(() => setAgentsLoading(false));
      setClientsLoading(true);
      setClientsError(null);
      getClients(token)
        .then(setClients)
        .catch(e => setClientsError(e.message))
        .finally(() => setClientsLoading(false));
    }
  }, [token]);

  // Helper to get vehicle info by ID
  const getVehicleInfo = (vehicleId) => vehicles.find(v => v._id === vehicleId) || {};

  // Helper to get driver info (if available)
  const getDriverName = (vehicle) => vehicle.driverName || vehicle.driver || '';

  // Helper to format date/time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  // Helper to determine online status
  const isOnline = (updatedAt) => {
    if (!updatedAt) return false;
    const now = Date.now();
    const updated = new Date(updatedAt).getTime();
    return now - updated < 2 * 60 * 1000; // 2 minutes
  };

  // Fetch location history for playback
  const fetchHistory = async () => {
    if (!selectedVehicle) return;
    setHistoryLoading(true);
    let from, to;
    const now = new Date();
    if (timeRange === '1h') {
      from = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      to = now.toISOString();
    } else if (timeRange === '24h') {
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      to = now.toISOString();
    } else if (timeRange === 'custom') {
      from = customFrom;
      to = customTo;
    }
    try {
      const data = await getLocationHistory(selectedVehicle, from, to, token);
      setHistory(data);
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Auto-fetch history when vehicle or time range changes
  useEffect(() => {
    if (selectedVehicle && (timeRange !== 'custom' || (customFrom && customTo))) {
      fetchHistory();
    } else {
      setHistory([]);
    }
    // eslint-disable-next-line
  }, [selectedVehicle, timeRange, customFrom, customTo]);

  // Handle playback animation
  useEffect(() => {
    if (isPlaying && history.length > 1) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < history.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 800); // 800ms per step
    } else {
      clearInterval(playbackIntervalRef.current);
    }
    return () => clearInterval(playbackIntervalRef.current);
  }, [isPlaying, history]);

  // Reset step when new history is loaded
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [history]);

  // Fetch latest driver locations for all assigned drivers
  useEffect(() => {
    async function fetchDriverLocations() {
      if (!vehicles.length || !token) return;
      const assignedDrivers = vehicles.map(v => v.assignedDriver).filter(Boolean);
      const locs = {};
      await Promise.all(assignedDrivers.map(async (driverId) => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/location/driver/${driverId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data && res.data.latitude && res.data.longitude) {
            locs[driverId] = res.data;
          }
        } catch {}
      }));
      setDriverLocations(locs);
    }
    fetchDriverLocations();
  }, [vehicles, token]);

  // Helper to get the live location for a vehicle (driver if available, else vehicle)
  function getLiveLocationForVehicle(vehicle) {
    if (vehicle.assignedDriver && driverLocations[vehicle.assignedDriver]) {
      return driverLocations[vehicle.assignedDriver];
    }
    return locations.find(l => l.vehicleId === vehicle._id);
  }

  // --- Animate vehicle marker movement ---
  useEffect(() => {
    vehicles.forEach(vehicle => {
      const loc = getLiveLocationForVehicle(vehicle);
      if (!loc) return;
      const prev = animatedVehiclePositions[vehicle._id] || { lat: loc.latitude, lng: loc.longitude };
      if (prev.lat !== loc.latitude || prev.lng !== loc.longitude) {
        const start = { ...prev };
        const end = { lat: loc.latitude, lng: loc.longitude };
        const duration = 500;
        const startTime = performance.now();
        function animate(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const lat = start.lat + (end.lat - start.lat) * t;
          const lng = start.lng + (end.lng - start.lng) * t;
          setAnimatedVehiclePositions(pos => ({ ...pos, [vehicle._id]: { lat, lng } }));
          if (t < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      }
    });
    // eslint-disable-next-line
  }, [locations, vehicles]);

  // --- Animate driver marker movement ---
  useEffect(() => {
    drivers.forEach(driver => {
      const loc = Object.values(driverLocations).find(l => l.driverId === driver._id);
      if (!loc) return;
      const prev = animatedDriverPositions[driver._id] || { lat: loc.latitude, lng: loc.longitude };
      if (prev.lat !== loc.latitude || prev.lng !== loc.longitude) {
        const start = { ...prev };
        const end = { lat: loc.latitude, lng: loc.longitude };
        const duration = 500;
        const startTime = performance.now();
        function animate(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const lat = start.lat + (end.lat - start.lat) * t;
          const lng = start.lng + (end.lng - start.lng) * t;
          setAnimatedDriverPositions(pos => ({ ...pos, [driver._id]: { lat, lng } }));
          if (t < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      }
    });
    // eslint-disable-next-line
  }, [driverLocations, drivers]);

  // Helper to render clustered markers with animated icon
  const renderClusteredMarkers = (clusterer) =>
    vehicles.map(vehicle => {
      const loc = getLiveLocationForVehicle(vehicle);
      if (!loc) return null;
      const pos = animatedVehiclePositions[vehicle._id] || { lat: loc.latitude, lng: loc.longitude };
      const online = isOnline(loc.updatedAt);
      let color = '#ef4444';
      if (online) color = loc.status === 'moving' ? '#22c55e' : '#f59e42';
      if (!online) color = '#6b7280';
      return (
        <Marker
          key={vehicle._id}
          position={pos}
          label={vehicle.name || vehicle._id}
          icon={{
            url: `data:image/svg+xml;utf8,${encodeURIComponent(
              renderToStaticMarkup(<PulsingMarker color={color} size={32} />)
            )}`,
            scaledSize: { width: 32, height: 32 },
          }}
          clusterer={clusterer}
          onClick={() => setSelectedMarker({ type: 'live', vehicleId: vehicle._id })}
        />
      );
    });

  // Helper to get initials from name
  function getInitials(name) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Helper to determine online status for agents/clients (default to true for now)
  function isAgentOnline(agent) {
    // If you have a status or lastActive field, use it here
    return true;
  }
  function isClientOnline(client) {
    // If you have a status or lastActive field, use it here
    return true;
  }

  // Helper to count online/offline vehicles
  const onlineVehicles = locations.filter(l => isOnline(l.updatedAt)).length;
  const offlineVehicles = vehicles.length - onlineVehicles;

  // Helper to get driver info for a vehicle
  const getDriverForVehicle = (vehicle) => {
    // Adjust this logic if you have a driver object/field
    return vehicle && (vehicle.driver || vehicle.driverName) ? { name: vehicle.driverName || vehicle.driver } : null;
  };

  // Fetch bookings for selected vehicle
  useEffect(() => {
    if (selectedVehicleId && token) {
      setTripLoading(true);
      setTripError(null);
      getBookingsByVehicle(selectedVehicleId, token)
        .then(bookings => {
          // Sort by startDate descending, pick the most recent/active
          const sorted = bookings.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setVehicleTrip(sorted[0] || null);
        })
        .catch(e => setTripError(e.message))
        .finally(() => setTripLoading(false));
    } else {
      setVehicleTrip(null);
    }
  }, [selectedVehicleId, token]);

  // Helper to extract coordinates from trip (if available)
  function getTripCoords(trip) {
    // Example: trip.pickupCoords = { lat, lng }, trip.destinationCoords = { lat, lng }
    if (!trip) return null;
    if (trip.pickupCoords && trip.destinationCoords) {
      return [trip.pickupCoords, trip.destinationCoords];
    }
    return null;
  }

  // Geocode trip addresses to coordinates if needed
  useEffect(() => {
    async function geocodeAddress(address) {
      if (!address) return null;
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      throw new Error(data.error_message || 'Geocoding failed');
    }
    setGeocodeError(null);
    setGeocodeLoading(false);
    if (vehicleTrip && (!vehicleTrip.pickupCoords || !vehicleTrip.destinationCoords) && (vehicleTrip.pickup || vehicleTrip.destination)) {
      setGeocodeLoading(true);
      (async () => {
        try {
          const pickupCoords = vehicleTrip.pickupCoords || await geocodeAddress(vehicleTrip.pickup);
          const destinationCoords = vehicleTrip.destinationCoords || await geocodeAddress(vehicleTrip.destination);
          setTripCoords({ pickupCoords, destinationCoords });
          setGeocodeLoading(false);
        } catch (err) {
          setGeocodeError(err.message);
          setTripCoords(null);
          setGeocodeLoading(false);
        }
      })();
    } else if (vehicleTrip && vehicleTrip.pickupCoords && vehicleTrip.destinationCoords) {
      setTripCoords({ pickupCoords: vehicleTrip.pickupCoords, destinationCoords: vehicleTrip.destinationCoords });
      setGeocodeLoading(false);
      setGeocodeError(null);
    } else {
      setTripCoords(null);
      setGeocodeLoading(false);
      setGeocodeError(null);
    }
  }, [vehicleTrip]);

  // When selectedVehicleId changes, zoom and center map
  useEffect(() => {
    if (selectedVehicleId) {
      const loc = locations.find(l => l.vehicleId === selectedVehicleId);
      if (loc) {
        setMapCenter({ lat: loc.latitude, lng: loc.longitude });
        setMapZoom(16);
        setTimeout(() => {
          mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
          mapRef.current?.setZoom(16);
        }, 300);
      }
    } else {
      setMapCenter(userLocation || center);
      setMapZoom(12);
      setTimeout(() => {
        mapRef.current?.panTo(userLocation || center);
        mapRef.current?.setZoom(12);
      }, 300);
    }
  }, [selectedVehicleId, userLocation, locations]);

  useEffect(() => {
    if (token && (sidebarTab === 'drivers' || drivers.length === 0)) {
      setDriversLoading(true);
      setDriversError(null);
      getUsers({ role: 'driver' }, token)
        .then(setDrivers)
        .catch(e => setDriversError(e.message))
        .finally(() => setDriversLoading(false));
    }
  }, [token, sidebarTab]);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sidebar */}
      <aside className="bg-white/90 border-r border-gray-200 shadow-lg p-4 w-full md:w-72 min-w-[220px] max-w-xs z-20 flex flex-col">
        {/* Sidebar header/logo */}
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo192.png" alt="Logo" className="w-8 h-8 rounded-full shadow" />
          <span className="font-bold text-xl text-blue-700 tracking-wide">Live Tracking</span>
        </div>
        {/* Tabs */}
        <div className="w-full mb-4">
          <div className="flex gap-0 w-full bg-gray-100 rounded-lg overflow-hidden border-b border-gray-200">
            <button className={`flex-1 min-w-0 px-3 py-2 font-bold transition focus:outline-none text-ellipsis whitespace-nowrap overflow-hidden ${sidebarTab === 'vehicles' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`} onClick={() => setSidebarTab('vehicles')}>Vehicles <span className="ml-1 text-xs">({vehicles.length})</span></button>
            <button className={`flex-1 min-w-0 px-3 py-2 font-bold transition focus:outline-none text-ellipsis whitespace-nowrap overflow-hidden ${sidebarTab === 'agents' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`} onClick={() => setSidebarTab('agents')}>Agents <span className="ml-1 text-xs">({agents.length})</span></button>
            <button className={`flex-1 min-w-0 px-3 py-2 font-bold transition focus:outline-none text-ellipsis whitespace-nowrap overflow-hidden ${sidebarTab === 'clients' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`} onClick={() => setSidebarTab('clients')}>Clients <span className="ml-1 text-xs">({clients.length})</span></button>
            <button className={`flex-1 min-w-0 px-3 py-2 font-bold transition focus:outline-none text-ellipsis whitespace-nowrap overflow-hidden ${sidebarTab === 'drivers' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-purple-50'}`} onClick={() => setSidebarTab('drivers')}>Drivers <span className="ml-1 text-xs">({drivers.length})</span></button>
          </div>
        </div>
        {/* Tab content */}
        <div className="flex-1">
          {sidebarTab === 'vehicles' && (
            <>
              {/* Search/filter bar */}
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Search vehicles..."
                  value={vehicleSearch}
                  onChange={e => setVehicleSearch(e.target.value)}
                />
              </div>
              {/* Online/offline toggles */}
              <div className="mb-2 flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showOnline} onChange={e => setShowOnline(e.target.checked)} /> Online
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showOffline} onChange={e => setShowOffline(e.target.checked)} /> Offline
                </label>
              </div>
              {/* Vehicle list */}
              <ul className="overflow-y-auto max-h-[calc(100vh-260px)] pr-2 divide-y divide-gray-100">
                {vehicles.filter(v => {
                  const loc = locations.find(l => l.vehicleId === v._id);
                  const online = loc && isOnline(loc.updatedAt);
                  if (!showOnline && online) return false;
                  if (!showOffline && !online) return false;
                  if (vehicleSearch && !(v.name || v._id).toLowerCase().includes(vehicleSearch.toLowerCase())) return false;
                  return true;
                }).length === 0 ? (
                  <li className="text-gray-400 py-4 text-center">No vehicles</li>
                ) : vehicles.filter(v => {
                  const loc = locations.find(l => l.vehicleId === v._id);
                  const online = loc && isOnline(loc.updatedAt);
                  if (!showOnline && online) return false;
                  if (!showOffline && !online) return false;
                  if (vehicleSearch && !(v.name || v._id).toLowerCase().includes(vehicleSearch.toLowerCase())) return false;
                  return true;
                }).map(v => {
                  const loc = locations.find(l => l.vehicleId === v._id);
                  const online = loc && isOnline(loc.updatedAt);
            return (
                    <li
                      key={v._id}
                      className={`flex items-center justify-between py-3 px-2 rounded transition group cursor-pointer ${selectedVehicleId === v._id ? 'bg-blue-600 text-white shadow-lg scale-105 border-l-4 border-blue-800' : 'hover:bg-blue-50'}`}
                      style={{ transition: 'all 0.2s' }}
                      onClick={() => {
                        setSelectedVehicleId(v._id);
                        setSelectedDriverId('');
                        setSelectedAgentId('');
                        setSelectedClientId('');
                        if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                      }}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedVehicleId(v._id);
                          if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                        }
                      }}
                      aria-label={`Select vehicle ${v.name || v._id}`}
                    >
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <FaCarSide className="text-blue-400" />
                          {v.name || v._id}
                          <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>
                        <div className="text-xs text-gray-500">{loc ? loc.status : 'Offline'}</div>
                      </div>
                      <button
                        className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition"
                        onClick={e => {
                          e.stopPropagation();
                          if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                        }}
                        disabled={!loc}
                        title="Focus on map"
                      >
                        <FaMapMarkerAlt />
                      </button>
              </li>
            );
          })}
        </ul>
            </>
          )}
          {sidebarTab === 'agents' && (
            <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-2 divide-y divide-orange-100">
              {/* Search/filter bar */}
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Search agents..."
                  value={agentSearch}
                  onChange={e => setAgentSearch(e.target.value)}
                />
              </div>
              {/* Online/offline toggles */}
              <div className="mb-2 flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showAgentsOnline} onChange={e => setShowAgentsOnline(e.target.checked)} /> Online
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showAgentsOffline} onChange={e => setShowAgentsOffline(e.target.checked)} /> Offline
                </label>
              </div>
              {agentsLoading ? (
                <div className="text-orange-500 py-4 text-center">Loading agents...</div>
              ) : agentsError ? (
                <div className="text-red-500 py-4 text-center">{agentsError}</div>
              ) : agents.filter(agent => {
                const online = isAgentOnline(agent);
                if (!showAgentsOnline && online) return false;
                if (!showAgentsOffline && !online) return false;
                if (agentSearch && !(agent.name || '').toLowerCase().includes(agentSearch.toLowerCase()) && !(agent.email || '').toLowerCase().includes(agentSearch.toLowerCase())) return false;
                return true;
              }).length === 0 ? (
                <div className="text-gray-400 py-4 text-center">No agents to display yet.</div>
              ) : agents.filter(agent => {
                const online = isAgentOnline(agent);
                if (!showAgentsOnline && online) return false;
                if (!showAgentsOffline && !online) return false;
                if (agentSearch && !(agent.name || '').toLowerCase().includes(agentSearch.toLowerCase()) && !(agent.email || '').toLowerCase().includes(agentSearch.toLowerCase())) return false;
                return true;
              }).map(agent => (
                <button
                  key={agent._id}
                  className={`w-full text-left py-3 px-3 flex items-center gap-3 rounded-lg transition group focus:outline-none relative ${selectedAgentId === agent._id ? 'bg-orange-100 border border-orange-400 shadow' : 'hover:bg-orange-50'}`}
                  onClick={() => {
                    setSelectedAgentId(agent._id);
                    setSelectedVehicleId('');
                    setSelectedDriverId('');
                    setSelectedClientId('');
                    const loc = Object.values(locations).find(l => l.agentId === agent._id);
                    if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                  }}
                  style={{ minHeight: 64 }}
                >
                  {/* Avatar or initials */}
                  {agent.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full object-cover shadow" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-lg shadow">
                      {getInitials(agent.name)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 truncate">{agent.email}</div>
                  </div>
                  {/* Status badge (default to Active) */}
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-orange-500">Active</span>
                </button>
              ))}
            </div>
          )}
          {sidebarTab === 'clients' && (
            <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-2 divide-y divide-green-100">
              {/* Search/filter bar */}
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                />
              </div>
              {/* Online/offline toggles */}
              <div className="mb-2 flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showClientsOnline} onChange={e => setShowClientsOnline(e.target.checked)} /> Online
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showClientsOffline} onChange={e => setShowClientsOffline(e.target.checked)} /> Offline
                </label>
              </div>
              {clientsLoading ? (
                <div className="text-green-600 py-4 text-center">Loading clients...</div>
              ) : clientsError ? (
                <div className="text-red-500 py-4 text-center">{clientsError}</div>
              ) : clients.filter(client => {
                const online = isClientOnline(client);
                if (!showClientsOnline && online) return false;
                if (!showClientsOffline && !online) return false;
                if (clientSearch && !(client.name || '').toLowerCase().includes(clientSearch.toLowerCase()) && !(client.email || '').toLowerCase().includes(clientSearch.toLowerCase())) return false;
                return true;
              }).length === 0 ? (
                <div className="text-gray-400 py-4 text-center">No clients to display yet.</div>
              ) : clients.filter(client => {
                const online = isClientOnline(client);
                if (!showClientsOnline && online) return false;
                if (!showClientsOffline && !online) return false;
                if (clientSearch && !(client.name || '').toLowerCase().includes(clientSearch.toLowerCase()) && !(client.email || '').toLowerCase().includes(clientSearch.toLowerCase())) return false;
                return true;
              }).map(client => (
                <button
                  key={client._id}
                  className={`w-full text-left py-3 px-3 flex items-center gap-3 rounded-lg transition group focus:outline-none relative ${selectedClientId === client._id ? 'bg-green-100 border border-green-400 shadow' : 'hover:bg-green-50'}`}
                  onClick={() => {
                    setSelectedClientId(client._id);
                    setSelectedVehicleId('');
                    setSelectedDriverId('');
                    setSelectedAgentId('');
                    const loc = Object.values(locations).find(l => l.clientId === client._id);
                    if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                  }}
                  style={{ minHeight: 64 }}
                >
                  {/* Avatar or initials */}
                  {client.avatarUrl ? (
                    <img src={client.avatarUrl} alt={client.name} className="w-8 h-8 rounded-full object-cover shadow" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-lg shadow">
                      {getInitials(client.name)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{client.name}</div>
                    <div className="text-xs text-gray-500 truncate">{client.email}</div>
                    {client.assignedAgent && (
                      <div className="text-xs text-gray-400 truncate">Agent: {client.assignedAgent.name}</div>
                    )}
                  </div>
                  {/* Status badge (default to Active) */}
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-green-600">Active</span>
                </button>
              ))}
            </div>
          )}
          {sidebarTab === 'drivers' && (
            <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-2 divide-y divide-purple-100">
              {/* Search/filter bar */}
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 flex-1"
                  placeholder="Search drivers..."
                  value={driverSearch}
                  onChange={e => setDriverSearch(e.target.value)}
                />
              </div>
              {/* Online/offline toggles */}
              <div className="mb-4 flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showDriversOnline} onChange={e => {
                    if (!e.target.checked && !showDriversOffline) return; // Prevent both off
                    setShowDriversOnline(e.target.checked);
                  }} /> Online
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={showDriversOffline} onChange={e => {
                    if (!e.target.checked && !showDriversOnline) return; // Prevent both off
                    setShowDriversOffline(e.target.checked);
                  }} /> Offline
                </label>
              </div>
              {driversLoading ? (
                <div className="text-purple-500 py-4 text-center">Loading drivers...</div>
              ) : driversError ? (
                <div className="text-red-500 py-4 text-center">{driversError}</div>
              ) : (() => {
                const filteredDrivers = drivers.filter(driver => {
                  const loc = Object.values(driverLocations).find(l => l.driverId === driver._id);
                  const online = loc && isOnline(loc.updatedAt);
                  // If both toggles are checked and search is empty, show all drivers
                  if (showDriversOnline && showDriversOffline && !driverSearch) return true;
                  if (!showDriversOnline && online) return false;
                  if (!showDriversOffline && !online) return false;
                  if (driverSearch && !(driver.name || '').toLowerCase().includes(driverSearch.toLowerCase()) && !(driver.email || '').toLowerCase().includes(driverSearch.toLowerCase())) return false;
                  return true;
                });
                if (filteredDrivers.length === 0) {
                  return <div className="text-gray-400 py-4 text-center">No drivers to display yet.</div>;
                }
                return filteredDrivers.map(driver => {
                  const loc = Object.values(driverLocations).find(l => l.driverId === driver._id);
                  const pos = loc ? (animatedDriverPositions[driver._id] || { lat: loc.latitude, lng: loc.longitude }) : null;
                  const online = loc && isOnline(loc.updatedAt);
                  // Assignment status logic
                  let assignmentText = 'Unassigned';
                  if (
                    driver.assignedVehicle &&
                    (typeof driver.assignedVehicle.numberPlate === 'string' && driver.assignedVehicle.numberPlate.trim() !== '' ||
                     typeof driver.assignedVehicle.name === 'string' && driver.assignedVehicle.name.trim() !== '')
                  ) {
                    assignmentText = `Assigned: ${driver.assignedVehicle.numberPlate || driver.assignedVehicle.name}`;
                  }
                  // Defensive: never render an object
                  const safeName = typeof driver.name === 'string' ? driver.name : '-';
                  const safeEmail = typeof driver.email === 'string' ? driver.email : '-';
                  const isSelected = selectedDriverId === driver._id;
                  return (
                    <button
                      key={driver._id}
                      className={`w-full text-left py-3 px-3 flex items-center gap-3 rounded-lg transition group focus:outline-none relative ${isSelected ? 'bg-purple-100 border border-purple-400 shadow' : 'hover:bg-purple-50'}`}
                      onClick={() => {
                        setSelectedDriverId(driver._id);
                        setSelectedVehicleId('');
                        setSelectedAgentId('');
                        setSelectedClientId('');
                        if (loc && pos) mapRef.current?.panTo({ lat: pos.lat, lng: pos.lng });
                      }}
                      style={{ minHeight: 64 }}
                    >
                      {/* Avatar or initials, fallback if image fails */}
                      {driver.avatarUrl ? (
                        <img
                          src={driver.avatarUrl}
                          alt={safeName}
                          className="w-9 h-9 rounded-full object-cover shadow"
                          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-lg shadow">
                          {typeof safeName === 'string' ? getInitials(safeName) : '?'}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate flex items-center gap-1">
                          <span className="truncate max-w-[120px]">{safeName}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <span className="truncate max-w-[140px]">{safeEmail}</span>
                          {safeEmail && safeEmail !== '-' && (
                            <a href={`mailto:${safeEmail}`} className="ml-1 text-blue-400 hover:text-blue-600" title="Email">
                              <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0-4V8" /></svg>
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{assignmentText}</div>
                        {!loc && <div className="text-xs text-gray-400">No location</div>}
                      </div>
                      {/* Single status badge, right-aligned and vertically centered */}
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${online ? 'bg-purple-600' : 'bg-gray-400'}`}>{online ? 'Online' : 'Offline'}</span>
                    </button>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </aside>
      {/* Main content area with responsive map/card layout */}
      <main className="flex-1 flex flex-col gap-6 p-4 md:p-8">
        {/* Top controls row */}
        <div className="flex flex-col gap-4 mb-2">
          {/* Stats Row */}
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <FaMapMarkerAlt className="text-green-500 text-lg" />
              <div>
                <div className="text-xs text-gray-500">Tracked Vehicles</div>
                <div className="text-lg font-bold text-gray-900">{locations.length}</div>
              </div>
            </div>
            <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <div>
                <div className="text-xs text-gray-500">Online Vehicles</div>
                <div className="text-lg font-bold text-gray-900">{onlineVehicles}</div>
              </div>
            </div>
            <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
              <div>
                <div className="text-xs text-gray-500">Offline Vehicles</div>
                <div className="text-lg font-bold text-gray-900">{offlineVehicles}</div>
              </div>
            </div>
            <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <FaCarSide className="text-orange-400 text-lg" />
              <div>
                <div className="text-xs text-gray-500">Agents</div>
                <div className="text-lg font-bold text-gray-900">{agents.length}</div>
              </div>
            </div>
            <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <FaCarSide className="text-green-400 text-lg" />
              <div>
                <div className="text-xs text-gray-500">Clients</div>
                <div className="text-lg font-bold text-gray-900">{clients.length}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Map area */}
        <div className={`flex-1 flex transition-all duration-500 ease-in-out ${((selectedVehicleId || selectedDriverId || selectedAgentId || selectedClientId) && !isCardFloating) ? 'flex-row' : 'flex-col'}`}>
          {/* Map Card */}
          <div className={`bg-white/90 border border-gray-100 rounded-2xl shadow-lg p-0 md:p-2 min-h-[400px] max-h-[70vh] overflow-hidden transition-all duration-500 ease-in-out ${((selectedVehicleId || selectedDriverId || selectedAgentId || selectedClientId) && !isCardFloating) ? 'flex-1 mr-4' : 'w-full'}`}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={map => (mapRef.current = map)}
                mapTypeId={mapStyle.mapTypeId}
                options={mapStyle.styles ? { styles: mapStyle.styles } : {}}
              >
                {/* Show user location marker with pulsing effect */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    label="You"
                    icon={{
                      url: `data:image/svg+xml;utf8,${encodeURIComponent(
                        renderToStaticMarkup(<PulsingMarker color="#2563eb" size={32} />)
                      )}`,
                      scaledSize: { width: 32, height: 32 },
                    }}
                  />
                )}
                {/* Only show selected vehicle marker if selected, else show all clustered */}
                {selectedVehicleId ? (
                  (() => {
                    const vehicle = vehicles.find(v => v._id === selectedVehicleId);
                    const loc = getLiveLocationForVehicle(vehicle);
                    const pos = animatedVehiclePositions[vehicle?._id] || (loc ? { lat: loc.latitude, lng: loc.longitude } : null);
                    return loc && vehicle && pos ? (
                      <Marker
                        key={vehicle._id}
                        position={pos}
                        label={vehicle.name || vehicle._id}
                        icon={{
                          url: `data:image/svg+xml;utf8,${encodeURIComponent(
                            renderToStaticMarkup(<PulsingMarker color={loc.status === 'moving' ? '#22c55e' : '#ef4444'} size={40} />)
                          )}`,
                          scaledSize: { width: 40, height: 40 },
                        }}
                        onClick={() => setSelectedMarker({ type: 'live', vehicleId: vehicle._id })}
                      />
                    ) : null;
                  })()
                ) : (
                  <MarkerClusterer>
                    {(clusterer) => renderClusteredMarkers(clusterer)}
                  </MarkerClusterer>
                )}
                {/* Live marker info popup */}
                {selectedMarker && selectedMarker.type === 'live' && (() => {
                  const loc = locations.find(l => l.vehicleId === selectedMarker.vehicleId);
                  const vehicle = getVehicleInfo(selectedMarker.vehicleId);
                  if (!loc) return null;
                  const online = isOnline(loc.updatedAt);
                  return (
                    <InfoWindow
                      position={{ lat: loc.latitude, lng: loc.longitude }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="min-w-[220px] p-2 rounded-xl bg-white/90 shadow-lg">
                        <div className="font-bold text-blue-700 text-lg mb-1 flex items-center gap-2">
                          <FaCarSide /> {vehicle.name || loc.vehicleId}
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${online ? 'bg-green-500' : 'bg-gray-400'}`}>{online ? 'Online' : 'Offline'}</span>
                        </div>
                        <div className="text-xs text-gray-700 mb-1">Driver: {getDriverName(vehicle) || 'N/A'}</div>
                        <div className="text-xs mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${loc.status === 'moving' ? 'bg-green-500' : 'bg-red-500'}`}>{loc.status}</span>
                          <span className="ml-2 text-gray-700">Speed: {loc.speed} km/h</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Last update: {formatTime(loc.updatedAt)}</div>
                        <button
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                          onClick={() => mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude })}
                        >Focus</button>
                      </div>
                    </InfoWindow>
                  );
                })()}
                {/* Route playback polyline and markers (not clustered) */}
                {selectedVehicleId && history.length > 1 && (
                  <Polyline
                    path={history.map(h => ({ lat: h.latitude, lng: h.longitude }))}
                    options={{ strokeColor: '#007bff', strokeWeight: 4, strokeOpacity: 0.7 }}
                  />
                )}
                {/* Animated playback marker for selected vehicle only */}
                {selectedVehicleId && history.length > 1 && (
                  <Marker
                    position={{ lat: history[currentStep].latitude, lng: history[currentStep].longitude }}
                    label="▶"
                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' }}
                    onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicleId, idx: currentStep })}
                  />
                )}
                {/* Start/end markers for playback for selected vehicle only */}
                {selectedVehicleId && history.length > 0 && (
                  <Marker
                    position={{ lat: history[0].latitude, lng: history[0].longitude }}
                    label="Start"
                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                    onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicleId, idx: 0 })}
                  />
                )}
                {selectedVehicleId && history.length > 1 && (
                  <Marker
                    position={{ lat: history[history.length - 1].latitude, lng: history[history.length - 1].longitude }}
                    label="End"
                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }}
                    onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicleId, idx: history.length - 1 })}
                  />
                )}
                {/* Info popup for playback markers */}
                {selectedMarker && selectedMarker.type === 'history' && history[selectedMarker.idx] && (() => {
                  const h = history[selectedMarker.idx];
                  const vehicle = getVehicleInfo(selectedMarker.vehicleId);
                  return (
                    <InfoWindow
                      position={{ lat: h.latitude, lng: h.longitude }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="min-w-[220px] p-2 rounded-xl bg-white/90 shadow-lg">
                        <div className="font-bold text-blue-700 text-lg mb-1 flex items-center gap-2">
                          <FaCarSide /> {vehicle.name || h.vehicleId}
                        </div>
                        <div className="text-xs text-gray-700 mb-1">Driver: {getDriverName(vehicle) || 'N/A'}</div>
                        <div className="text-xs mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${h.status === 'moving' ? 'bg-green-500' : 'bg-red-500'}`}>{h.status}</span>
                          <span className="ml-2 text-gray-700">Speed: {h.speed} km/h</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Time: {formatTime(h.updatedAt)}</div>
                        <button
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                          onClick={() => mapRef.current?.panTo({ lat: h.latitude, lng: h.longitude })}
                        >Focus</button>
                      </div>
                    </InfoWindow>
                  );
                })()}
                {/* In map rendering, show trip route and markers if available, or loader/error if geocoding */}
                {selectedVehicleId && (
                  geocodeLoading ? (
                    <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white/80 p-4 rounded shadow">
                      <span className="text-indigo-600 font-semibold">Geocoding trip addresses...</span>
                    </div>
                  ) : geocodeError ? (
                    <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-red-100 p-4 rounded shadow">
                      <span className="text-red-600 font-semibold">{geocodeError}</span>
                    </div>
                  ) : tripCoords && tripCoords.pickupCoords && tripCoords.destinationCoords && (
                    <>
                      <Polyline
                        path={[tripCoords.pickupCoords, tripCoords.destinationCoords]}
                        options={{ strokeColor: '#8b5cf6', strokeWeight: 5, strokeOpacity: 0.8 }}
                      />
                      {/* Pickup marker */}
                      <Marker
                        position={tripCoords.pickupCoords}
                        label="Pickup"
                        icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
                      />
                      {/* Dropoff marker */}
                      <Marker
                        position={tripCoords.destinationCoords}
                        label="Dropoff"
                        icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                      />
                    </>
                  )
                )}
                {/* Agent markers */}
                {sidebarTab === 'agents' && agents.map(agent => {
                  const loc = Object.values(locations).find(l => l.agentId === agent._id);
                  if (!loc) return null;
                  const pos = animatedDriverPositions[agent._id] || { lat: loc.latitude, lng: loc.longitude };
                  return (
                    <Marker
                      key={agent._id}
                      position={pos}
                      label={agent.name || agent._id}
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png' }}
                      onClick={() => setSelectedAgentId(agent._id)}
                    />
                  );
                })}
                {/* Client markers */}
                {sidebarTab === 'clients' && clients.map(client => {
                  const loc = Object.values(locations).find(l => l.clientId === client._id);
                  if (!loc) return null;
                  return (
                    <Marker
                      key={client._id}
                      position={{ lat: loc.latitude, lng: loc.longitude }}
                      label={client.name || client._id}
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
                      onClick={() => setSelectedClientId(client._id)}
                    />
                  );
                })}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-lg">Loading map...</div>
            )}
          </div>
          {/* Docked details card (right of map) for all types */}
          {selectedVehicleId && !isCardFloating && (
            <div className="w-full md:w-[370px] max-w-md transition-all duration-500 ease-in-out animate-fade-in">
              <VehicleDetailsCard
                vehicle={vehicles.find(v => v._id === selectedVehicleId)}
                location={locations.find(l => l.vehicleId === selectedVehicleId)}
                driver={getDriverForVehicle(vehicles.find(v => v._id === selectedVehicleId))}
                trip={vehicleTrip}
                onBack={() => setSelectedVehicleId('')}
                onFocus={() => {
                  const loc = locations.find(l => l.vehicleId === selectedVehicleId);
                  if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                }}
                isFloating={false}
                onToggleFloating={() => setIsCardFloating(true)}
              />
            </div>
          )}
          {selectedDriverId && !isCardFloating && (
            <div className="w-full md:w-[370px] max-w-md transition-all duration-500 ease-in-out animate-fade-in">
              <DriverDetailsCard
                driver={drivers.find(d => d._id === selectedDriverId)}
                location={Object.values(driverLocations).find(l => l.driverId === selectedDriverId)}
                onBack={() => setSelectedDriverId('')}
                onFocus={() => {
                  const loc = Object.values(driverLocations).find(l => l.driverId === selectedDriverId);
                  if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                }}
                isFloating={false}
                onToggleFloating={() => setIsCardFloating(true)}
              />
            </div>
          )}
          {selectedAgentId && !isCardFloating && (
            <div className="w-full md:w-[370px] max-w-md transition-all duration-500 ease-in-out animate-fade-in">
              <AgentDetailsCard
                agent={agents.find(a => a._id === selectedAgentId)}
                onBack={() => setSelectedAgentId('')}
                isFloating={false}
                onToggleFloating={() => setIsCardFloating(true)}
              />
            </div>
          )}
          {selectedClientId && !isCardFloating && (
            <div className="w-full md:w-[370px] max-w-md transition-all duration-500 ease-in-out animate-fade-in">
              <ClientDetailsCard
                client={clients.find(c => c._id === selectedClientId)}
                onBack={() => setSelectedClientId('')}
                isFloating={false}
                onToggleFloating={() => setIsCardFloating(true)}
              />
            </div>
          )}
          {/* Floating details card overlay for all types */}
          {selectedVehicleId && isCardFloating && (
            <Draggable nodeRef={detailsCardRef}>
              <div ref={detailsCardRef} className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white/95 rounded-2xl shadow-2xl border border-blue-200 p-4 animate-fade-float">
                <VehicleDetailsCard
                  vehicle={vehicles.find(v => v._id === selectedVehicleId)}
                  location={locations.find(l => l.vehicleId === selectedVehicleId)}
                  driver={getDriverForVehicle(vehicles.find(v => v._id === selectedVehicleId))}
                  trip={vehicleTrip}
                  onBack={() => setSelectedVehicleId('')}
                  onFocus={() => {
                    const loc = locations.find(l => l.vehicleId === selectedVehicleId);
                    if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                  }}
                  isFloating={true}
                  onToggleFloating={() => setIsCardFloating(false)}
                />
              </div>
            </Draggable>
          )}
          {selectedDriverId && isCardFloating && (
            <Draggable nodeRef={detailsCardRef}>
              <div ref={detailsCardRef} className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white/95 rounded-2xl shadow-2xl border border-purple-200 p-4 animate-fade-float">
                <DriverDetailsCard
                  driver={drivers.find(d => d._id === selectedDriverId)}
                  location={Object.values(driverLocations).find(l => l.driverId === selectedDriverId)}
                  onBack={() => setSelectedDriverId('')}
                  onFocus={() => {
                    const loc = Object.values(driverLocations).find(l => l.driverId === selectedDriverId);
                    if (loc) mapRef.current?.panTo({ lat: loc.latitude, lng: loc.longitude });
                  }}
                  isFloating={true}
                  onToggleFloating={() => setIsCardFloating(false)}
                />
              </div>
            </Draggable>
          )}
          {selectedAgentId && isCardFloating && (
            <Draggable nodeRef={detailsCardRef}>
              <div ref={detailsCardRef} className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white/95 rounded-2xl shadow-2xl border border-orange-200 p-4 animate-fade-float">
                <AgentDetailsCard
                  agent={agents.find(a => a._id === selectedAgentId)}
                  onBack={() => setSelectedAgentId('')}
                  isFloating={true}
                  onToggleFloating={() => setIsCardFloating(false)}
                />
              </div>
            </Draggable>
          )}
          {selectedClientId && isCardFloating && (
            <Draggable nodeRef={detailsCardRef}>
              <div ref={detailsCardRef} className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white/95 rounded-2xl shadow-2xl border border-green-200 p-4 animate-fade-float">
                <ClientDetailsCard
                  client={clients.find(c => c._id === selectedClientId)}
                  onBack={() => setSelectedClientId('')}
                  isFloating={true}
                  onToggleFloating={() => setIsCardFloating(false)}
                />
              </div>
            </Draggable>
          )}
      </div>
      </main>
      {/* Add fade-in animation */}
      <style>{`
.animate-fade-in { animation: fadeIn 0.4s; } 
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-slide-in-card { animation: slideInCard 0.5s cubic-bezier(.4,1.2,.4,1); }
@keyframes slideInCard { from { opacity: 0; transform: translateX(100px);} to { opacity: 1; transform: none; } }
.animate-fade-float { animation: fadeFloat 0.5s cubic-bezier(.4,1.2,.4,1); }
@keyframes fadeFloat { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: none; } }
`}</style>
    </div>
  );
}

export default LiveTracking; 