export async function loginDriver(email, password) {
  const res = await fetch('http://192.168.67.77:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}

// Fetch assigned vehicle for the logged-in driver
export async function getAssignedVehicle(token) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vehicles/assigned`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch assigned vehicle');
  return res.json();
}

// Fetch today's or active trips for the driver
export async function getDriverTrips(token) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookings/driver/today`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

// Fetch all trips for the driver
export async function getAllDriverTrips(token) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookings/driver`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch all trips');
  return res.json();
}

// Start a trip
export async function startTrip(token, tripId) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookings/${tripId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to start trip');
  return res.json();
}

// Complete a trip
export async function completeTrip(token, tripId) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookings/${tripId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to complete trip');
  return res.json();
}

// Cancel a trip
export async function cancelTrip(token, tripId) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookings/${tripId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to cancel trip');
  return res.json();
}

// Fetch driver profile
export async function getProfile(token) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// Update driver profile
export async function updateProfile(token, profile) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

// Change password
export async function changePassword(token, oldPassword, newPassword) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) throw new Error('Failed to change password');
  return res.json();
} 