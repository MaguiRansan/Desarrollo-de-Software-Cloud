import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaBuilding, 
  FaCalendarAlt, 
  FaCog, 
  FaBars,
  FaTimes,
  FaBell,
  FaUser
} from 'react-icons/fa';
import AdminHeader from './AdminHeader';
import Notifications from './Notifications';
import { useUser } from '../../Context/UserContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Menú', href: '/admin', icon: FaHome },
    { name: 'Propiedades', href: '/admin/propiedades', icon: FaBuilding },
    { name: 'Alquiler Temporario', href: '/admin/temporarios', icon: FaCalendarAlt },
    { name: 'Configuración', href: '/admin/configuracion', icon: FaCog },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');

    if (logout) {
      logout();
    }

    setShowLogoutModal(false);
    navigate('/', { replace: true });
  };

  const isCurrentPath = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onLogoutClick={() => setShowLogoutModal(true)} />
      
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-none lg:mt-0`}>
          
          <div className="flex items-center justify-between h-20 px-4 bg-gradient-to-r from-green-600 to-green-700 sticky top-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">MK</span>
                </div>
              </div>
              <div className="ml-3">
                <h2 className="text-sm font-medium text-white">Administrador</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaUser className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Bienvenido</p>
                <p className="text-xs text-green-600 font-semibold">
                  {user?.nombre && user?.apellido 
                    ? `${user.nombre} ${user.apellido}` 
                    : user?.name || 'Administrador'
                  }
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-2 px-2 space-y-1">
            {navigation.map((item) => {
              const current = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    current
                      ? 'bg-green-100 text-green-900 border-r-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`${
                      current ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 py-2 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaBars size={20} />
              </button>
              <h1 className="text-lg font-medium text-gray-900">Panel Administrativo</h1>
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-gray-900">
                  <FaBell size={18} />
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-slate-800">¿Seguro que quieres cerrar sesión?</h3>
            <div className="mt-4 flex justify-between gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Notifications />
    </div>
  );
};

export default AdminLayout;