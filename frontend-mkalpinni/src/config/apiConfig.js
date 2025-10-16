import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tu-dominio-produccion.com/API' // URL de tu API en producción
    : 'http://localhost:5228/API';            // URL de tu API en desarrollo

const API_STATIC_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tu-dominio-produccion.com' // URL base de producción
    : 'http://localhost:5228';            // URL base de desarrollo

export { API_BASE_URL, API_STATIC_URL }