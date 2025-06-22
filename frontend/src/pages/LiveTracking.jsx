/**
 * Enhanced Live Tracking - All vehicles, drivers, clients
 * Features:
 * - Real-time tracking of all vehicles, drivers, and clients
 * - Advanced filtering and search
 * - Route history playback
 * - Status indicators and alerts
 */
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { getAllLocations, getLocationHistory } from '../services/locationService';
import { getVehicles } from '../services/vehicleService';
import { getBookings } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import StatCard from '../components/common/StatCard';
import { FaMapMarkerAlt, FaBars, FaTimes, FaCarSide, FaSyncAlt, FaUser, FaUsers, FaSearch, FaFilter, FaCar, FaRoute, FaClock, FaEye, FaEyeSlash, FaCheckCircle, FaTools, FaDownload, FaLocationArrow, FaCompass, FaSatellite, FaStreetView, FaLayerGroup, FaInfoCircle, FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAgents, getUsers } from '../services/userService';
import { getClients } from '../services/clientService';
import VehicleDetailsCard from '../components/VehicleDetailsCard';
import Draggable from 'react-draggable';
import axios from 'axios';
import DriverDetailsCard from '../components/DriverDetailsCard';
import AgentDetailsCard from '../components/AgentDetailsCard';
import ClientDetailsCard from '../components/ClientDetailsCard';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';
import Notification from '../components/common/Notification';

const containerStyle = {
  width: '100%',
  height: '600px',
};

// Placeholder center (Dubai)
const center = {
  lat: 25.2048,
  lng: 55.2708,
};

// Enhanced Pulsing Marker with different colors for different entity types
const PulsingMarker = ({ color = '#007bff', size = 32, entityType = 'vehicle' }) => {
  const getMarkerIcon = () => {
    switch (entityType) {
      case 'driver':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="8" fill={color} fillOpacity="0.7">
      <animate attributeName="r" values="8;14;8" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="16" r="5" fill={color} />
    <circle cx="16" cy="16" r="2" fill="#fff" />
            <path d="M12 20h8l-4-4z" fill="#fff" />
  </svg>
);
      case 'client':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="8" fill={color} fillOpacity="0.7">
              <animate attributeName="r" values="8;14;8" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="16" r="5" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fff" />
            <path d="M14 18h4l-2-2z" fill="#fff" />
          </svg>
        );
      default: // vehicle
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="8" fill={color} fillOpacity="0.7">
              <animate attributeName="r" values="8;14;8" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="16" r="5" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fff" />
            <path d="M10 20h12l-2-4h-8l-2 4z" fill="#fff" />
          </svg>
        );
    }
  };

  return getMarkerIcon();
};

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
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Enhanced state management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles', 'drivers', 'clients', 'agents'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline', 'active', 'inactive'
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0]);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(12);

  // Real-time tracking stats
  const [stats, setStats] = useState({
    totalVehicles: 0,
    onlineVehicles: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    totalClients: 0,
    activeClients: 0,
    totalAgents: 0,
    onlineAgents: 0
  });

  const [bookings, setBookings] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showBookings, setShowBookings] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [locs, vehs, drvs, clts, agts, bookingsData] = await Promise.all([
          getAllLocations(token),
          getVehicles(token),
          getUsers({ role: 'driver' }, token),
          getClients(token),
          getUsers({ role: 'agent' }, token),
          getBookings(token, null)
        ]);
        setLocations(locs);
        setVehicles(vehs);
        setDrivers(drvs);
        setClients(clts);
        setAgents(agts);
        setBookings(bookingsData);
        
        // Calculate stats
        const onlineVehicles = vehs.filter(v => isOnline(v.lastUpdated)).length;
        const onlineDrivers = drvs.filter(d => isOnline(d.lastUpdated)).length;
        const activeClients = clts.filter(c => c.status === 'active').length;
        const onlineAgents = agts.filter(a => isOnline(a.lastUpdated)).length;
        
        setStats({
          totalVehicles: vehs.length,
          onlineVehicles,
          totalDrivers: drvs.length,
          onlineDrivers,
          totalClients: clts.length,
          activeClients,
          totalAgents: agts.length,
          onlineAgents
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tracking data');
        setNotification({ 
          message: 'Failed to load tracking data: ' + (err.response?.data?.message || err.message), 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!token) return;
    
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

    socket.on('driverLocationUpdate', (driverLocation) => {
      // Handle driver location updates
      setDrivers(prev => prev.map(d => 
        d._id === driverLocation.driverId 
          ? { ...d, location: driverLocation }
          : d
      ));
    });

    socket.on('clientLocationUpdate', (clientLocation) => {
      // Handle client location updates
      setClients(prev => prev.map(c => 
        c._id === clientLocation.clientId 
          ? { ...c, location: clientLocation }
          : c
      ));
    });

    return () => socket.disconnect();
  }, [token]);

  const isOnline = (lastUpdated) => {
    if (!lastUpdated) return false;
    const now = new Date();
    const last = new Date(lastUpdated);
    const diffMinutes = (now - last) / (1000 * 60);
    return diffMinutes < 5; // Consider online if updated within last 5 minutes
  };

  const getFilteredEntities = () => {
    let entities = [];
    let searchFields = [];

    switch (activeTab) {
      case 'vehicles':
        entities = vehicles;
        searchFields = ['name', 'numberPlate', 'driverName'];
        break;
      case 'drivers':
        entities = drivers;
        searchFields = ['name', 'email', 'phone'];
        break;
      case 'clients':
        entities = clients;
        searchFields = ['name', 'email', 'phone'];
        break;
      case 'agents':
        entities = agents;
        searchFields = ['name', 'email', 'phone'];
        break;
    }

    // Apply search filter
    if (searchTerm) {
      entities = entities.filter(entity => 
        searchFields.some(field => 
          entity[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      entities = entities.filter(entity => {
        switch (statusFilter) {
          case 'online':
            return isOnline(entity.lastUpdated);
          case 'offline':
            return !isOnline(entity.lastUpdated);
          case 'active':
            return entity.status === 'active';
          case 'inactive':
            return entity.status === 'inactive';
          default:
            return true;
        }
      });
    }

    return entities;
  };

  const getEntityLocation = (entity) => {
    switch (activeTab) {
      case 'vehicles':
        return locations.find(l => l.vehicleId === entity._id);
      case 'drivers':
        return entity.location;
      case 'clients':
        return entity.location;
      case 'agents':
        return entity.location;
      default:
        return null;
    }
  };

  const getEntityColor = (entity) => {
    const isEntityOnline = isOnline(entity.lastUpdated);
    
    switch (activeTab) {
      case 'vehicles':
        return isEntityOnline ? '#22c55e' : '#6b7280';
      case 'drivers':
        return isEntityOnline ? '#3b82f6' : '#6b7280';
      case 'clients':
        return entity.status === 'active' ? '#f59e0b' : '#6b7280';
      case 'agents':
        return isEntityOnline ? '#8b5cf6' : '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity);
    const location = getEntityLocation(entity);
    if (location) {
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMapZoom(15);
    }
  };

  const renderEntityMarkers = () => {
    const filteredEntities = getFilteredEntities();
    
    return filteredEntities.map(entity => {
      const location = getEntityLocation(entity);
      if (!location) return null;

      const color = getEntityColor(entity);
      const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        renderToStaticMarkup(<PulsingMarker color={color} entityType={activeTab.slice(0, -1)} />)
      )}`;

      return (
        <Marker
          key={`${activeTab}-${entity._id}`}
          position={{ lat: location.lat, lng: location.lng }}
          icon={{
            url: iconUrl,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          }}
          onClick={() => handleEntityClick(entity)}
        />
      );
    });
  };

  const renderDetailsCard = () => {
    if (!selectedEntity) return null;

    const location = getEntityLocation(selectedEntity);
    const isEntityOnline = isOnline(selectedEntity.lastUpdated);

    return (
      <Draggable>
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg capitalize">
              {activeTab.slice(0, -1)} Details
            </h3>
            <button 
              onClick={() => setSelectedEntity(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-2">
            <p><strong>Name:</strong> {selectedEntity.name}</p>
            {selectedEntity.email && <p><strong>Email:</strong> {selectedEntity.email}</p>}
            {selectedEntity.phone && <p><strong>Phone:</strong> {selectedEntity.phone}</p>}
            {location && (
              <>
                <p><strong>Location:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    isEntityOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isEntityOnline ? 'Online' : 'Offline'}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </Draggable>
    );
  };

  // Initialize map
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      mapTypeId: mapType,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Add traffic layer if enabled
    if (showTraffic) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }

    // Store map instance
    window.trackingMap = map;

    // Add map event listeners
    map.addListener('center_changed', () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.lat(), lng: center.lng() });
    });

    map.addListener('zoom_changed', () => {
      setMapZoom(map.getZoom());
    });

  }, [mapType, showTraffic, mapCenter, mapZoom]);

  // Update map markers when vehicles change
  useEffect(() => {
    if (!window.google || !window.trackingMap) return;

    // Clear existing markers
    if (window.vehicleMarkers) {
      window.vehicleMarkers.forEach(marker => marker.setMap(null));
    }
    window.vehicleMarkers = [];

    const filteredVehicles = vehicles.filter(v => {
      if (filterStatus && v.status !== filterStatus) return false;
      if (filterVehicleType && v.vehicleType !== filterVehicleType) return false;
      return true;
    });

    filteredVehicles.forEach(vehicle => {
      if (!vehicle.location) return;

      const marker = new window.google.maps.Marker({
        position: { lat: vehicle.location.lat, lng: vehicle.location.lng },
        map: window.trackingMap,
        title: vehicle.name,
        icon: {
          url: getVehicleIcon(vehicle.status, vehicle.vehicleType),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        },
        animation: vehicle.status === 'on-trip' ? window.google.maps.Animation.BOUNCE : null
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(vehicle, bookings)
      });

      marker.addListener('click', () => {
        setSelectedVehicle(vehicle);
        infoWindow.open(window.trackingMap, marker);
      });

      // Add tracking path if history exists
      if (showHistory && trackingHistory[vehicle._id] && trackingHistory[vehicle._id].length > 1) {
        const path = new window.google.maps.Polyline({
          path: trackingHistory[vehicle._id].map(point => ({ lat: point.lat, lng: point.lng })),
          geodesic: true,
          strokeColor: getVehicleColor(vehicle.status),
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: window.trackingMap
        });
      }

      window.vehicleMarkers.push(marker);
    });

  }, [vehicles, filterStatus, filterVehicleType, showHistory, trackingHistory]);

  // Add booking markers
  useEffect(() => {
    if (!window.google || !window.trackingMap || !showBookings) return;

    // Clear existing booking markers
    if (window.bookingMarkers) {
      window.bookingMarkers.forEach(marker => marker.setMap(null));
    }
    window.bookingMarkers = [];

    const activeBookings = bookings.filter(b => 
      b.status === 'Confirmed' && b.startLocation
    );

    activeBookings.forEach(booking => {
      const marker = new window.google.maps.Marker({
        position: { lat: booking.startLocation.lat, lng: booking.startLocation.lng },
        map: window.trackingMap,
        title: `Booking: ${booking.destination}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createBookingInfoContent(booking)
      });

      marker.addListener('click', () => {
        infoWindow.open(window.trackingMap, marker);
      });

      window.bookingMarkers.push(marker);
    });

  }, [bookings, showBookings]);

  const getVehicleIcon = (status, type) => {
    const baseColor = getVehicleColor(status);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${baseColor}" stroke="white" stroke-width="2"/>
        <path d="M8 20h16M10 12h12M12 8h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`;
  };

  const getVehicleColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'on-trip': return '#3B82F6';
      case 'maintenance': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const createInfoWindowContent = (vehicle, bookings) => {
    const vehicleBookings = bookings.filter(b => b.vehicle?._id === vehicle._id);
    const activeBooking = vehicleBookings.find(b => b.status === 'Confirmed');
    
    return `
      <div class="p-4 max-w-sm">
        <div class="font-bold text-lg mb-2">${vehicle.name}</div>
        <div class="text-sm text-gray-600 mb-2">${vehicle.numberPlate}</div>
        <div class="text-sm mb-2">
          <span class="font-medium">Status:</span> 
          <span class="px-2 py-1 rounded text-xs ${getStatusClass(vehicle.status)}">${vehicle.status}</span>
        </div>
        <div class="text-sm mb-2">
          <span class="font-medium">Driver:</span> ${vehicle.driverName || 'Unassigned'}
          </div>
        ${activeBooking ? `
          <div class="text-sm mb-2">
            <span class="font-medium">Current Trip:</span> ${activeBooking.destination}
        </div>
        ` : ''}
        <div class="text-sm text-gray-500">
          Last updated: ${vehicle.lastUpdate ? new Date(vehicle.lastUpdate).toLocaleTimeString() : 'Unknown'}
              </div>
              </div>
    `;
  };

  const createBookingInfoContent = (booking) => {
    return `
      <div class="p-4 max-w-sm">
        <div class="font-bold text-lg mb-2">Booking</div>
        <div class="text-sm mb-2">
          <span class="font-medium">Destination:</span> ${booking.destination}
                        </div>
        <div class="text-sm mb-2">
          <span class="font-medium">Client:</span> ${booking.client?.name || 'Unknown'}
                      </div>
        <div class="text-sm mb-2">
          <span class="font-medium">Date:</span> ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'TBD'}
              </div>
        <div class="text-sm mb-2">
          <span class="font-medium">Price:</span> $${booking.price || 0}
              </div>
                  </div>
    `;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-trip': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [vehiclesData, bookingsData] = await Promise.all([
        getVehicles(token),
        getBookings(token)
      ]);
      setVehicles(vehiclesData);
      setBookings(bookingsData);
      setNotification({ message: 'Tracking data refreshed!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: 'Failed to refresh data: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const centerOnVehicle = (vehicle) => {
    if (!window.trackingMap || !vehicle.location) return;
    
    window.trackingMap.setCenter({ lat: vehicle.location.lat, lng: vehicle.location.lng });
    window.trackingMap.setZoom(15);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportTrackingData = () => {
    const data = vehicles.map(v => ({
      name: v.name,
      numberPlate: v.numberPlate,
      status: v.status,
      driver: v.driverName,
      location: v.location ? `${v.location.lat}, ${v.location.lng}` : 'Unknown',
      lastUpdate: v.lastUpdate || 'Unknown'
    }));

    const csv = [
      ['Name', 'Number Plate', 'Status', 'Driver', 'Location', 'Last Update'],
      ...data.map(row => [row.name, row.numberPlate, row.status, row.driver, row.location, row.lastUpdate])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Statistics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'on-trip').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const vehiclesWithLocation = vehicles.filter(v => v.location).length;
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length;

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-96">Loading map...</div>;
  }

                  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
              <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Live Vehicle Tracking</h1>
            <p className="text-gray-600 mt-1">Real-time location tracking of your fleet</p>
              </div>
          <div className="flex gap-2">
            <Button
              color="secondary"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <FaSyncAlt className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              color="secondary"
              onClick={toggleFullscreen}
              className="flex items-center gap-2"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
                        </div>
                        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <StatCard icon={<FaCar />} label="Total Vehicles" value={totalVehicles} accentColor="blue" />
          <StatCard icon={<FaMapMarkerAlt />} label="With Location" value={vehiclesWithLocation} accentColor="green" />
          <StatCard icon={<FaCheckCircle />} label="Available" value={availableVehicles} accentColor="green" />
          <StatCard icon={<FaRoute />} label="On Trip" value={onTripVehicles} accentColor="blue" />
          <StatCard icon={<FaTools />} label="Maintenance" value={maintenanceVehicles} accentColor="yellow" />
          <StatCard icon={<FaClock />} label="Active Bookings" value={activeBookings} accentColor="purple" />
                      </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Map Type */}
              <Dropdown
                value={mapType}
                onChange={e => setMapType(e.target.value)}
                options={[
                  { value: 'roadmap', label: 'Road Map' },
                  { value: 'satellite', label: 'Satellite' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'terrain', label: 'Terrain' }
                ]}
                className="w-40"
              />

              {/* Vehicle Status Filter */}
              <Dropdown
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'available', label: 'Available' },
                  { value: 'on-trip', label: 'On Trip' },
                  { value: 'maintenance', label: 'Maintenance' }
                ]}
                className="w-40"
              />

              {/* Vehicle Type Filter */}
              <Dropdown
                value={filterVehicleType}
                onChange={e => setFilterVehicleType(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...Array.from(new Set(vehicles.map(v => v.vehicleType).filter(Boolean)))
                    .map(type => ({ value: type, label: type }))
                ]}
                className="w-40"
              />
            </div>

            <div className="flex gap-2">
              {/* Toggle Controls */}
              <Button
                color={showTraffic ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowTraffic(!showTraffic)}
                className="flex items-center gap-2"
              >
                <FaLayerGroup />
                Traffic
              </Button>
              <Button
                color={showBookings ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowBookings(!showBookings)}
                className="flex items-center gap-2"
              >
                <FaInfoCircle />
                Bookings
              </Button>
              <Button
                color={showHistory ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <FaRoute />
                History
              </Button>
              <Button
                color={autoRefresh ? "primary" : "secondary"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                {autoRefresh ? <FaPause /> : <FaPlay />}
                Auto
              </Button>
              <Button
                color="secondary"
                size="sm"
                onClick={exportTrackingData}
                className="flex items-center gap-2"
              >
                <FaDownload />
                Export
              </Button>
                        </div>
                        </div>
                      </div>
                    </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-[calc(100vh-300px)] min-h-[500px] rounded-2xl shadow-lg"
        />
        
        {/* Vehicle List Overlay */}
        {selectedVehicle && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Vehicle Details</h3>
              <Button
                color="secondary"
                size="sm"
                onClick={() => setSelectedVehicle(null)}
              >
                ×
              </Button>
          </div>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {selectedVehicle.name}</div>
              <div><strong>Plate:</strong> {selectedVehicle.numberPlate}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${getStatusClass(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
            </div>
              <div><strong>Driver:</strong> {selectedVehicle.driverName || 'Unassigned'}</div>
              {selectedVehicle.location && (
                <div><strong>Location:</strong> {selectedVehicle.location.lat.toFixed(4)}, {selectedVehicle.location.lng.toFixed(4)}</div>
              )}
            </div>
            <Button
              color="primary"
              size="sm"
              onClick={() => centerOnVehicle(selectedVehicle)}
              className="w-full mt-2"
            >
              <FaLocationArrow className="w-3 h-3" />
              Center on Map
            </Button>
            </div>
          )}
            </div>
    </div>
  );
}

export default LiveTracking; 