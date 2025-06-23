import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer, Polyline, InfoWindow } from '@react-google-maps/api';
import { getVehicles } from '../../services/vehicleService';
import { getBookings } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import StatCard from '../../components/common/StatCard';
import { FaSyncAlt, FaCar, FaRoute, FaClock, FaCheckCircle, FaTools, FaExpand, FaCompress, FaTimes, FaMapMarkerAlt, FaHistory, FaPlay, FaPause, FaLocationArrow, FaCompass, FaSatellite, FaStreetView, FaLayerGroup, FaInfoCircle, FaDownload, FaFilter, FaSearch, FaEye, FaEyeSlash, FaBars, FaTimes as FaTimesIcon, FaChartLine, FaGlobe, FaTachometerAlt, FaChartBar, FaChartPie, FaExclamationTriangle } from 'react-icons/fa';
import { getUsers } from '../../services/userService';
import { getClients } from '../../services/clientService';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import Loader from '../../components/common/Loader';
import Notification from '../../components/common/Notification';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 350px)',
};

const MAP_STYLES = [
  { label: 'Default', value: 'roadmap', mapTypeId: 'roadmap', styles: null },
  { label: 'Dark', value: 'dark', mapTypeId: 'roadmap', styles: [ { elementType: 'geometry', stylers: [{ color: '#212121' }] }, { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }, { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] }, { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] }, { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] }, { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] }, { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] }, { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }, ] },
  { label: 'Satellite', value: 'satellite', mapTypeId: 'satellite', styles: null },
  { label: 'Terrain', value: 'terrain', mapTypeId: 'terrain', styles: null },
];

function LiveTracking() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0]);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
  const [mapZoom, setMapZoom] = useState(12);
  const [stats, setStats] = useState({ totalVehicles: 0, onlineVehicles: 0 });
  const [bookings, setBookings] = useState([]);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [locationHistory, setLocationHistory] = useState({});
  const [showRoutes, setShowRoutes] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSpeedLimit, setShowSpeedLimit] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    speed: 'all'
  });
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoWindowData, setInfoWindowData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vehs, drvs, clts, bks] = await Promise.all([
        getVehicles(token),
        getUsers({ role: 'driver' }, token),
        getClients(token),
        getBookings(null, token)
      ]);

      setVehicles(vehs);
      setDrivers(drvs);
      setClients(clts);
      setBookings(bks);
      
      const isEntityOnline = (entity) => entity.lastUpdated && (new Date() - new Date(entity.lastUpdated)) < 300000;
      setStats({
        totalVehicles: vehs.length,
        onlineVehicles: vehs.filter(isEntityOnline).length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;
    
    const updateEntityLocation = (updater, locationData) => {
        updater(prev => prev.map(e => {
          if (e._id === locationData.entityId) {
            const history = locationHistory[e._id] || [];
            const newLocation = {
              ...locationData.location,
              timestamp: new Date(),
              speed: locationData.speed || 0
            };
            
            setLocationHistory(prev => ({
              ...prev,
              [e._id]: [...history.slice(-50), newLocation]
            }));
            
            return { ...e, location: locationData.location, speed: locationData.speed };
          }
          return e;
        }));
    };

    socket.on('locationUpdate', (location) => updateEntityLocation(setVehicles, location));
    socket.on('driverLocationUpdate', (location) => updateEntityLocation(setDrivers, location));
    socket.on('clientLocationUpdate', (location) => updateEntityLocation(setClients, location));
    
    return () => socket.disconnect();
  }, [token, locationHistory]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => fetchData();
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const getFilteredEntities = () => {
    let list;
    switch (activeTab) {
      case 'vehicles': list = vehicles; break;
      case 'drivers': list = drivers; break;
      case 'clients': list = clients; break;
      default: list = [];
    }
    
    let filtered = list;
    
    if (searchTerm) {
      filtered = filtered.filter(e =>
        (e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.numberPlate && e.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(e => e.status === selectedFilters.status);
    }
    
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(e => e.type === selectedFilters.type);
    }
    
    if (selectedFilters.speed !== 'all') {
      filtered = filtered.filter(e => {
        const speed = e.speed || 0;
        switch (selectedFilters.speed) {
          case 'slow': return speed < 30;
          case 'normal': return speed >= 30 && speed < 80;
          case 'fast': return speed >= 80;
          default: return true;
        }
      });
    }
    
    return filtered;
  };

  const handleEntityClick = (entity, type) => {
    setSelectedEntity({ ...entity, type });
    if (entity.location) {
      setMapCenter(entity.location);
      setMapZoom(15);
    }
    
    setInfoWindowData({
      entity,
      type,
      location: entity.location
    });
    setShowInfoWindow(true);
  };

  const renderEntityList = () => {
    const entities = getFilteredEntities();
    return entities.map(entity => (
      <div key={entity._id} className={`p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50 ${selectedEntity?._id === entity._id ? 'bg-blue-100' : ''}`} onClick={() => handleEntityClick(entity, activeTab.slice(0, -1))}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{entity.name || `${entity.make} ${entity.model}`}</p>
            <p className="text-sm text-gray-500">{entity.numberPlate || entity.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {entity.speed && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                entity.speed < 30 ? 'bg-green-100 text-green-800' :
                entity.speed < 80 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {entity.speed} km/h
              </span>
            )}
            {entity.status && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                entity.status === 'available' || entity.status === 'active' ? 'bg-green-100 text-green-800' :
                entity.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {entity.status}
              </span>
            )}
          </div>
        </div>
      </div>
    ));
  };

  const renderLocationHistory = (entityId) => {
    const history = locationHistory[entityId] || [];
    if (history.length < 2) return null;
    
    const path = history.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));
    
    return (
      <Polyline
        path={path}
        options={{
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          geodesic: true
        }}
      />
    );
  };

  const renderEntityMarkers = (clusterer) => {
    const getEntityType = (entity) => {
        if (entity.numberPlate) return 'vehicle';
        if (entity.licenseNumber) return 'driver';
        return 'client';
    }
    const allEntities = [...vehicles, ...drivers, ...clients];

    return allEntities
        .filter(entity => entity.location)
        .map(entity => (
            <Marker 
                key={entity._id} 
                position={entity.location} 
                onClick={() => handleEntityClick(entity, getEntityType(entity))}
                clusterer={clusterer}
                icon={{
                  url: getEntityType(entity) === 'vehicle' ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' :
                        getEntityType(entity) === 'driver' ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' :
                        'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new window.google.maps.Size(30, 30)
                }}
            />
        ));
  };

  const exportLocationData = () => {
    const data = {
      vehicles: vehicles.map(v => ({
        id: v._id,
        name: v.name,
        numberPlate: v.numberPlate,
        location: v.location,
        speed: v.speed,
        status: v.status,
        history: locationHistory[v._id] || []
      })),
      drivers: drivers.map(d => ({
        id: d._id,
        name: d.name,
        email: d.email,
        location: d.location,
        status: d.status,
        history: locationHistory[d._id] || []
      })),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded || loading) {
    return <div className="flex items-center justify-center h-[600px]"><Loader /><p className="ml-4 text-lg text-gray-600">Loading Live Tracking Map...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <FaTimesIcon /> : <FaBars />}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Live Vehicle Tracking</h1>
            <p className="text-gray-500">Real-time location tracking of your fleet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button color="secondary" onClick={handleRefresh} loading={loading}><FaSyncAlt /> Refresh</Button>
          <Button color="secondary" onClick={() => setShowAnalytics(true)}><FaChartLine /> Analytics</Button>
          <Button color="secondary" onClick={exportLocationData}><FaDownload /> Export</Button>
          <Button color="secondary" onClick={toggleFullscreen}>{isFullscreen ? <FaCompress/> : <FaExpand/>} {isFullscreen ? 'Exit' : 'Full'}</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={<FaCar />} />
        <StatCard title="Online" value={stats.onlineVehicles} icon={<FaCheckCircle className="text-green-500" />} />
        <StatCard title="On Trip" value={bookings.filter(b => b.status === 'Confirmed').length} icon={<FaRoute />} />
        <StatCard title="Available" value={vehicles.filter(v => v.status === 'available').length} icon={<FaCheckCircle />} />
        <StatCard title="Maintenance" value={vehicles.filter(v => v.status === 'maintenance').length} icon={<FaTools />} />
        <StatCard title="Active Bookings" value={bookings.filter(b => b.status === 'Confirmed').length} icon={<FaClock />} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6" style={{ height: containerStyle.height }}>
        {sidebarOpen && (
          <div className="lg:w-1/3 bg-white rounded-xl shadow-md flex flex-col">
            <div className="flex border-b p-1">
              <button onClick={() => setActiveTab('vehicles')} className={`flex-1 p-3 text-sm font-semibold rounded-t-lg ${activeTab === 'vehicles' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Vehicles</button>
              <button onClick={() => setActiveTab('drivers')} className={`flex-1 p-3 text-sm font-semibold rounded-t-lg ${activeTab === 'drivers' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Drivers</button>
              <button onClick={() => setActiveTab('clients')} className={`flex-1 p-3 text-sm font-semibold rounded-t-lg ${activeTab === 'clients' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Clients</button>
            </div>
            <div className="p-2 space-y-2">
              <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md" />
              
              <div className="flex gap-2">
                <select 
                  value={selectedFilters.status} 
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex-1 p-2 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                
                <select 
                  value={selectedFilters.speed} 
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, speed: e.target.value }))}
                  className="flex-1 p-2 border rounded-md text-sm"
                >
                  <option value="all">All Speed</option>
                  <option value="slow">Slow (&lt;30 km/h)</option>
                  <option value="normal">Normal (30-80 km/h)</option>
                  <option value="fast">Fast (&gt;80 km/h)</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{renderEntityList()}</div>
          </div>
        )}
        
        <div className={`relative rounded-xl shadow-md overflow-hidden ${sidebarOpen ? 'lg:flex-1' : 'flex-1'}`}>
          <GoogleMap 
            mapContainerStyle={{ width: '100%', height: '100%' }} 
            center={mapCenter} 
            zoom={mapZoom} 
            options={{ 
              styles: mapStyle.styles, 
              mapTypeControl: false, 
              streetViewControl: false, 
              fullscreenControl: false,
              trafficLayer: showTraffic
            }} 
            onLoad={map => (mapRef.current = map)}
          >
            <MarkerClusterer>{(clusterer) => renderEntityMarkers(clusterer)}</MarkerClusterer>
            
            {showHistory && selectedEntity && locationHistory[selectedEntity._id] && 
              renderLocationHistory(selectedEntity._id)
            }
            
            {showInfoWindow && infoWindowData && infoWindowData.location &&
              typeof infoWindowData.location.lat === 'number' &&
              typeof infoWindowData.location.lng === 'number' && (
              <InfoWindow
                position={infoWindowData.location}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="p-2">
                  <h3 className="font-semibold">{infoWindowData.entity.name}</h3>
                  <p className="text-sm text-gray-600">{infoWindowData.entity.numberPlate || infoWindowData.entity.email}</p>
                  {infoWindowData.entity.speed && (
                    <p className="text-sm text-gray-600">Speed: {infoWindowData.entity.speed} km/h</p>
                  )}
                  <p className="text-sm text-gray-600">Status: {infoWindowData.entity.status}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          
          <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg flex items-center gap-2">
             <Dropdown options={MAP_STYLES.map(s => ({label: s.label, value: s.value}))} value={mapStyle.value} onChange={e => setMapStyle(MAP_STYLES.find(s => s.value === e.target.value))} />
             <Button color="secondary" onClick={() => setShowTraffic(!showTraffic)} active={showTraffic}><FaLayerGroup /> Traffic</Button>
             <Button color="secondary" onClick={() => setShowHistory(!showHistory)} active={showHistory}><FaHistory /> History</Button>
             <Button color="secondary" onClick={() => setShowRoutes(!showRoutes)} active={showRoutes}><FaRoute /> Routes</Button>
             <Button color="secondary" onClick={() => setShowSpeedLimit(!showSpeedLimit)} active={showSpeedLimit}><FaCompass /> Speed</Button>
          </div>
          
          {selectedEntity && (
            <div className="absolute top-4 right-4 z-10 w-96 bg-white rounded-lg shadow-xl border">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedEntity.type === 'vehicle' ? 'Vehicle Details' : 
                   selectedEntity.type === 'driver' ? 'Driver Details' : 'Client Details'}
                </h3>
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{selectedEntity.name || `${selectedEntity.make} ${selectedEntity.model}` || 'N/A'}</p>
                  </div>
                  
                  {selectedEntity.numberPlate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Number Plate</p>
                      <p className="text-gray-900">{selectedEntity.numberPlate}</p>
                    </div>
                  )}
                  
                  {selectedEntity.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedEntity.email}</p>
                    </div>
                  )}
                  
                  {selectedEntity.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedEntity.phone}</p>
                    </div>
                  )}
                  
                  {selectedEntity.status && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEntity.status === 'available' || selectedEntity.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedEntity.status === 'maintenance' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEntity.status}
                      </span>
                    </div>
                  )}
                  
                  {selectedEntity.speed && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Speed</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEntity.speed < 30 ? 'bg-green-100 text-green-800' :
                        selectedEntity.speed < 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEntity.speed} km/h
                      </span>
                    </div>
                  )}
                  
                  {selectedEntity.location && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900 text-sm">
                        Lat: {selectedEntity.location.lat.toFixed(6)}, Lng: {selectedEntity.location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                  
                  {selectedEntity.type === 'vehicle' && selectedEntity.assignedDriver && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned Driver</p>
                      <p className="text-gray-900">{selectedEntity.assignedDriver.name || 'N/A'}</p>
                    </div>
                  )}
                  
                  {locationHistory[selectedEntity._id] && locationHistory[selectedEntity._id].length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location History</p>
                      <p className="text-gray-900 text-sm">
                        {locationHistory[selectedEntity._id].length} points tracked
                      </p>
                      <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        {showHistory ? 'Hide' : 'Show'} route on map
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Location Analytics</h2>
                <button 
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Simple Analytics Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Entities</p>
                      <p className="text-2xl font-bold">{vehicles.length + drivers.length + clients.length}</p>
                    </div>
                    <FaGlobe className="text-2xl opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Online</p>
                      <p className="text-2xl font-bold">
                        {[...vehicles, ...drivers, ...clients].filter(e => 
                          e.lastUpdated && (new Date() - new Date(e.lastUpdated)) < 300000
                        ).length}
                      </p>
                    </div>
                    <FaCheckCircle className="text-2xl opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Avg Speed</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const speeds = [...vehicles, ...drivers, ...clients]
                            .filter(e => e.speed && e.speed > 0)
                            .map(e => e.speed);
                          return speeds.length > 0 ? Math.round(speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length) : 0;
                        })()} km/h
                      </p>
                    </div>
                    <FaTachometerAlt className="text-2xl opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Routes</p>
                      <p className="text-2xl font-bold">{Object.keys(locationHistory).length}</p>
                    </div>
                    <FaRoute className="text-2xl opacity-80" />
                  </div>
                </div>
              </div>
              
              {/* Speed Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaChartBar className="text-blue-600" />
                    Speed Distribution
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const allEntities = [...vehicles, ...drivers, ...clients];
                      const speeds = allEntities.filter(e => e.speed && e.speed > 0).map(e => e.speed);
                      const slow = speeds.filter(s => s < 30).length;
                      const normal = speeds.filter(s => s >= 30 && s < 80).length;
                      const fast = speeds.filter(s => s >= 80).length;
                      const total = allEntities.length;
                      
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Slow (&lt;30 km/h)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${total > 0 ? (slow / total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{slow}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Normal (30-80 km/h)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full" 
                                  style={{ width: `${total > 0 ? (normal / total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{normal}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Fast (&gt;80 km/h)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{ width: `${total > 0 ? (fast / total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{fast}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaChartPie className="text-green-600" />
                    Status Distribution
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const allEntities = [...vehicles, ...drivers, ...clients];
                      const statuses = {};
                      allEntities.forEach(e => {
                        const status = e.status || 'unknown';
                        statuses[status] = (statuses[status] || 0) + 1;
                      });
                      
                      return Object.entries(statuses).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  status === 'available' || status === 'active' ? 'bg-green-500' :
                                  status === 'maintenance' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${(count / allEntities.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Alerts */}
              {(() => {
                const alerts = [];
                [...vehicles, ...drivers, ...clients].forEach(entity => {
                  if (entity.speed && entity.speed > 100) {
                    alerts.push({
                      type: 'speed',
                      entity: entity,
                      message: `${entity.name || entity.numberPlate} is traveling at ${entity.speed} km/h`,
                      severity: 'high'
                    });
                  }
                  
                  if (entity.status === 'maintenance') {
                    alerts.push({
                      type: 'maintenance',
                      entity: entity,
                      message: `${entity.name || entity.numberPlate} is under maintenance`,
                      severity: 'medium'
                    });
                  }
                });
                
                return alerts.length > 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-800">
                      <FaExclamationTriangle />
                      Active Alerts
                    </h3>
                    <div className="space-y-2">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                              <p className="text-xs text-gray-500">{alert.entity.name || alert.entity.numberPlate}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTracking;