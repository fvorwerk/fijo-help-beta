import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminCertifierManagement from './pages/AdminCertifierManagement';
import AdminLocationManagement from './pages/AdminLocationManagement';
import PrivateRoute from './components/PrivateRoute';
import GenerateCertificate from './pages/GenerateCertificate';
import ManageLessons from './pages/ManageLessons';
import DashboardV2 from './pages/DashboardV2';
import Home from './pages/Home';







function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/generate" element={<GenerateCertificate />} />
      <Route path="/manage-lessons" element={<ManageLessons />} />
      <Route path="/manage-users" element={<AdminUserManagement />} />
      <Route path="/manage-certifiers" element={<AdminCertifierManagement />} />
      <Route path="/manage-locations" element={<AdminLocationManagement />} />
      <Route path="/dashboard2/*" element={<DashboardV2 />} />
      <Route path="/home" element={<Home />} />




    </Routes>
  );
}

export default App;
