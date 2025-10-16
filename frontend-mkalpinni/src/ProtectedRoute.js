import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { Navigate } from "react-router-dom";
import { useUser } from "./Context/UserContext";

const ProtegerRuta = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (!user) {
        return <Navigate to="/iniciarsesion" />;
    }

    return children;
};

export default ProtegerRuta;