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
      const firstImage = property.images[0];
      
      if (typeof firstImage === 'string') {
        return (
          <img
            src={firstImage}
            alt={property.title}
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              console.error('Error loading image:', firstImage);
              e.target.src = "https://cdn.prod.website-files.com/61e9b342b016364181c41f50/62a014dd84797690c528f25e_38.jpg";
            }}
          />
        );
      }
      
      if (firstImage?.rutaArchivo) {
        return (
          <img
            src={firstImage.rutaArchivo}
            alt={property.title}
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              e.target.src = "https://cdn.prod.website-files.com/61e9b342b016364181c41f50/62a014dd84797690c528f25e_38.jpg";
            }}
          />
        );
      }
    }

    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  };

  return (
    <div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${
                property.status === 'ocupado' ? 'opacity-80' : ''
              } ${
                property.status === 'reservado' ? 'border-l-4 border-yellow-400' : ''
              }`}
            >
              {renderPropertyImage(property)}
              
              <div className="p-6">
                <div className="flex flex-col mb-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-green-600 font-bold text-xl">${property.price.toLocaleString()}</span>
                    {property.status === 'ocupado' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Ocupado
                      </span>
                    )}
                    {property.status === 'reservado' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Reservado
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  {property.address}
                </p>

                <div className={`grid ${property.landSquareMeters ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-gray-600 mb-6 text-sm`}>
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaBed className="text-blue-500 mb-1" />
                    <span>{property.bedrooms || '0'} {property.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}</span>
                  </span>
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaBath className="text-blue-500 mb-1" />
                    <span>{property.bathrooms || '0'} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
                  </span>
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaRulerCombined className="text-blue-500 mb-1" />
                    <span>{property.squareMeters || '0'} m²</span>
                  </span>
                  {property.landSquareMeters !== undefined && property.landSquareMeters !== null && property.landSquareMeters !== '' && (
                    <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                      <FaRuler className="text-blue-500 mb-1" />
                      <span>{property.landSquareMeters} m² terreno</span>
                    </span>
                  )}
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
                  {property.landSquareMeters !== undefined && property.landSquareMeters !== null && property.landSquareMeters !== '' && (
                    <span className="flex items-center">
                      <FaRuler className="mr-1 text-blue-500" />
                      {property.landSquareMeters} m² terreno
                    </span>
                  )}
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
                    {typeof image === 'string' && image.startsWith('http') ? (
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error cargando imagen:', image);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : image instanceof File ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : image?.rutaArchivo ? (
                      <img
                        src={image.rutaArchivo}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://cdn.prod.website-files.com/61e9b342b016364181c41f50/62a014dd84797690c528f25e_38.jpg";
                        }}
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
                {selectedProperty.landSquareMeters !== undefined && selectedProperty.landSquareMeters !== null && selectedProperty.landSquareMeters !== '' && (
                  <p className="text-gray-600">Metros cuadrados del terreno: {selectedProperty.landSquareMeters} m²</p>
                )}
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