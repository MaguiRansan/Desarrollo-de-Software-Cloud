import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import AddPropertyForm from './AddPropertyForm';
import Filters from './Filters';
import ReservationCalendar from './ReservationCalendar';
import EditPropertyForm from './EditPropertyForm';
import AdminLayout from '../AdminLayout';
import { propertyService } from '../../../services/api';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemporaryRentals = async () => {
      try {
        setIsLoading(true);
        const response = await propertyService.getForTemporaryRent();
        
        if (response.status && response.value) {
          const mappedProperties = response.value.map(prop => ({
            id: prop.id,
            name: prop.titulo,
            description: prop.descripcion,
            location: { 
              city: prop.ubicacion || prop.localidad || 'Sin ubicación', 
              address: prop.direccion || 'Sin dirección' 
            },
            capacity: prop.capacidadPersonas || 1,
            services: prop.servicios || [],
            price: { 
              night: prop.precioPorNoche || 0, 
              week: prop.precioPorSemana || 0, 
              month: prop.precioPorMes || 0 
            },
            images: prop.imagenes && prop.imagenes.length > 0 
              ? prop.imagenes.map(img => `http://localhost:5228/uploads/${img.rutaArchivo}`)
              : ['https://via.placeholder.com/300'],
            availability: [], 
            rules: {
              checkIn: prop.horarioCheckIn || '15:00',
              checkOut: prop.horarioCheckOut || '11:00',
              cancellationPolicy: prop.politicaCancelacion || 'Flexible',
              houseRules: prop.reglasPropiedad ? prop.reglasPropiedad.join(', ') : 'Sin reglas específicas',
            },
            securityDeposit: prop.depositoSeguridad || 0,
            paymentMethods: prop.metodosPago || ['Efectivo'],
            paymentHistory: [],
          }));
          setProperties(mappedProperties);
        } else {
          setError('No se pudieron cargar las propiedades de alquiler temporario');
        }
      } catch (err) {
        console.error('❌ Error cargando propiedades temporarias:', err);
        setError('Error al cargar las propiedades: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemporaryRentals();
  }, []);

  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    capacity: '',
    priceRange: { min: 0, max: 1000 },
    services: [],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  const filteredProperties = properties.filter((property) => {
    const matchesFilters = (
      (filters.city === '' || property.location.city.includes(filters.city)) &&
      (filters.capacity === '' || property.capacity >= parseInt(filters.capacity)) &&
      property.price.night >= filters.priceRange.min &&
      property.price.night <= filters.priceRange.max &&
      (filters.services.length === 0 ||
        filters.services.every((service) => property.services.includes(service)))
    );
    
    const matchesSearch = !searchTerm || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilters && matchesSearch;
  });

  const handleReserve = (propertyId, reservation) => {
    setProperties((prevProperties) =>
      prevProperties.map((p) =>
        p.id === propertyId
          ? { ...p, availability: [...p.availability, reservation] }
          : p
      )
    );
  };

  const handleCancelReservation = (reservation) => {
    setProperties((prevProperties) =>
      prevProperties.map((p) =>
        p.id === selectedProperty.id
          ? {
              ...p,
              availability: p.availability.filter(
                (r) => r.startDate !== reservation.startDate || r.endDate !== reservation.endDate
              ),
            }
          : p
      )
    );
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
  };

  const handleCloseDetail = () => {
    setSelectedProperty(null);
  };

  const handleSaveProperty = (updatedProperty) => {
    setProperties((prevProperties) =>
      prevProperties.map((p) =>
        p.id === updatedProperty.id ? updatedProperty : p
      )
    );
    setEditingProperty(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Alquiler Temporario</h1>
            <p className="text-gray-600">Gestiona propiedades para alquiler a corto plazo</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            {showAddForm ? 'Ocultar Formulario' : 'Nueva Propiedad'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad, dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FaList />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter className="mr-2" />
              Filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredProperties.length}</div>
            <div className="text-sm text-gray-600">Propiedades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredProperties.filter(p => p.availability.length === 0).length}
            </div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredProperties.filter(p => p.availability.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Con reservas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(filteredProperties.reduce((sum, p) => sum + p.price.night, 0) / filteredProperties.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Precio promedio</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {showFilters && (
            <div className="mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <Filters filters={filters} onFilterChange={setFilters} />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Cargando propiedades de alquiler temporario...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar propiedades</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filteredProperties.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 mb-4">
                    <FaHome className="mx-auto h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || Object.values(filters).some(f => f !== '' && f !== 0 && (Array.isArray(f) ? f.length > 0 : true)) 
                      ? 'No se encontraron propiedades' 
                      : 'No hay propiedades de alquiler temporario'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || Object.values(filters).some(f => f !== '' && f !== 0 && (Array.isArray(f) ? f.length > 0 : true))
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza agregando tu primera propiedad para alquiler temporario'
                    }
                  </p>
                  {!searchTerm && !Object.values(filters).some(f => f !== '' && f !== 0 && (Array.isArray(f) ? f.length > 0 : true)) && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Agregar primera propiedad
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                      
                      <div className="flex items-center text-gray-500 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" size={14} />
                        <span className="text-sm">{property.location.city}, {property.location.address}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-500">
                          <FaUsers className="mr-1 text-green-500" size={14} />
                          <span className="text-sm">{property.capacity} huéspedes</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">${property.price.night}</span>
                          <span className="text-sm text-gray-500">/noche</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {property.availability.length > 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">
                            {property.availability.length} reserva(s) activa(s)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <FaHome className="text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">Disponible para reservar</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProperty(property)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-2" size={14} />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => setEditingProperty(property)}
                      className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => setProperties(properties.filter((p) => p.id !== property.id))}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {showAddForm && (
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nueva Propiedad</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <AddPropertyForm
                onAddProperty={(property) => {
                  setProperties([...properties, { ...property, id: properties.length + 1 }]);
                  setShowAddForm(false);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto">
            <EditPropertyForm
              property={editingProperty}
              onSave={handleSaveProperty}
              onClose={() => setEditingProperty(null)}
            />
          </div>
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{selectedProperty.name}</h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">{selectedProperty.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <FaMapMarkerAlt className="mr-3 text-blue-500" />
                    <span>{selectedProperty.location.city}, {selectedProperty.location.address}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaUsers className="mr-3 text-green-500" />
                    <span>Capacidad: {selectedProperty.capacity} huéspedes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaHome className="mr-3 text-purple-500" />
                    <span>${selectedProperty.price.night}/noche - ${selectedProperty.price.week}/semana - ${selectedProperty.price.month}/mes</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Servicios incluidos</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.services.map((service, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <ReservationCalendar
                  property={selectedProperty}
                  onReserve={(reservation) => handleReserve(selectedProperty.id, reservation)}
                  users={users}
                  onCancelReservation={handleCancelReservation}
                  onAddUser={(newUser) => setUsers([...users, { ...newUser, id: users.length + 1 }])}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditingProperty(selectedProperty)}
                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
              >
                <FaEdit className="mr-2" />
                Editar
              </button>
              <button
                onClick={handleCloseDetail}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PropertyList;