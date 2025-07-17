import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaListAlt,
  FaUsers,
  FaSignOutAlt,
  FaListUl,
  FaChevronRight,
} from 'react-icons/fa';

const Sidebar = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMasterData, setOpenMasterData] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/kategori-kendala')) {
      setOpenMasterData(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };
  const subLinkClass = ({ isActive }) =>
  (isActive ? 'text-blue-600 font-semibold' : 'text-black') +
  ' flex items-center gap-2 px-4 py-1 rounded hover:bg-gray-100 transition-all duration-200';

  const linkClass = ({ isActive }) =>
    (isActive
      ? 'bg-gray-200 text-black font-medium'
      : 'text-black hover:bg-gray-100') +
    ' flex items-center gap-2 px-4 py-2 rounded transition-all duration-200';

  return (
    <aside className={`bg-white shadow-md ${isCollapsed ? 'w-20' : 'w-60'} flex-shrink-0`} 
>
      {/* Logo */}
      <div className="pt-6 mb-6 text-center">
        <img
          src={isCollapsed ? '/logouika.png' : '/uika.png'}
          alt="UIKA Logo"
          className={`mx-auto ${isCollapsed ? 'h-10' : 'h-12'} transition-all duration-300`}
        />
      </div>

      {/* Menu */}
      <ul className="space-y-2 px-2">
        <li>
          <NavLink to="/" end className={linkClass}>
            <FaTachometerAlt />
            {!isCollapsed && 'Dashboard'}
          </NavLink>
        </li>

        <li>
          <NavLink to="/kendala" className={linkClass}>
            <FaListAlt />
            {!isCollapsed && 'Daftar Kendala'}
          </NavLink>
        </li>

        <li>
          <NavLink to="/pengguna" className={linkClass}>
            <FaUsers />
            {!isCollapsed && 'Pengguna'}
          </NavLink>
        </li>

        {/* Master Data */}
        <li>
          <button
            onClick={() => setOpenMasterData(!openMasterData)}
            className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-black transition-all duration-200"
          >
            <FaListUl />
            {!isCollapsed && <span>Master Data</span>}
          </button>

          {!isCollapsed && openMasterData && (
            <ul className="ml-8 mt-1 space-y-1 text-sm">
              <li>
                <NavLink to="/kategori-kendala" className={subLinkClass}>
            <FaChevronRight />
            {!isCollapsed && 'Kategori Kendala'}
          </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-black hover:bg-gray-100 rounded w-full transition-all duration-200"
          >
            <FaSignOutAlt />
            {!isCollapsed && 'Logout'}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
