import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SDKSetup from './pages/SDKSetup';
import Settings from './pages/Settings';
import ProjectDetails from './pages/ProjectDetails';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Main Application */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="sdk" element={<SDKSetup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
          </Route>

          {/* Fallback for old routes (optional, redirect to /app) */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
