import React, { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [namaPetugas, setNamaPetugas] = useState('User');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setNamaPetugas(parsedUser.nama_pengguna || 'User');
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setCurrentTime(now.toLocaleString('id-ID', options));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
 
      <div className="w-full bg-white shadow-md px-8 py-4 flex justify-between items-center border-b sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-gray-700 hover:text-gray-900 text-2xl">
            <FaBars />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Selamat Datang, {namaPetugas}</h1>
            <p className="text-gray-600 text-sm">Support PMB</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">{currentTime}</div>
      </div>
    );
  };

export default Header;
