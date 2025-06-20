import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Files from './pages/Files';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';
import LiveTracking from './pages/LiveTracking';
import ActivityLog from './pages/ActivityLog';
import ProfilePage from './pages/ProfilePage';
import AgencyInfoForm from './pages/AgencyInfoForm';
import AgencyProfile from './pages/AgencyProfile';
import VehicleDashboard from './pages/VehicleDashboard';
import VehicleMaintenance from './pages/VehicleMaintenance';
import VehicleFuel from './pages/VehicleFuel';
import VehicleDocuments from './pages/VehicleDocuments';
import VehicleAssignments from './pages/VehicleAssignments';
import VehicleDetail from './pages/VehicleDetail';
import Drivers from './pages/Drivers';
import DriverDashboard from './pages/DriverDashboard';
import DriverDetail from './pages/DriverDetail';
import ClientDetail from './pages/ClientDetail';
import Bookings from './pages/Bookings';
import BookingFlow from './pages/BookingFlow';
import './App.css'

function ProtectedRoute({ children, requireAgency = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAgency && !user.agencyId) return <Navigate to="/agency-info" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agency-info" element={
            <ProtectedRoute>
              <AgencyInfoForm />
            </ProtectedRoute>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute requireAgency={true}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAgency={true}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Layout>
                  <Files />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAgency={true}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <Layout>
                  <Vehicles />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <Layout>
                  <LiveTracking />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLog />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency-profile"
            element={
              <ProtectedRoute requireAgency={true}>
                <Layout>
                  <AgencyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/maintenance"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleMaintenance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/fuel"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleFuel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleDocuments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/assignments"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleAssignments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Drivers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DriverDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DriverDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClientDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bookings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-flow"
            element={
              <ProtectedRoute>
                <Layout>
                  <BookingFlow />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
