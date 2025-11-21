import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaRuler, FaCheck, FaTimes, FaEdit, FaTrash, FaEye, FaClock, FaTag, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import React, { useState } from 'react';

const PropertyList = ({ 
  properties, 
  selectedOperation, 
  viewMode = 'grid', 
  onEdit, 
  onDelete, 
  searchTerm = '',
  onUpdateStatus,
  setImages
}) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [lessor, setLessor] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [lessee, setLessee] = useState('');
  
  const goToPreviousImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? (selectedProperty?.images?.length || 1) - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === (selectedProperty?.images?.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

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
    setCurrentImageIndex(0);
    setLessor('');
    setLessee('');
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
    <div className="w-full">
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${
                property.status === 'ocupado' ? 'opacity-80 border-l-4 border-red-500' : ''
              } ${
                property.status === 'reservado' ? 'border-l-4 border-yellow-400' : ''
              }`}
            >
              <div className="relative h-48 w-full overflow-hidden">
                {renderPropertyImage(property)}
                {property.status === 'ocupado' && (
                  <div className="absolute top-2 right-2 flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaTimes className="w-3 h-3 mr-1" />
                    Ocupado
                  </div>
                )}
                {property.status === 'reservado' && (
                  <div className="absolute top-2 right-2 flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaClock className="w-3 h-3 mr-1" />
                    Reservado
                  </div>
                )}
                {!['ocupado', 'reservado'].includes(property.status) && (
                  <div className="absolute top-2 right-2 flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheck className="w-3 h-3 mr-1" />
                    Disponible
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-col mb-4">
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
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-green-600 font-bold text-xl">${property.price?.toLocaleString() || 'N/A'}</span>
                    <span className="text-sm text-gray-500">
                      {selectedOperation === 'alquiler' ? '/mes' : ''}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  {property.address}
                </p>
                <div className="grid grid-cols-3 gap-2 text-gray-600 mb-6 text-sm">
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaBed className="text-blue-500 mb-1" />
                    <span>{property.bedrooms || '0'} dorm.</span>
                  </span>
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaBath className="text-blue-500 mb-1" />
                    <span>{property.bathrooms || '0'} baños</span>
                  </span>
                  <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                    <FaRulerCombined className="text-blue-500 mb-1" />
                    <span>{property.squareMeters || '0'} m²</span>
                  </span>
                </div>
                
                {property.landSquareMeters && (
                  <div className="text-sm text-gray-600 mb-4 flex items-center">
                    <FaRuler className="text-blue-500 mr-2" />
                    {property.landSquareMeters} m² terreno
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(property)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition duration-300"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(property.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-300"
                    title="Eliminar"
                  >
                    <FaTrash />
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedProperty.title}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    {selectedProperty.address}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Cerrar"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProperty.status === 'disponible' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedProperty.status === 'ocupado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedProperty.status === 'disponible' && <FaCheck className="mr-1.5" />}
                  {selectedProperty.status === 'ocupado' && <FaTimes className="mr-1.5" />}
                  {selectedProperty.status === 'reservado' && <FaClock className="mr-1.5" />}
                  {selectedProperty.status?.charAt(0).toUpperCase() + selectedProperty.status?.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative mb-6 rounded-xl overflow-hidden bg-gray-100 h-80">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <>
                    {selectedProperty.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`absolute inset-0 transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                      >
                        {typeof image === 'string' && image.startsWith('http') ? (
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Error cargando imagen:', image);
                              e.target.src = "https://cdn.prod.website-files.com/61e9b342b016364181c41f50/62a014dd84797690c528f25e_38.jpg";
                            }}
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
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500">Imagen no disponible</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    
                    {selectedProperty.images.length > 1 && (
                      <>
                        <button
                          onClick={goToPreviousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg text-gray-800 hover:text-blue-600 transition-colors"
                          aria-label="Imagen anterior"
                        >
                          <FaChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={goToNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg text-gray-800 hover:text-blue-600 transition-colors"
                          aria-label="Siguiente imagen"
                        >
                          <FaChevronRight className="w-5 h-5" />
                        </button>
                        
                        
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          {selectedProperty.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                i === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                              aria-label={`Ir a imagen ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No hay imágenes disponibles</span>
                  </div>
                )}
              </div>

              
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Precio de {selectedProperty.operationType === 'alquiler' ? 'alquiler' : 'venta'}</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${selectedProperty.price?.toLocaleString()}
                      {selectedProperty.operationType === 'alquiler' && (
                        <span className="text-base font-normal text-gray-500">/mes</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tipo de operación</p>
                    <p className="font-medium text-blue-700">
                      {selectedProperty.operationType === 'alquiler' ? 'Alquiler' : 'Venta'}
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Detalles de la propiedad</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaBed className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dormitorios</p>
                        <p className="font-medium">{selectedProperty.bedrooms || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaBath className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Baños</p>
                        <p className="font-medium">{selectedProperty.bathrooms || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaRulerCombined className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Superficie</p>
                        <p className="font-medium">{selectedProperty.squareMeters || 'No especificado'} m²</p>
                      </div>
                    </div>
                    {selectedProperty.landSquareMeters && (
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FaRuler className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Terreno</p>
                          <p className="font-medium">{selectedProperty.landSquareMeters} m²</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Ubicación</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Barrio</p>
                      <p className="font-medium">{selectedProperty.neighborhood || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Localidad</p>
                      <p className="font-medium">{selectedProperty.locality || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Provincia</p>
                      <p className="font-medium">{selectedProperty.province || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{selectedProperty.address || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
              </div>

              
              {selectedProperty.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedProperty.description}</p>
                </div>
              )}

              {(selectedProperty.amenities || []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-6 border-t px-4 mb-4 ">
              <button
                onClick={closeModal}
                className= "flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition duration-300 text-lg font-medium"
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