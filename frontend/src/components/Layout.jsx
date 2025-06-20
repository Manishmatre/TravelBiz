import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './common/Header';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar for desktop */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 h-screen z-40 w-64">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
      {/* Main content area with left margin for sidebar */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen ml-0 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-screen">{children}</main>
      </div>
      {/* Overlay background for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      {/* Sidebar as overlay on mobile */}
      <div className="md:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}

export default Layout;