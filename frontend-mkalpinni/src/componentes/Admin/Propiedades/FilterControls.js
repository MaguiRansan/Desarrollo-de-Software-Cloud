import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';

const FilterControls = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      onFilterChange({ ...filters, [name]: checked });
    } else {
      onFilterChange({ ...filters, [name]: value });
    }
  };

  const handlePriceRangeChange = (field, value) => {
    const newPriceRange = {
      ...filters.priceRange,
      [field]: value === '' ? (field === 'min' ? 0 : Infinity) : Number(value)
    };
    onFilterChange({ ...filters, priceRange: newPriceRange });
  };

  const clearFilters = () => {
    onFilterChange({
      operationType: '',
      type: '',
      bedrooms: '',
      bathrooms: '',
      priceRange: { min: 0, max: Infinity },
      status: '',
      allowsPets: null,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filtros Avanzados</h2>
        <button
          onClick={clearFilters}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Limpiar filtros
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Operación</label>
          <select
            name="operationType"
            value={filters.operationType}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las operaciones</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="Casa">Casa</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Local">Local</option>
            <option value="Terreno">Terreno</option>
            <option value="Oficina">Oficina</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dormitorios mínimos</label>
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Cualquier cantidad</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Baños mínimos</label>
          <select
            name="bathrooms"
            value={filters.bathrooms}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Cualquier cantidad</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio (USD)</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.priceRange.min === 0 ? '' : filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="ocupado">Ocupado</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Permite Mascotas</label>
          <select
            name="allowsPets"
            value={filters.allowsPets === null ? '' : filters.allowsPets.toString()}
            onChange={(e) => {
              const value = e.target.value === '' ? null : e.target.value === 'true';
              onFilterChange({ ...filters, allowsPets: value });
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No importa</option>
            <option value="true">Sí permite</option>
            <option value="false">No permite</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;