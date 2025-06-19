import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

export default Layout; 