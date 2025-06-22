// This file will contain all the API calls for the admin app.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Using a placeholder login function for now
export async function loginAdmin(email, password) {
  // In a real app, you would make a POST request to your auth endpoint
  // For now, we simulate a successful login for an admin user.
  if (email && password) {
    return Promise.resolve({
      token: 'mock-admin-token-xyz',
      user: { name: 'Admin User', email, role: 'admin' },
    });
  }
  return Promise.reject(new Error('Invalid credentials'));
}

export async function getAdminDashboard(token) {
  const res = await fetch(`${API_URL}/users/admin/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch dashboard data');
  }
  return data.data; // Return the nested data object
}

export async function getBookings(token, status) {
  let url = `${API_URL}/bookings`;
  if (status && status !== 'All') {
    url += `?status=${status}`;
  }
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }
  return data;
}

export async function getUsers(token, role) {
  let url = `${API_URL}/users`;
  if (role && role !== 'All') {
    const roleMap = {
      'Drivers': 'driver',
      'Clients': 'client', 
      'Admins': 'admin'
    };
    const backendRole = roleMap[role];
    if (backendRole) {
      url += `?role=${backendRole}`;
    }
  }
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data;
}

export async function getUserProfile(token) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return data;
}

// Example function that we will implement later:
// export async function loginAdmin(email, password) {
//   const res = await fetch('YOUR_BACKEND_URL/api/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password, role: 'admin' })
//   });
//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(data.message || 'Admin login failed');
//   }
//   return data;
// } 