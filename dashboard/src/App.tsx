import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SDKSetup from './pages/SDKSetup';
import Settings from './pages/Settings';
import ProjectDetails from './pages/ProjectDetails';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="sdk" element={<SDKSetup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="project/:projectId" element={<ProjectDetails />} />
            <Route path="project/:projectId" element={<ProjectDetails />} />
            <Route path="dashboard" element={<Dashboard />} /> {/* Alias for / */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
