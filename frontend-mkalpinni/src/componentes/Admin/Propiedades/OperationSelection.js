import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';

const OperationSelection = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Seleccione el tipo de operación</h2>
      <div className="flex space-x-4">
        <button
          onClick={() => onSelect('venta')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <span>Ver Propiedades en Venta</span>
        </button>
        <button
          onClick={() => onSelect('alquiler')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
        >
          <span>Ver Propiedades en Alquiler</span>
        </button>
      </div>
    </div>
  );
};

export default OperationSelection;