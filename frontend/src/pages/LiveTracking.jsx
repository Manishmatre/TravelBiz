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
import { getAgents } from '../services/userService';
import { getClients } from '../services/clientService';

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
  const [sidebarTab, setSidebarTab] = useState('vehicles'); // 'vehicles' | 'agents' | 'clients'
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

  // Helper to render clustered markers with animated icon
  const renderClusteredMarkers = (clusterer) =>
    locations.map(loc => {
      const vehicle = getVehicleInfo(loc.vehicleId);
      const online = isOnline(loc.updatedAt);
      // Choose color based on status and online
      let color = '#ef4444'; // default red
      if (online) color = loc.status === 'moving' ? '#22c55e' : '#f59e42'; // green for moving, orange for stopped
      if (!online) color = '#6b7280'; // gray for offline
      return (
        <Marker
          key={loc.vehicleId}
          position={{ lat: loc.latitude, lng: loc.longitude }}
          label={vehicle.name || loc.vehicleId}
          icon={{
            url: `data:image/svg+xml;utf8,${encodeURIComponent(
              renderToStaticMarkup(<PulsingMarker color={color} size={32} />)
            )}`,
            scaledSize: { width: 32, height: 32 },
          }}
          clusterer={clusterer}
          onClick={() => setSelectedMarker({ type: 'live', vehicleId: loc.vehicleId })}
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
        <div className="flex gap-2 mb-4">
          <button className={`flex-1 px-3 py-1 rounded-t-lg font-bold transition ${sidebarTab === 'vehicles' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`} onClick={() => setSidebarTab('vehicles')}>Vehicles <span className="ml-1 text-xs">({vehicles.length})</span></button>
          <button className={`flex-1 px-3 py-1 rounded-t-lg font-bold transition ${sidebarTab === 'agents' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-orange-50'}`} onClick={() => setSidebarTab('agents')}>Agents <span className="ml-1 text-xs">({agents.length})</span></button>
          <button className={`flex-1 px-3 py-1 rounded-t-lg font-bold transition ${sidebarTab === 'clients' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`} onClick={() => setSidebarTab('clients')}>Clients <span className="ml-1 text-xs">({clients.length})</span></button>
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
                    <li key={v._id} className="flex items-center justify-between py-3 px-2 rounded transition hover:bg-blue-50 group">
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
                        onClick={() => {
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
                  className="w-full text-left py-3 px-2 flex items-center gap-3 rounded transition hover:bg-orange-50 group focus:outline-none"
                  // onClick={() => { /* TODO: Focus agent on map or open modal */ }}
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
                  className="w-full text-left py-3 px-2 flex items-center gap-3 rounded transition hover:bg-green-100 group focus:outline-none"
                  // onClick={() => { /* TODO: Focus client on map or open modal */ }}
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
        </div>
      </aside>
      {/* Main content area */}
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
          {/* Compact Route Playback Card */}
          <div className="bg-white/90 border border-gray-100 rounded-lg shadow px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="text-base font-semibold flex items-center gap-2 text-blue-700 mb-2 md:mb-0"><FaCarSide className="text-blue-400" /> Route Playback</h2>
            <div className="flex flex-col md:flex-row gap-2 flex-1">
              <select
                className="border-none rounded-md px-2 py-1 bg-gray-100 focus:ring-2 focus:ring-blue-400 text-sm min-w-[140px]"
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.name || v._id}</option>
                ))}
              </select>
              <select
                className="border-none rounded-md px-2 py-1 bg-gray-100 focus:ring-2 focus:ring-blue-400 text-sm min-w-[140px]"
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
              >
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="custom">Custom</option>
              </select>
              {timeRange === 'custom' && (
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    className="border-none rounded-md px-2 py-1 bg-gray-100 focus:ring-2 focus:ring-blue-400 text-sm"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    placeholder="From"
                  />
                  <input
                    type="datetime-local"
                    className="border-none rounded-md px-2 py-1 bg-gray-100 focus:ring-2 focus:ring-blue-400 text-sm"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    placeholder="To"
                  />
                </div>
              )}
            </div>
            {/* Playback animation controls */}
            {history.length > 1 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    className={`px-3 py-1 rounded bg-blue-600 text-white font-semibold ${isPlaying ? 'opacity-60' : ''}`}
                    onClick={() => setIsPlaying(p => !p)}
                    disabled={history.length < 2}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold"
                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                  >
                    &#8592;
                  </button>
                  <span className="text-sm font-mono">{currentStep + 1} / {history.length}</span>
                  <button
                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold"
                    onClick={() => setCurrentStep(s => Math.min(history.length - 1, s + 1))}
                    disabled={currentStep === history.length - 1}
                  >
                    &#8594;
                  </button>
                </div>
                {/* Playback timeline slider */}
                <div className="flex flex-col gap-1 mb-2">
                  <input
                    type="range"
                    min={0}
                    max={history.length - 1}
                    value={currentStep}
                    onChange={e => setCurrentStep(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 rounded-lg appearance-none bg-blue-100"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(history[0]?.updatedAt)}</span>
                    <span>{formatTime(history[history.length - 1]?.updatedAt)}</span>
                  </div>
                  <div className="text-xs text-blue-700 font-semibold text-center">
                    {formatTime(history[currentStep]?.updatedAt)}
                  </div>
                </div>
              </>
            )}
            {historyLoading ? (
              <div className="text-blue-600">Loading route...</div>
            ) : history.length === 0 && selectedVehicle ? (
              <div className="text-gray-500">No route data for selected vehicle/time.</div>
            ) : null}
          </div>
        </div>
        {/* Map Card */}
        <div className="bg-white/90 border border-gray-100 rounded-2xl shadow-lg p-0 md:p-2 flex-1 min-h-[400px] max-h-[70vh] overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={userLocation || center}
              zoom={12}
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
              {/* Clustered live markers */}
              <MarkerClusterer>
                {(clusterer) => renderClusteredMarkers(clusterer)}
              </MarkerClusterer>
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
              {history.length > 1 && (
                <Polyline
                  path={history.map(h => ({ lat: h.latitude, lng: h.longitude }))}
                  options={{ strokeColor: '#007bff', strokeWeight: 4, strokeOpacity: 0.7 }}
                />
              )}
              {/* Animated playback marker */}
              {history.length > 1 && (
                <Marker
                  position={{ lat: history[currentStep].latitude, lng: history[currentStep].longitude }}
                  label="▶"
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' }}
                  onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicle, idx: currentStep })}
                />
              )}
              {/* Start/end markers for playback */}
              {history.length > 0 && (
                <Marker
                  position={{ lat: history[0].latitude, lng: history[0].longitude }}
                  label="Start"
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                  onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicle, idx: 0 })}
                />
              )}
              {history.length > 1 && (
                <Marker
                  position={{ lat: history[history.length - 1].latitude, lng: history[history.length - 1].longitude }}
                  label="End"
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }}
                  onClick={() => setSelectedMarker({ type: 'history', vehicleId: selectedVehicle, idx: history.length - 1 })}
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
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">Loading map...</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LiveTracking; 