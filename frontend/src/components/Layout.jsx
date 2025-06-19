import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './common/Header';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop, overlay for mobile */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
      {/* Overlay background for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}

export default Layout;