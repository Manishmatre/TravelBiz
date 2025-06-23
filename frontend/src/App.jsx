import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingsProvider } from './contexts/BookingsContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import AddClient from './pages/Clients/AddClient';
import Files from './pages/Other/Files';
import Users from './pages/Settings/Users';
import AddUser from './pages/Settings/AddUser';
import Vehicles from './pages/Vehicles/Vehicles';
import AddVehicle from './pages/Vehicles/AddVehicle';
import LiveTracking from './pages/Other/LiveTracking';
import ActivityLog from './pages/Dashboard/ActivityLog';
import ProfilePage from './pages/Settings/ProfilePage';
import AgencyInfoForm from './pages/Agency/AgencyInfoForm';
import AgencySelection from './pages/Agency/AgencySelection';
import AgencyProfile from './pages/Agency/AgencyProfile';
import VehicleDashboard from './pages/Dashboard/VehicleDashboard';
import VehicleMaintenance from './pages/Vehicles/VehicleMaintenance';
import VehicleFuel from './pages/Vehicles/VehicleFuel';
import VehicleDocuments from './pages/Vehicles/VehicleDocuments';
import VehicleAnalytics from './pages/Vehicles/VehicleAnalytics';
import VehicleDetail from './pages/Vehicles/VehicleDetail';
import Drivers from './pages/Drivers/Drivers';
import DriverDashboard from './pages/Dashboard/DriverDashboard';
import DriverDetail from './pages/Drivers/DriverDetail';
import Bookings from './pages/Bookings/Bookings';
import BookingList from './pages/Bookings/BookingList';
import BookingFlow from './pages/Bookings/BookingFlow';
import BookingDetail from './pages/Bookings/BookingDetail';
import './App.css'

// Newly Created Pages
import VipClients from './pages/Clients/VipClients';
import ClientAnalytics from './pages/Clients/ClientAnalytics';
import ImportClients from './pages/Clients/ImportClients';
import ExportClients from './pages/Clients/ExportClients';
import ClientCommunications from './pages/Clients/ClientCommunications';
import ClientDocuments from './pages/Clients/ClientDocuments';
import PendingBookings from './pages/Bookings/PendingBookings';
import ConfirmedBookings from './pages/Bookings/ConfirmedBookings';
import CompletedBookings from './pages/Bookings/CompletedBookings';
import CancelledBookings from './pages/Bookings/CancelledBookings';
import TodayBookings from './pages/Bookings/TodayBookings';
import UpcomingBookings from './pages/Bookings/UpcomingBookings';
import OverdueBookings from './pages/Bookings/OverdueBookings';
import BookingCalendar from './pages/Bookings/BookingCalendar';
import BookingReports from './pages/Reports/BookingReports';
import DriverContracts from './pages/Drivers/DriverContracts';
import DriverPerformance from './pages/Drivers/DriverPerformance';
import FinancialReports from './pages/Reports/FinancialReports';
import DriverReports from './pages/Drivers/DriverReports';
import FleetUsage from './pages/Dashboard/FleetUsage';
import GeneralSettings from './pages/Settings/GeneralSettings';
import RoleManagement from './pages/Settings/RoleManagement';
import { NotificationProvider, NotificationContext } from './contexts/NotificationContext';
import { socket } from './services/socket';
import { useContext, useEffect } from 'react';
import Notifications from './pages/Notifications/Notifications';
import SocketNotificationListener from './components/SocketNotificationListener';

function ProtectedRoute({ children, requireAgency = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAgency && !user.agencyId) {
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/agency-info" />;
    } else {
      return <Navigate to="/agency-selection" />;
    }
  }
  return children;
}

function App() {
  const { user, loading } = useAuth() || {};
  if (loading) return <div>Loading...</div>;
  return (
    <NotificationProvider>
      <SocketNotificationListener />
      <AuthProvider>
        <BookingsProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/agency-info" element={
                <ProtectedRoute>
                  <AgencyInfoForm />
                </ProtectedRoute>
              } />
              <Route path="/agency-selection" element={
                <ProtectedRoute>
                  <AgencySelection />
                </ProtectedRoute>
              } />
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAgency={true}>
                    <Layout>
                      {user?.role === 'driver' ? <DriverDashboard /> : <Dashboard />}
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAgency={true}>
                    <Layout>
                      {user?.role === 'driver' ? <DriverDashboard /> : <Dashboard />}
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
              <Route path="/clients/add" element={<ProtectedRoute><Layout><AddClient /></Layout></ProtectedRoute>} />
              <Route path="/clients/edit/:id" element={<ProtectedRoute><Layout><AddClient /></Layout></ProtectedRoute>} />
              <Route path="/clients/:id" element={<ProtectedRoute><Layout><ClientDetail /></Layout></ProtectedRoute>} />
              <Route path="/clients/vip" element={<ProtectedRoute><Layout><VipClients /></Layout></ProtectedRoute>} />
              <Route path="/clients/analytics" element={<ProtectedRoute><Layout><ClientAnalytics /></Layout></ProtectedRoute>} />
              <Route path="/clients/import" element={<ProtectedRoute><Layout><ImportClients /></Layout></ProtectedRoute>} />
              <Route path="/clients/export" element={<ProtectedRoute><Layout><ExportClients /></Layout></ProtectedRoute>} />
              <Route path="/clients/communications" element={<ProtectedRoute><Layout><ClientCommunications /></Layout></ProtectedRoute>} />
              <Route path="/clients/documents" element={<ProtectedRoute><Layout><ClientDocuments /></Layout></ProtectedRoute>} />
              <Route path="/files" element={<ProtectedRoute><Layout><Files /></Layout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requireAgency={true}><Layout><Users /></Layout></ProtectedRoute>} />
              <Route path="/users/add" element={<ProtectedRoute requireAgency={true}><Layout><AddUser /></Layout></ProtectedRoute>} />
              <Route path="/vehicles" element={<ProtectedRoute><Layout><Vehicles /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/add" element={<ProtectedRoute><Layout><AddVehicle /></Layout></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><Layout><LiveTracking /></Layout></ProtectedRoute>} />
              <Route path="/activity-log" element={<ProtectedRoute><Layout><ActivityLog /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
              <Route path="/agency-profile" element={<ProtectedRoute requireAgency={true}><Layout><AgencyProfile /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/dashboard" element={<ProtectedRoute><Layout><VehicleDashboard /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/maintenance" element={<ProtectedRoute><Layout><VehicleMaintenance /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/fuel" element={<ProtectedRoute><Layout><VehicleFuel /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/documents" element={<ProtectedRoute><Layout><VehicleDocuments /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/analytics" element={<ProtectedRoute><Layout><VehicleAnalytics /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/:id" element={<ProtectedRoute><Layout><VehicleDetail /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/:id/maintenance" element={<ProtectedRoute><Layout><VehicleMaintenance /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/:id/fuel" element={<ProtectedRoute><Layout><VehicleFuel /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/fleet-usage" element={<ProtectedRoute><Layout><FleetUsage /></Layout></ProtectedRoute>} />
              <Route path="/vehicles/live-tracking" element={<ProtectedRoute><Layout><LiveTracking /></Layout></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute><Layout><Drivers /></Layout></ProtectedRoute>} />
              <Route path="/drivers/add" element={<ProtectedRoute><Layout><AddUser /></Layout></ProtectedRoute>} />
              <Route path="/drivers/dashboard" element={<ProtectedRoute><Layout><DriverDashboard /></Layout></ProtectedRoute>} />
              <Route path="/drivers/contracts" element={<ProtectedRoute><Layout><DriverContracts /></Layout></ProtectedRoute>} />
              <Route path="/drivers/performance" element={<ProtectedRoute><Layout><DriverPerformance /></Layout></ProtectedRoute>} />
              <Route path="/drivers/:id" element={<ProtectedRoute><Layout><DriverDetail /></Layout></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>} />
              <Route path="/booking-list" element={<ProtectedRoute><Layout><BookingList /></Layout></ProtectedRoute>} />
              <Route path="/bookings/add" element={<ProtectedRoute><Layout><BookingFlow /></Layout></ProtectedRoute>} />
              <Route path="/bookings/pending" element={<ProtectedRoute><Layout><PendingBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/confirmed" element={<ProtectedRoute><Layout><ConfirmedBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/completed" element={<ProtectedRoute><Layout><CompletedBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/cancelled" element={<ProtectedRoute><Layout><CancelledBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/today" element={<ProtectedRoute><Layout><TodayBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/upcoming" element={<ProtectedRoute><Layout><UpcomingBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/overdue" element={<ProtectedRoute><Layout><OverdueBookings /></Layout></ProtectedRoute>} />
              <Route path="/bookings/calendar" element={<ProtectedRoute><Layout><BookingCalendar /></Layout></ProtectedRoute>} />
              <Route path="/bookings/reports" element={<ProtectedRoute><Layout><BookingReports /></Layout></ProtectedRoute>} />
              <Route path="/bookings/:id" element={<ProtectedRoute><Layout><BookingDetail /></Layout></ProtectedRoute>} />
              <Route path="/reports/financial" element={<ProtectedRoute><Layout><FinancialReports /></Layout></ProtectedRoute>} />
              <Route path="/reports/driver" element={<ProtectedRoute><Layout><DriverReports /></Layout></ProtectedRoute>} />
              <Route path="/reports/fleet" element={<ProtectedRoute><Layout><FleetUsage /></Layout></ProtectedRoute>} />
              <Route path="/settings/general" element={<ProtectedRoute><Layout><GeneralSettings /></Layout></ProtectedRoute>} />
              <Route path="/settings/roles" element={<ProtectedRoute><Layout><RoleManagement /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
            </Routes>
          </Router>
        </BookingsProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
