import React, { useState } from "react";

const Filters = ({ filters = {}, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState({
    city: "",
    capacity: "",
    priceRange: { min: 0, max: 10000000 },
    services: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...localFilters, [name]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    const updatedServices = checked
      ? [...localFilters.services, value]
      : localFilters.services.filter((service) => service !== value);

    const updatedFilters = { ...localFilters, services: updatedServices };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceRangeChange = (field, value) => {
    const updatedFilters = {
      ...localFilters,
      priceRange: {
        ...localFilters.priceRange,
        [field]: value === '' ? (field === 'min' ? 0 : 10000000) : parseInt(value)
      },
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      city: "",
      capacity: "",
      priceRange: { min: 0, max: 10000000 },
      services: [],
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filtros de Búsqueda</h2>
        <button
          onClick={clearFilters}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <input
            type="text"
            name="city"
            value={localFilters.city}
            onChange={handleChange}
            placeholder="Ingresa la ciudad"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad mínima</label>
          <input
            type="number"
            name="capacity"
            value={localFilters.capacity}
            onChange={handleChange}
            placeholder="Número de personas"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
          <input
            type="number"
            value={localFilters.priceRange.min === 0 ? '' : localFilters.priceRange.min}
            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
            placeholder="Precio mínimo"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
          <input
            type="number"
            value={localFilters.priceRange.max === 10000000 ? '' : localFilters.priceRange.max}
            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
            placeholder="Precio máximo"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Servicios</label>
          <div className="flex flex-wrap gap-3">
            {["WiFi", "Aire acondicionado", "TV", "Cocina equipada", "Piscina"].map((service) => (
              <label key={service} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={service}
                  checked={localFilters.services.includes(service)}
                  onChange={handleServiceChange}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;