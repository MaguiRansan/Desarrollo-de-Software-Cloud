import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TemporaryPropertyList from './TemporaryPropertyList';
import { FaHome, FaUsers, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaEdit, FaMoneyBillWave } from "react-icons/fa";
import AddPropertyForm from './AddPropertyForm';
import Filters from './Filters';
import ReservationCalendar from './ReservationCalendar';
import EditPropertyForm from './EditPropertyForm';
import AdminLayout from '../AdminLayout';

import { propertyService } from '../../../services/api';

const Temporarios = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    capacity: '',
    priceRange: { min: 0, max: 10000000 },
    services: [],
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [users, setUsers] = useState([]);

  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchTemporaryRentals = async () => {
      try {
        setIsLoading(true);



        const response = await propertyService.getForTemporaryRent();

        if (response.status && response.value) {
          const propertiesWithAvailability = await Promise.all(
            response.value.map(async (prop) => {
              try {
                const availabilityResponse = await fetch(`/API/Propiedad/Disponibilidad/${prop._id || prop.id}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });

                let availability = [];
                if (availabilityResponse.ok) {
                  const availabilityData = await availabilityResponse.json();
                  if (availabilityData.status && availabilityData.value) {
                    availability = availabilityData.value.availability || [];
                  }
                }

                const mappedProperty = {
                  id: prop.id || prop._id,
                  _id: prop._id || prop.id,
                  title: prop.title || prop.titulo || 'Sin título',
                  description: prop.description || prop.descripcion || 'Sin descripción',
                  address: prop.address || prop.direccion || 'Sin dirección',
                  neighborhood: prop.neighborhood || prop.barrio || 'Sin barrio',
                  locality: prop.locality || prop.localidad || 'Sin localidad',
                  province: prop.province || prop.provincia || 'Sin provincia',
                  type: prop.type || prop.tipoPropiedad || 'Casa/Depto',
                  price: prop.precioPorNoche || 0,
                  transaccionTipo: 'Alquiler Temporario',
                  pricePerWeek: prop.precioPorSemana || 0,
                  pricePerMonth: prop.precioPorMes || 0,
                  priceDescription: 'por noche',
                  squareMeters: prop.squareMeters || prop.superficieM2 || 0,
                  bedrooms: prop.bedrooms || prop.habitaciones || 0,
                  bathrooms: prop.bathrooms || prop.banos || 0,
                  capacity: prop.capacidadPersonas || 1,
                  services: Array.isArray(prop.services) ? prop.services : [],
                  rules: Array.isArray(prop.reglasPropiedad) ? prop.reglasPropiedad : [],
                  status: (prop.estado || 'disponible').toLowerCase(),
                  operationType: 'alquiler_temporario',
                  checkInTime: prop.horarioCheckIn || '15:00',
                  checkOutTime: prop.horarioCheckOut || '11:00',
                  estadiaMinima: (prop.estadiaMinima === null || prop.estadiaMinima === undefined || prop.estadiaMinima === 0)
                    ? 1
                    : prop.estadiaMinima,
                  securityDeposit: prop.depositoSeguridad || 0,
                  currency: prop.currency || 'USD',
                  images: Array.isArray(prop.images) && prop.images.length > 0
                    ? prop.images.map(img => {
                      if (typeof img === 'object') {
                        return {
                          ...img,
                          rutaArchivo: img.rutaArchivo || img.url || 'https://via.placeholder.com/300',
                          url: img.url || img.rutaArchivo || 'https://via.placeholder.com/300'
                        };
                      }
                      return {
                        rutaArchivo: img,
                        url: img
                      };
                    })
                    : ['https://via.placeholder.com/300'],
                  availability: availability.map(range => ({
                    ...range,
                    startDate: new Date(range.startDate),
                    endDate: new Date(range.endDate)
                  })),
                  ...(prop.especificaciones && { specifications: prop.especificaciones }),
                  ...(prop.latitud && { latitude: parseFloat(prop.latitud) || 0 }),
                  ...(prop.longitud && { longitude: parseFloat(prop.longitud) || 0 }),
                  cliente: prop.cliente || '',
                  fechaReserva: prop.fechaReserva || ''
                };

                return mappedProperty;
              } catch (error) {
                return {
                  ...prop,
                  availability: [],
                  id: prop.id || prop._id,
                  _id: prop._id || prop.id
                };
              }
            })
          );

          setProperties(propertiesWithAvailability);
        } else {
          setError('No se pudieron cargar las propiedades de alquiler temporario');
          toast.error(response.message || 'Error al cargar las propiedades');
        }
      } catch (err) {
        setError('Error al cargar las propiedades: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemporaryRentals();
  }, []);

  const handleSaveProperty = async (propertyData, imageFiles = []) => {
    try {
      setIsLoading(true);

      const propertyToSave = {
        titulo: propertyData.titulo || 'Sin título',
        direccion: propertyData.direccion || 'Dirección no especificada',
        descripcion: propertyData.descripcion || '',
        barrio: propertyData.barrio || '',
        localidad: propertyData.localidad || '',
        provincia: propertyData.provincia || '',
        tipoPropiedad: propertyData.tipoPropiedad || 'Casa',
        transaccionTipo: 'Alquiler Temporario',

        habitaciones: propertyData.habitaciones ? parseInt(propertyData.habitaciones) : 0,
        banos: propertyData.banos ? parseInt(propertyData.banos) : 0,
        superficieM2: propertyData.superficieM2 ? parseFloat(propertyData.superficieM2) : 0,
        capacidadPersonas: propertyData.capacidadPersonas ? parseInt(propertyData.capacidadPersonas) : 1,

        precio: propertyData.precioPorNoche ? parseFloat(propertyData.precioPorNoche) : 0,
        precioPorNoche: propertyData.precioPorNoche ? parseFloat(propertyData.precioPorNoche) : 0,
        precioPorSemana: propertyData.precioPorSemana ? parseFloat(propertyData.precioPorSemana) : 0,
        precioPorMes: propertyData.precioPorMes ? parseFloat(propertyData.precioPorMes) : 0,

        horarioCheckIn: propertyData.horarioCheckIn || '15:00',
        horarioCheckOut: propertyData.horarioCheckOut || '11:00',
        estadiaMinima: propertyData.estadiaMinima,

        servicios: Array.isArray(propertyData.servicios) ? propertyData.servicios : [],
        reglasPropiedad: Array.isArray(propertyData.reglasPropiedad) ? propertyData.reglasPropiedad : [],

        estado: propertyData.estado ? propertyData.estado.charAt(0).toUpperCase() + propertyData.estado.slice(1).toLowerCase() : 'Disponible',
        esAlquilerTemporario: true,
        activo: true,

        ...(propertyData.availability && propertyData.availability.length > 0 && {
          disponibilidad: propertyData.availability.map(avail => ({
            startDate: new Date(avail.startDate),
            endDate: new Date(avail.endDate),
            status: 'disponible',
            clientName: '',
            deposit: 0,
            guests: parseInt(avail.availableGuests) || 1,
            notes: '',
            id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
        }),

        imagenes: Array.isArray(propertyData.imagenes)
          ? propertyData.imagenes
            .filter(img => {
              if (typeof img === 'string' && img.startsWith('data:')) return false;
              return true;
            })
            .map(img => {
              if (typeof img === 'object' && img !== null) {
                return {
                  rutaArchivo: img.rutaArchivo || img.url,
                  nombreArchivo: img.nombreArchivo || 'imagen_existente',
                  _id: img._id
                };
              }
              return {
                rutaArchivo: img,
                nombreArchivo: 'imagen_existente'
              };
            })
          : [],
      };

      if (propertyData.availability && propertyData.availability.length > 0) {
        propertyToSave.availability = propertyData.availability.map(avail => ({
          startDate: new Date(avail.startDate),
          endDate: new Date(avail.endDate),
          status: 'disponible',
          clientName: '',
          deposit: 0,
          guests: parseInt(avail.availableGuests) || 1,
          notes: '',
          id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }

      Object.keys(propertyToSave).forEach(key => {
        if (propertyToSave[key] === '' || propertyToSave[key] === null || propertyToSave[key] === undefined) {
          delete propertyToSave[key];
        }
      });

      let response;
      const isEditing = !!propertyToEdit;
      const propertyId = isEditing ? (propertyToEdit.id || propertyToEdit._id) : null;

      if (isEditing) {
        response = await propertyService.update(propertyId, propertyToSave);
      } else {
        response = await propertyService.create(propertyToSave);
      }

      if (response.status && response.value) {
        const savedPropertyId = response.value._id || response.value.id;
        let finalProperty = response.value;

        if (imageFiles && imageFiles.length > 0) {
          const uploadResponse = await propertyService.uploadImages(savedPropertyId, imageFiles);

          if (!uploadResponse.status) {
            throw new Error('Propiedad guardada pero error al subir las imágenes');
          }

          if (uploadResponse.value && uploadResponse.value.length > 0) {
            finalProperty = {
              ...finalProperty,
              imagenes: uploadResponse.value
            };
          }
        }

        if (isEditing) {
          setProperties(prev => prev.map(p => {
            if (p.id === propertyId || p._id === propertyId) {
              return {
                ...p,
                ...finalProperty,
                id: p.id || finalProperty.id,
                _id: p._id || finalProperty._id,
                title: finalProperty.title || finalProperty.titulo || p.title || 'Sin título',
                description: finalProperty.description || finalProperty.descripcion || p.description || '',
                price: finalProperty.price || finalProperty.precio || p.price || 0,
                images: finalProperty.images || finalProperty.imagenes || p.images || [],
                services: finalProperty.servicios || finalProperty.services || p.services || [],
                rules: finalProperty.reglasPropiedad || finalProperty.rules || p.rules || []
              };
            }
            return p;
          }));
          toast.success('Propiedad actualizada exitosamente');
        } else {
          const newProperty = {
            ...finalProperty,
            id: finalProperty.id || finalProperty._id,
            _id: finalProperty._id || finalProperty.id,
            title: finalProperty.title || finalProperty.titulo || 'Sin título',
            description: finalProperty.description || finalProperty.descripcion || '',
            price: finalProperty.price || finalProperty.precio || 0,
            images: finalProperty.images || finalProperty.imagenes || []
          };
          setProperties(prev => [...prev, newProperty]);
          toast.success('Propiedad creada exitosamente');
        }

        setIsFormOpen(false);
        setPropertyToEdit(null);
      } else {
        throw new Error(response.message || 'Error al guardar la propiedad');
      }
    } catch (error) {
      toast.error(`Error al guardar la propiedad: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProperty = () => {
    setPropertyToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property) => {
    setPropertyToEdit(property);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setPropertyToEdit(null);
    setIsFormOpen(false);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('¿Está seguro de eliminar esta propiedad temporaria?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await propertyService.delete(propertyId);

      if (response.status) {
        setProperties(prevProperties =>
          prevProperties.filter(p => (p.id !== propertyId && p._id !== propertyId))
        );
        toast.success('Propiedad eliminada correctamente');
      } else {
        throw new Error(response.message || 'Error al eliminar la propiedad');
      }
    } catch (error) {
      toast.error(`Error al eliminar la propiedad: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, clientName = '', dateRange = '', rangeData = null) => {
    try {
      const currentProperty = properties.find(p => p.id === id || p._id === id);
      if (!currentProperty) {
        throw new Error('Propiedad no encontrada');
      }

      if (rangeData) {
        const response = await fetch(`/API/Propiedad/Disponibilidad/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            disponible: status === 'disponible',
            fechaInicio: rangeData.startDate,
            fechaFin: rangeData.endDate,
            cliente: rangeData.clientName || '',
            deposito: rangeData.deposit || 0,
            huespedes: rangeData.guests || 1
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar la disponibilidad');
        }

        const updatedProperty = await response.json();

        setProperties(prevProperties =>
          prevProperties.map(p =>
            (p.id === id || p._id === id)
              ? { ...updatedProperty.value, id: p.id || p._id, _id: p._id || p.id }
              : p
          )
        );

        toast.success('Disponibilidad actualizada correctamente');
        return;
      }


      setProperties(prevProperties =>
        prevProperties.map(p =>
          (p.id === id || p._id === id)
            ? {
              ...p,
              estado: status,
              cliente: clientName,
              fechaReserva: dateRange
            }
            : p
        )
      );

      toast.success('Estado de la propiedad actualizado correctamente');

    } catch (error) {
      toast.error(`Error al actualizar el estado: ${error.message}`);
    }
  };

  const getFilteredAndSortedProperties = () => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    let currentProperties = [...properties];

    currentProperties = currentProperties.filter((property) => {
      if (!property) return false;

      const matchesSearch = !searchTerm ||
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = !filters.city ||
        property.locality?.toLowerCase().includes(filters.city.toLowerCase());

      const matchesCapacity = !filters.capacity ||
        (property.capacity || 0) >= parseInt(filters.capacity);

      const propertyPrice = parseFloat(property.price) || 0;
      const minPrice = filters.priceRange?.min || 0;
      const maxPrice = filters.priceRange?.max || 10000000;
      const matchesPrice = propertyPrice >= minPrice && propertyPrice <= maxPrice;

      const matchesServices = !filters.services || filters.services.length === 0 ||
        filters.services.every(service =>
          (property.services || []).includes(service)
        );

      return matchesSearch && matchesCity && matchesCapacity && matchesPrice && matchesServices;
    });

    currentProperties.sort((a, b) => {
      if (sortBy === 'name') {
        const titleA = a?.title?.toString()?.toLowerCase() || '';
        const titleB = b?.title?.toString()?.toLowerCase() || '';
        return titleA.localeCompare(titleB);
      }
      if (sortBy === 'price') {
        const priceA = parseFloat(a?.price) || 0;
        const priceB = parseFloat(b?.price) || 0;
        return priceA - priceB;
      }
      return 0;
    });

    return currentProperties;
  };

  const currentFilteredProperties = getFilteredAndSortedProperties();

  const handleReserve = (propertyId, reservation) => {
  };

  const handleCancelReservation = (reservation) => {
  };

  const handleViewProperty = (property) => {
    const propertyWithDates = {
      ...property,
      availability: property.availability ? property.availability.map(range => ({
        ...range,
        startDate: range.startDate instanceof Date ? range.startDate : new Date(range.startDate),
        endDate: range.endDate instanceof Date ? range.endDate : new Date(range.endDate)
      })) : []
    };
    setSelectedProperty(propertyWithDates);
  };

  const handleCloseDetail = () => {
    setSelectedProperty(null);
  };


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando propiedades de alquiler temporario...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {propertyToEdit ? 'Editar Propiedad Temporaria' : 'Nueva Propiedad Temporaria'}
          </h2>
          {propertyToEdit ? (
            <EditPropertyForm
              property={propertyToEdit}
              onSave={handleSaveProperty}
              onClose={handleCancelForm}
            />
          ) : (
            <AddPropertyForm
              onAddProperty={handleSaveProperty}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      )}

      {!isFormOpen && (
        <div>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Alquiler Temporario
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Gestiona propiedades para alquiler a corto plazo
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-xl">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ciudad, dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="name">Ordenar por Nombre</option>
                    <option value="price">Ordenar por Precio</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                    title="Vista de cuadrícula"
                  >
                    <FaTh className="text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                    title="Vista de lista"
                  >
                    <FaList className="text-sm" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                >
                  <FaFilter className="mr-1.5" />
                  <span className="hidden sm:inline">Filtros</span>
                </button>

                <button
                  onClick={handleAddProperty}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  title="Agregar nueva propiedad"
                >
                  <FaPlus className="mr-1.5" />
                  <span className="hidden sm:inline">Agregar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentFilteredProperties.length}</div>
                <div className="text-sm font-medium text-blue-800">Total Propiedades</div>
                <div className="text-xs text-gray-500 mt-1">Temporario</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentFilteredProperties.filter(p => p.status === 'disponible').length}
                </div>
                <div className="text-sm font-medium text-green-800">Disponibles</div>
                <div className="text-xs text-gray-500 mt-1">Actualmente</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {currentFilteredProperties.filter(p => p.status !== 'disponible').length}
                </div>
                <div className="text-sm font-medium text-red-800">No Disponibles</div>
                <div className="text-xs text-gray-500 mt-1">Ocupadas/Reservadas</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${Math.round(currentFilteredProperties.reduce((sum, p) => sum + p.price, 0) / currentFilteredProperties.length || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-purple-800">Precio Promedio</div>
                <div className="text-xs text-gray-500 mt-1">/noche</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {showFilters && (
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
                  <Filters filters={filters} onFilterChange={setFilters} />
                </div>
              )}

              {currentFilteredProperties.length === 0 ? (
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
                      onClick={handleAddProperty}
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Agregar primera propiedad
                    </button>
                  )}
                </div>
              ) : (
                <TemporaryPropertyList
                  properties={currentFilteredProperties}
                  viewMode={viewMode}
                  onAddNew={handleAddProperty}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                  onUpdateStatus={handleUpdateStatus}
                  onView={handleViewProperty}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{selectedProperty.title}</h2>
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
                    <span>{selectedProperty.locality}, {selectedProperty.address}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaUsers className="mr-3 text-green-500" />
                    <span>Capacidad: {selectedProperty.capacity} huéspedes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaMoneyBillWave className="mr-3 text-purple-500" />
                    <span>${selectedProperty.price}/noche</span>
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
                onClick={() => handleEditProperty(selectedProperty)}
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

export default Temporarios;