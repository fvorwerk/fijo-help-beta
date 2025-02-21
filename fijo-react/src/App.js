import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardV3 from './pages/DashboardV3';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard3/*" element={<DashboardV3 />} />
    </Routes>
  );
}

export default App;
