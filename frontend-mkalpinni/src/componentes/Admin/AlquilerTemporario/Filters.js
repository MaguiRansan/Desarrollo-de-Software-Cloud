import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from "react";

const Filters = ({ filters = {}, onFilterChange }) => {
  const defaultFilters = {
    city: "",
    capacity: "",
    priceRange: { min: 0, max: 1000 },
    services: [],
    startDate: "",
    endDate: ""
  };

  const [localFilters, setLocalFilters] = useState({ ...defaultFilters, ...filters });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      services: checked
        ? [...prevFilters.services, value]
        : prevFilters.services.filter((service) => service !== value),
    }));
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      priceRange: { ...localFilters.priceRange, [name]: parseInt(value) },
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="p-6 w-1/4 min-h-screen bg-gray-100 shadow-xl rounded-2xl fixed left-0 top-0 overflow-y-auto">
      <h3 className="text-2xl font-semibold text-center mb-4">Filtros</h3>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Ciudad</label>
          <input className="w-full p-2 border rounded" type="text" name="city" value={localFilters.city} onChange={handleChange} />
        </div>
        
        <div>
          <label className="block font-medium">Capacidad mínima</label>
          <input className="w-full p-2 border rounded" type="number" name="capacity" value={localFilters.capacity} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Precio mínimo</label>
          <input className="w-full p-2 border rounded" type="number" name="min" value={localFilters.priceRange.min} onChange={handlePriceRangeChange} />
        </div>

        <div>
          <label className="block font-medium">Precio máximo</label>
          <input className="w-full p-2 border rounded" type="number" name="max" value={localFilters.priceRange.max} onChange={handlePriceRangeChange} />
        </div>

        <div>
          <label className="block font-medium">Fecha de inicio</label>
          <input className="w-full p-2 border rounded" type="date" name="startDate" value={localFilters.startDate} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Fecha de fin</label>
          <input className="w-full p-2 border rounded" type="date" name="endDate" value={localFilters.endDate} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Servicios</label>
          <div className="flex flex-col space-y-2">
            {["WiFi", "Aire acondicionado", "TV"].map((service) => (
              <label key={service} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={service}
                  checked={localFilters.services.includes(service)}
                  onChange={handleServiceChange}
                />
                <span>{service}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleApplyFilters} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-md">
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;