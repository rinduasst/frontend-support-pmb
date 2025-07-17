import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', next);
      return next;
    });
  };

  return (
  
    <div className="flex h-screen overflow-hidden bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Konten utama */}
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Isi halaman */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
