import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { Menu, X, User } from 'lucide-react';
import { useUser } from '../../../Context/UserContext';
import logo from "../../../logo/logo.png";

const Header = () => {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuLinks, setMenuLinks] = useState([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getUserRole = () => {
    if (!user) return 'guest';
    
    switch (user.idrol) {
      case 1:
      case 2:
      case 4:  
        return 'cliente';
      case 3:
        return 'admin';
      default:
        return 'guest';
    }
  };

  useEffect(() => {
    const userRole = getUserRole();
    const links = getMenuLinks(userRole);
    setMenuLinks(links);
  }, [user]);

  const getMenuLinks = (role) => {
    switch (role) {
      case 'cliente':
        return [
          { to: "/cliente/iniciocliente", text: "Inicio" },
          { to: "/cliente/propiedades", text: "Propiedades" },
          { to: "/cliente/misdatos", text: "Mis datos" },
        ];
      case 'admin':
        return [
          { to: "/admin/propiedades", text: "Propiedades" },
          { to: "/admin/alquilerTemporarios", text: "Alquileres Temporarios" },
          { to: "/admin/clientes", text: "Clientes" },
        ];
      default:
        return [
          { to: "/", text: "Inicio" },
          { to: "/venta", text: "Venta" },
          { to: "/alquiler", text: "Alquiler" },
          { to: "/alquilerTemporario", text: "Alquiler Temporario" },
          { to: "/tasaciones", text: "Tasaciones" },
          { to: "/contacto", text: "Contacto" },
        ];
    }
  };

  return (
    <nav className="bg-white shadow-md py-6">
      <div className="max-w-full w-full px-20 mx-auto">
        <div className="flex items-center">
          <div className="flex-none md:mr-8 flex-1 md:flex-none flex justify-center md:justify-start">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-14 md:h-24 cursor-pointer" />
            </Link>
          </div>
          
          <div className="md:hidden absolute left-4">
            <button onClick={toggleMenu} className="text-gray-700">
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
          
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex space-x-8">
              {menuLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="text-gray-700 hover:text-blue-600 font-medium text-xl"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block flex-none ml-8">
            {user ? (
              <Link to="/perfil" className="text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-md border border-blue-600 px-5 py-3 text-xl">
                Perfil
              </Link>
            ) : (
              <Link to="/iniciarsesion" className="text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-md border border-blue-600 px-5 py-3 text-xl">
                Iniciar Sesión
              </Link>
            )}
          </div>
          
          <div className="md:hidden absolute right-4">
            <Link to={user ? "/perfil" : "/iniciarsesion"} className="text-gray-700 hover:text-blue-600">
              <User className="h-8 w-8" />
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <div className="px-4 pt-4 pb-4 space-y-1">
            <div className="flex flex-col items-center space-y-4 mt-4">
              {menuLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium text-xl"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;