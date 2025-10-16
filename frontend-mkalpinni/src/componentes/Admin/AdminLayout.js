import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  FaHome, 
  FaBuilding, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaUser,
  FaMoneyBillWave
} from 'react-icons/fa';
import Header from '../inicio/Componentes/Header';
import Notifications from './Notifications';

const AdminLayout = ({ children, user = { name: 'Marcelo' } }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Propiedades', href: '/admin/propiedades', icon: FaBuilding },
    { name: 'Clientes', href: '/admin/clientes', icon: FaUsers },
    { name: 'Alquiler Temporario', href: '/admin/temporarios', icon: FaCalendarAlt },
    { name: 'Pagos', href: '/admin/pagos', icon: FaMoneyBillWave },
    { name: 'Reportes', href: '/admin/reportes', icon: FaChartBar },
    { name: 'Configuración', href: '/admin/configuracion', icon: FaCog },
  ];

  const isCurrentPath = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-none`}>
          
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">MK</span>
                </div>
              </div>
              <div className="ml-3">
                <h2 className="text-sm font-medium text-white">Panel Admin</h2>
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
                <p className="text-xs text-green-600 font-semibold">{user.name}</p>
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

          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <FaSignOutAlt className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400" />
              Cerrar Sesión
            </button>
          </div>
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
      <Notifications />
    </div>
  );
};

export default AdminLayout;