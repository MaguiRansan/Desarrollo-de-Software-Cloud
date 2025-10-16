import React from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";

const Inquilino = () => {
  const datosCargados = localStorage.getItem("datosCargados");
  const nombreUsuario = localStorage.getItem("nombreUsuario") || "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white">
      {datosCargados ? (
        <>
          <h1 className="text-5xl font-bold mb-4">Bienvenido a Mkalpin, {nombreUsuario}</h1>
          <Link to="/cliente/iniciocliente" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition duration-300">
            Ir al inicio
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-5xl font-bold mb-4">¡Bienvenido!</h1>
          <p className="text-xl mb-8">Por favor, ingrese aquí para cargar sus datos.</p>
          <Link to="/cliente/formulario" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition duration-300">
            Ingresar
          </Link>
        </>
      )}
    </div>
  );
};

export default Inquilino;
