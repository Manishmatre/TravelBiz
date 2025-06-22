import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import Input from './Input';
import { FaMapMarkerAlt } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const libraries = ['places', 'directions'];

function LocationMap({
  label,
  value,
  onLocationSelect,
  readOnly = false,
  error = null
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value);
    if (!value) { // If no initial value, get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setMarkerPosition(currentLocation);
            if(map) map.panTo(currentLocation);
            
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: currentLocation }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                setInputValue(address);
                if (onLocationSelect) onLocationSelect({ ...currentLocation, address });
              }
            });
          },
          () => {
            console.error("Geolocation failed or was denied.");
          }
        );
      }
    }
  }, [value, onLocationSelect, map]);

  const onMapClick = useCallback((event) => {
    if (readOnly) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = { lat, lng };

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setMarkerPosition(location);
        setInputValue(address);
        if (onLocationSelect) onLocationSelect({ ...location, address });
        if (map) map.panTo(location);
      }
    });
  }, [onLocationSelect, readOnly]);

  const onAutocompleteLoad = (ac) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        const address = place.formatted_address || place.name;
        setMarkerPosition(location);
        setInputValue(address);
        if (onLocationSelect) onLocationSelect({ ...location, address });
        if (map) map.panTo(location);
      }
    }
  };

  const onMarkerDragEnd = (event) => {
    if (readOnly) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = { lat, lng };

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setMarkerPosition(location);
        setInputValue(address);
        if (onLocationSelect) onLocationSelect({ ...location, address });
      }
    });
  };

  if (loadError) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-md">Error loading maps. Please check your API key and internet connection.</div>;
  }

  return isLoaded ? (
    <div className="space-y-2">
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <Input
          label={label}
          type="text"
          placeholder={`Enter ${label}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          icon={<FaMapMarkerAlt />}
          disabled={readOnly}
          error={error}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={10}
        onLoad={setMap}
        onClick={onMapClick}
        options={{ gestureHandling: readOnly ? 'none' : 'auto' }}
      >
        {markerPosition && <Marker position={markerPosition} draggable={!readOnly} onDragEnd={onMarkerDragEnd} />}
      </GoogleMap>
    </div>
  ) : <div>Loading Map...</div>;
}

export default LocationMap; 