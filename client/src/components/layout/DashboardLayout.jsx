import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => (
  <div className="min-h-screen flex flex-col bg-surface-2">
    <Topbar />
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
