import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';

const PropertyList = ({ properties, selectedOperation, viewMode = 'grid', onAddNew, onEdit, onDelete, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessor, setLessor] = useState('');
  const [lessee, setLessee] = useState('');
  const [images, setImages] = useState([]);

  const filteredProperties = properties.filter((property) => {
    const matchesOperation = property.operationType === selectedOperation || 
                            (property.operationType === 'venta' && selectedOperation === 'venta') ||
                            (property.operationType === 'alquiler' && selectedOperation === 'alquiler');
    
    const matchesSearch = !searchTerm ||
                         property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesOperation && matchesSearch;
  });

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setLessor('');
    setLessee('');
  };

  const handleReserveProperty = () => {
    if (lessor && lessee) {
      onUpdateStatus(selectedProperty.id, 'reservado', lessor, lessee);
      closeModal();
    } else {
      alert('Por favor ingrese el nombre del locador y locatario.');
    }
  };

  const handleOccupyProperty = () => {
    onUpdateStatus(selectedProperty.id, 'ocupado');
    closeModal();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const renderPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      if (property.images[0] instanceof File) {
        return (
          <img
            src={URL.createObjectURL(property.images[0])}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
        );
      }
      if (typeof property.images[0] === 'string') {
        return (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
        );
      }
      if (property.images[0]?.rutaArchivo) {
        return (
          <img
            src={`/uploads/${property.images[0].rutaArchivo}`}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
        );
      }
    }
    
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Sin imagen</span>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en los resultados por título, dirección o barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 shadow-sm"
          />
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 hover:shadow-2xl ${
                property.status === 'ocupado' ? 'bg-gray-100' : ''
              }`}
            >
              {renderPropertyImage(property)}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{property.title}</h3>
                <span className="text-green-600 font-bold text-xl">${property.price.toLocaleString()}</span>
              </div>

              <p className="text-gray-600 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                {property.address}
              </p>

              <div className="flex space-x-4 text-gray-600 mb-6">
                <span className="flex items-center">
                  <FaBed className="mr-2 text-blue-500" />
                  {property.bedrooms} dormitorios
                </span>
                <span className="flex items-center">
                  <FaBath className="mr-2 text-blue-500" />
                  {property.bathrooms} baños
                </span>
                <span className="flex items-center">
                  <FaRulerCombined className="mr-2 text-blue-500" />
                  {property.squareMeters} m²
                </span>
              </div>

              <div className="flex items-center mb-4">
                <FaTag className="mr-2 text-blue-500" />
                <span className="text-gray-600">Tipo: {property.type}</span>
              </div>

              <div className="text-gray-600 mb-6">
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  Barrio: {property.neighborhood}
                </p>
                <p className="flex items-center">
                  Localidad: {property.locality}
                </p>
                <p className="flex items-center">
                  Provincia: {property.province}
                </p>
              </div>

              <div className="text-gray-600 mb-6">
                <p className="flex items-center">
                  Estado: {property.status}
                </p>
                {property.status === 'reservado' && (
                  <div>
                    <p className="text-gray-600">Locador: {property.lessor}</p>
                    <p className="text-gray-600">Locatario: {property.lessee}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(property)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
                >
                  <FaEdit />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onDelete(property.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
                >
                  <FaTrash />
                  <span>Eliminar</span>
                </button>
                <button
                  onClick={() => handleViewProperty(property)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
                >
                  <FaEye />
                  <span>Ver</span>
                </button>
              </div>
            </div>
          </div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No se encontraron propiedades.
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden flex ${
                property.status === 'ocupado' ? 'bg-gray-100' : ''
              }`}
            >
              <div className="w-48 h-32 flex-shrink-0">
                {renderPropertyImage(property)}
              </div>
              
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 flex items-center mb-1">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      {property.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {property.neighborhood && `${property.neighborhood}, `}
                      {property.locality && `${property.locality}, `}
                      {property.province}
                    </p>
                  </div>
                  <span className="text-green-600 font-bold text-xl">${property.price?.toLocaleString()}</span>
                </div>

                <div className="flex space-x-6 text-gray-600 mb-4">
                  <span className="flex items-center">
                    <FaBed className="mr-1 text-blue-500" />
                    {property.bedrooms || 0} dorm.
                  </span>
                  <span className="flex items-center">
                    <FaBath className="mr-1 text-blue-500" />
                    {property.bathrooms || 0} baños
                  </span>
                  <span className="flex items-center">
                    <FaRulerCombined className="mr-1 text-blue-500" />
                    {property.squareMeters || 0} m²
                  </span>
                  <span className="flex items-center">
                    <FaTag className="mr-1 text-blue-500" />
                    {property.type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'disponible' 
                        ? 'bg-green-100 text-green-800' 
                        : property.status === 'ocupado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(property)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg flex items-center space-x-1 transition duration-300"
                    >
                      <FaEdit />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDelete(property.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg flex items-center space-x-1 transition duration-300"
                    >
                      <FaTrash />
                      <span>Eliminar</span>
                    </button>
                    <button
                      onClick={() => handleViewProperty(property)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center space-x-1 transition duration-300"
                    >
                      <FaEye />
                      <span>Ver</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron propiedades.
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedProperty.title}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {selectedProperty.images && selectedProperty.images.length > 0 ? (
                selectedProperty.images.map((image, index) => (
                  <div key={index} className="w-full h-48 object-cover rounded-lg overflow-hidden">
                    {image instanceof File ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : typeof image === 'string' ? (
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : image?.rutaArchivo ? (
                      <img
                        src={`/uploads/${image.rutaArchivo}`}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Sin imágenes</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              {selectedProperty.address}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Tipo: {selectedProperty.type}</p>
                <p className="text-gray-600">Precio: ${selectedProperty.price.toLocaleString()}</p>
                <p className="text-gray-600">Dormitorios: {selectedProperty.bedrooms}</p>
                <p className="text-gray-600">Baños: {selectedProperty.bathrooms}</p>
                <p className="text-gray-600">Metros cuadrados: {selectedProperty.squareMeters} m²</p>
              </div>
              <div>
                <p className="text-gray-600">Barrio: {selectedProperty.neighborhood}</p>
                <p className="text-gray-600">Localidad: {selectedProperty.locality}</p>
                <p className="text-gray-600">Provincia: {selectedProperty.province}</p>
              </div>
            </div>
            <div className="text-gray-600 mb-6">
              <p className="flex items-center">
                Estado: {selectedProperty.status}
              </p>
              {selectedProperty.status === 'reservado' && (
                <div>
                  <p className="text-gray-600">Locador: {selectedProperty.lessor}</p>
                  <p className="text-gray-600">Locatario: {selectedProperty.lessee}</p>
                </div>
              )}
            </div>
            <div className="text-gray-600 mb-6">
              <p className="text-gray-600">Descripción: {selectedProperty.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300"
              >
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;