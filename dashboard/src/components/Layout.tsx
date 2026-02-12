import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AuthButton from './AuthButton';

export default function Layout() {
  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header with Auth Button */}
        <div 
          className="sticky top-0 z-10 px-10 py-4 border-b"
          style={{
            backgroundColor: '#f5f5f0',
            borderColor: '#e5e7eb'
          }}
        >
          <div className="flex justify-end">
            <AuthButton />
          </div>
        </div>
        
        <div className="min-h-full p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
