import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
