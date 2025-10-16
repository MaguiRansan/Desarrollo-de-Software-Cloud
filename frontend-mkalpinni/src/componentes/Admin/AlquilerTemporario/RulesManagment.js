import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';

const RulesManagement = ({ rules, onSaveRules }) => {
  const [localRules, setLocalRules] = useState(rules);

  const handleSave = () => {
    onSaveRules(localRules);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Gestión de Reglas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Horario de Check-In"
          value={localRules.checkIn}
          onChange={(e) => setLocalRules({ ...localRules, checkIn: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Horario de Check-Out"
          value={localRules.checkOut}
          onChange={(e) => setLocalRules({ ...localRules, checkOut: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Política de Cancelación"
          value={localRules.cancellationPolicy}
          onChange={(e) => setLocalRules({ ...localRules, cancellationPolicy: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Normas de la Casa"
          value={localRules.houseRules}
          onChange={(e) => setLocalRules({ ...localRules, houseRules: e.target.value })}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Guardar Reglas
        </button>
      </div>
    </div>
  );
};

export default RulesManagement;