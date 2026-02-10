import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route 
            path="analytics" 
            element={
              <div className="text-lg font-medium" style={{ color: '#1a1512' }}>
                Analytics (Coming Soon)
              </div>
            } 
          />
          <Route 
            path="sdk" 
            element={
              <div className="text-lg font-medium" style={{ color: '#1a1512' }}>
                SDK Setup (Coming Soon)
              </div>
            } 
          />
          <Route 
            path="settings" 
            element={
              <div className="text-lg font-medium" style={{ color: '#1a1512' }}>
                Settings (Coming Soon)
              </div>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
