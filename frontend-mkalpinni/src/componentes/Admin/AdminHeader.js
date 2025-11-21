import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../../Context/UserContext';
import logo from "../../logo/logo.png";

const AdminHeader = ({ onLogoutClick }) => {
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="max-w-full w-full px-8 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-center">
            <Link to="/admin">
              <img src={logo} alt="Logo" className="h-12 md:h-16 cursor-pointer" />
            </Link>
          </div>

          <div className="flex-none relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:shadow-lg transition-shadow duration-200"
              title="Menú de usuario"
            >
              {user?.fotoRuta ? (
                <img 
                  src={user.fotoRuta} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                  <FaUser className="text-white" size={20} />
                </div>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Bienvenido</p>
                  <p className="text-xs text-gray-600">{user?.name || 'Administrador'}</p>
                </div>
                <Link
                  to="/perfil"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUser className="mr-2" size={16} />
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogoutClick();
                  }}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-t border-gray-200"
                >
                  <FaSignOutAlt className="mr-2" size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
