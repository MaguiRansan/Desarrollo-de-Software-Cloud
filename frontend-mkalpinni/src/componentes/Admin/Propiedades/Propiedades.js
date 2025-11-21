import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTh, FaList, FaFilter } from "react-icons/fa";
import OperationSelection from './OperationSelection';
import FilterControls from './FilterControls';
import PropertyList from './PropertyList';
import PropertyForm from './PropertyForm';
import AdminLayout from '../AdminLayout';
import { useAdminData } from '../../../hooks/useAdminData';
import { propertyService } from '../../../services/api';

const createEmptyProperty = (operationType = 'venta') => ({
  _id: undefined,
  id: undefined,
  idPropiedad: undefined,
  title: '',
  description: '',
  address: '',
  neighborhood: '',
  locality: '',
  province: '',
  type: 'Casa',
  operationType,
  price: '',
  bedrooms: '',
  bathrooms: '',
  squareMeters: '',
  landSquareMeters: '',
  status: 'disponible',
  images: [null],
  lessor: '',
  lessee: '',
  allowsPets: false,
  removedImages: []
});

const normalizeProperty = (prop = {}) => {
  const id = prop.id || prop._id || prop.idPropiedad;
  const operationType = prop.operationType
    ? prop.operationType
    : prop.transaccionTipo
      ? prop.transaccionTipo.toLowerCase()
      : 'venta';
  const status = prop.status
    ? prop.status
    : prop.estado
      ? prop.estado.toLowerCase()
      : 'disponible';

  let normalizedImages = [];
  if (Array.isArray(prop.images) && prop.images.length > 0) {
    normalizedImages = prop.images
      .filter(img => img !== null && img !== undefined)
      .map(img => {
        if (typeof img === 'string') {
          return { url: img, isNew: false };
        }
        return { ...img, isNew: img.isNew || false };
      });
  } else if (Array.isArray(prop.imagenes) && prop.imagenes.length > 0) {
    normalizedImages = prop.imagenes
      .filter(img => img !== null && img !== undefined)
      .map(img => {
        if (typeof img === 'string') {
          return { url: img, isNew: false };
        }
        return { ...img, isNew: img.isNew || false };
      });
  }

  return {
    _id: prop._id || id,
    id,
    idPropiedad: prop.idPropiedad || prop._id || prop.id,
    title: prop.title || prop.titulo || '',
    description: prop.description || prop.descripcion || '',
    address: prop.address || prop.direccion || '',
    neighborhood: prop.neighborhood || prop.barrio || '',
    locality: prop.locality || prop.localidad || '',
    province: prop.province || prop.provincia || '',
    type: prop.type || prop.tipoPropiedad || 'Casa',
    operationType,
    price: prop.price ?? prop.precio ?? '',
    bedrooms: prop.bedrooms ?? prop.habitaciones ?? '',
    bathrooms: prop.bathrooms ?? prop.banos ?? '',
    squareMeters: prop.squareMeters ?? prop.superficieM2 ?? '',
    landSquareMeters: prop.landSquareMeters ?? prop.terrenoM2 ?? '',
    status,
    images: normalizedImages,
    lessor: prop.lessor || prop.locador || '',
    lessee: prop.lessee || prop.locatario || '',
    allowsPets: prop.allowsPets ?? prop.permitenascotas ?? false,
    activo: prop.activo ?? true,
    rules: prop.rules || prop.reglasPropiedad || [],
    amenities: prop.amenities || prop.caracteristicas || [],
    removedImages: []
  };
};

const PropertyManagement = () => {
  const { properties: apiProperties, isLoading, error } = useAdminData('properties');

  const [properties, setProperties] = useState([]);
  const [view, setView] = useState('selection');
  const [selectedOperation, setSelectedOperation] = useState('venta');
  const [editingProperty, setEditingProperty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [formProperty, setFormProperty] = useState(() => createEmptyProperty(selectedOperation));

  useEffect(() => {
    if (apiProperties && apiProperties.length > 0) {
      const normalizedProperties = apiProperties.map(normalizeProperty);
      setProperties(normalizedProperties);
    }
  }, [apiProperties]);

  const [filters, setFilters] = useState({
    operationType: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    priceRange: { min: 0, max: Infinity },
    status: '',
    allowsPets: null,
  });

  const handleOperationSelection = (operation) => {
    setSelectedOperation(operation);
    setView('list');
  };

  const filterProperties = (properties, filters, searchTerm) => {
    return properties.filter((property) => {
      const propertyPrice = typeof property.price === 'string'
        ? parseFloat(property.price.replace(/[^0-9.-]+/g, ""))
        : Number(property.price) || 0;

      const minPrice = Number(filters.priceRange.min) || 0;
      const maxPrice = Number(filters.priceRange.max) === Infinity ? Infinity : Number(filters.priceRange.max);

      const matchesOperation = !filters.operationType || property.operationType === filters.operationType;
      const matchesType = !filters.type || property.type === filters.type;
      const matchesBedrooms = !filters.bedrooms || (property.bedrooms || 0) >= parseInt(filters.bedrooms || '0', 10);
      const matchesBathrooms = !filters.bathrooms || (property.bathrooms || 0) >= parseInt(filters.bathrooms || '0', 10);
      const matchesPriceRange = propertyPrice >= minPrice && propertyPrice <= maxPrice;
      const matchesStatus = !filters.status || property.status === filters.status;
      const matchesPets = filters.allowsPets === null || property.allowsPets === (filters.allowsPets === 'true');
      const matchesSearch = !searchTerm ||
        (property.title && property.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.neighborhood && property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesOperation && matchesType && matchesBedrooms && matchesBathrooms && matchesPriceRange && matchesStatus && matchesPets && matchesSearch;
    });
  };

  const sortProperties = (properties, sortBy) => {
    const sorted = [...properties];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => b.price - a.price);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'date':
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredAndSortedProperties = sortProperties(filterProperties(properties, filters, searchTerm), sortBy);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setView('form');
  };

  const handleEditProperty = (property) => {
    try {
      console.log('Editing property:', property);
      const normalized = normalizeProperty(property);
      console.log('Normalized property:', normalized);
      setEditingProperty(normalized);
      setFormProperty({
        ...normalized,
        images: Array.isArray(normalized.images) && normalized.images.length > 0
          ? normalized.images
          : [null],
        removedImages: []
      });

      setView('form');
    } catch (error) {
      console.error('Error in handleEditProperty:', error);
      showNotification('Error al cargar la propiedad para editar', 'error');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      return;
    }

    try {
      const response = await propertyService.delete(propertyId);
      if (response.status) {
        setProperties(prevProperties =>
          prevProperties.filter(prop => prop.id !== propertyId)
        );
        showNotification('Propiedad eliminada exitosamente');
      } else {
        throw new Error(response.message || 'Error al eliminar la propiedad');
      }
    } catch (error) {
      console.error('Error eliminando propiedad:', error);
      showNotification('Error al eliminar la propiedad', 'error');
    }
  };

  const handleSaveProperty = async (propertyData, imageFiles = [], removedImageIds = []) => {
    setIsSubmitting(true);

    try {
      const isEdit = !!editingProperty;
      const backendData = {
        titulo: propertyData.title,
        descripcion: propertyData.description,
        direccion: propertyData.address,
        barrio: propertyData.neighborhood,
        localidad: propertyData.locality,
        provincia: propertyData.province,
        tipoPropiedad: propertyData.type,
        transaccionTipo: propertyData.operationType === 'venta' ? 'Venta' : 'Alquiler',
        precio: Number(propertyData.price),
        habitaciones: Number(propertyData.bedrooms) || 0,
        banos: Number(propertyData.bathrooms) || 0,
        superficieM2: Number(propertyData.squareMeters) || 0,
        terrenoM2: Number(propertyData.landSquareMeters) || 0,
        estado: propertyData.status === 'disponible' ? 'Disponible' :
          propertyData.status === 'ocupado' ? 'Ocupado' : 'Reservado',
        locador: propertyData.lessor || '',
        locatario: propertyData.lessee || '',
        permitenascotas: propertyData.allowsPets || false,
        activo: true,
        imagenes: Array.isArray(propertyData.images)
          ? propertyData.images.map((img, index) => {
            if (typeof img === 'string') {
              return {
                rutaArchivo: img,
                nombreArchivo: 'image.jpg',
                orden: index
              };
            }
            return {
              rutaArchivo: img.url || img.rutaArchivo,
              nombreArchivo: img.nombreArchivo || 'image.jpg',
              orden: index
            };
          })
          : []
      };

      let response;
      let createdOrUpdatedId;
      let refreshedProperty = null;

      if (isEdit && editingProperty.id) {
        console.log('Updating property:', editingProperty.id, backendData);
        response = await propertyService.update(editingProperty.id, backendData);
        if (response.status) {
          createdOrUpdatedId = editingProperty.id;
          showNotification('Propiedad actualizada correctamente');
        }
      } else {
        console.log('Creating new property:', backendData);
        response = await propertyService.create(backendData);
        if (response.status && response.value) {
          createdOrUpdatedId = response.value._id || response.value.id;
          showNotification('Propiedad creada correctamente');
        }
      }

      if (!response.status) {
        throw new Error(response.message || 'Error al guardar la propiedad');
      }

      const targetPropertyId = createdOrUpdatedId || editingProperty?.id;

      const deletionErrors = [];
      if (targetPropertyId && removedImageIds && removedImageIds.length > 0) {
        for (const imageId of removedImageIds) {
          if (!imageId) continue;
          try {
            await propertyService.deleteImage(targetPropertyId, imageId);
          } catch (deleteErr) {
            console.error('Error eliminando imagen', imageId, deleteErr);
            deletionErrors.push(imageId);
          }
        }
      }

      if (targetPropertyId && imageFiles && imageFiles.length > 0) {
        console.log('Uploading', imageFiles.length, 'images to property:', targetPropertyId);
        try {
          const uploadResp = await propertyService.uploadImages(targetPropertyId, imageFiles);
          if (uploadResp && uploadResp.status) {
            console.log('Images uploaded successfully');

            if (uploadResp.value) {
              setProperties(prevProperties =>
                prevProperties.map(prop =>
                  prop.id === targetPropertyId
                    ? {
                      ...prop,
                      images: uploadResp.value.imagenes || uploadResp.value.images || []
                    }
                    : prop
                )
              );
            }
          } else {
            console.warn('Image upload failed:', uploadResp);
          }
        } catch (uploadErr) {
          console.error('Error uploading images:', uploadErr);
          showNotification('Propiedad guardada pero hubo error al subir imágenes', 'error');
        }
      }

      if (createdOrUpdatedId) {
        try {
          const detailResp = await propertyService.getById(createdOrUpdatedId);
          if (detailResp.status && detailResp.value) {
            refreshedProperty = normalizeProperty(detailResp.value);
          }
        } catch (fetchError) {
          console.warn('No se pudo refrescar la propiedad desde el backend:', fetchError);
        }
      }

      const fallbackNormalized = normalizeProperty({
        ...propertyData,
        id: createdOrUpdatedId,
        _id: createdOrUpdatedId,
        idPropiedad: createdOrUpdatedId,
        terrenoM2: propertyData.landSquareMeters,
        imagenes: (formProperty.images || [])
          .filter(img => !(img instanceof File))
          .filter(Boolean)
      });

      const propertyToStore = refreshedProperty || fallbackNormalized;

      if (editingProperty && editingProperty.id) {
        setProperties(prevProperties =>
          prevProperties.map(prop =>
            prop.id === editingProperty.id ? propertyToStore : prop
          )
        );
      } else {
        setProperties(prevProperties => {
          const withoutPlaceholder = prevProperties.filter(prop => prop.id !== propertyToStore.id);
          return [...withoutPlaceholder, propertyToStore];
        });
      }

      showNotification(editingProperty ? 'Propiedad actualizada exitosamente' : 'Propiedad creada exitosamente');
      setView('list');
      setEditingProperty(null);
      setFormProperty(createEmptyProperty(selectedOperation));

      if (deletionErrors.length > 0) {
        showNotification(`Se guardó la propiedad, pero no se pudieron eliminar ${deletionErrors.length} imágenes.`, 'error');
      }

    } catch (error) {
      console.error('Error guardando propiedad:', error);
      showNotification(`Error al ${editingProperty ? 'actualizar' : 'crear'} la propiedad: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    try {
      setFormProperty(createEmptyProperty(selectedOperation));
      setEditingProperty(null);
      setView('list');
      const path = selectedOperation === 'venta' ? '/admin/propiedades' : '/admin/propiedades/alquiler';
      window.location.href = path;

      setTimeout(() => {
        setEditingProperty(null);
        setFormProperty(createEmptyProperty(selectedOperation));
      }, 100);
    } catch (error) {
      console.error('Error in handleCancelForm:', error);
    }
  };

  const handleUpdateStatus = (propertyId, newStatus, lessor = '', lessee = '') => {
    const updatedProperty = {
      status: newStatus,
      lessor,
      lessee
    };

    setProperties(prevProperties =>
      prevProperties.map(prop =>
        prop.id === propertyId ? { ...prop, ...updatedProperty } : prop
      )
    );

    showNotification(`Estado de propiedad actualizado a ${newStatus}`);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando propiedades...</p>
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
      {view === 'form' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PropertyForm
            key={editingProperty ? `edit-${editingProperty.id || 'new'}` : 'new'}
            property={editingProperty || formProperty}
            editing={!!editingProperty}
            onSave={handleSaveProperty}
            onCancel={handleCancelForm}
            onChange={setFormProperty}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {view === 'selection' && (
        <div className="py-10">
          <OperationSelection onSelect={handleOperationSelection} />
        </div>
      )}

      {view === 'list' && (
        <div>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {selectedOperation === 'venta' ? 'Propiedades en Venta' : 'Propiedades en Alquiler'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Gestiona y administra las propiedades de {selectedOperation}
                </p>
              </div>
              <button
                onClick={() => setView('selection')}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base px-3 py-2 border border-blue-100 hover:border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cambiar operación
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-xl">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, dirección o barrio..."
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
                    <option value="title">Ordenar por Título</option>
                    <option value="price">Ordenar por Precio</option>
                    <option value="date">Ordenar por Fecha</option>
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
                <div className="text-2xl font-bold text-blue-600">
                  {properties.filter(p => p.operationType === selectedOperation).length}
                </div>
                <div className="text-sm font-medium text-blue-800">
                  {selectedOperation === 'venta' ? 'En Venta' : 'En Alquiler'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.operationType === selectedOperation && p.status === 'disponible').length}
                </div>
                <div className="text-sm font-medium text-green-800">Disponibles</div>
                <div className="text-xs text-gray-500 mt-1">
                  {properties.filter(p => p.operationType === selectedOperation).length > 0
                    ? `${Math.round((properties.filter(p => p.operationType === selectedOperation && p.status === 'disponible').length / properties.filter(p => p.operationType === selectedOperation).length) * 100)}%`
                    : '0%'}
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {properties.filter(p => p.operationType === selectedOperation && p.status === 'reservado').length}
                </div>
                <div className="text-sm font-medium text-yellow-800">Reservadas</div>
                <div className="text-xs text-gray-500 mt-1">
                  {properties.filter(p => p.operationType === selectedOperation).length > 0
                    ? `${Math.round((properties.filter(p => p.operationType === selectedOperation && p.status === 'reservado').length / properties.filter(p => p.operationType === selectedOperation).length) * 100)}%`
                    : '0%'}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {properties.filter(p => p.operationType === selectedOperation && p.status === 'ocupado').length}
                </div>
                <div className="text-sm font-medium text-red-800">Ocupadas</div>
                <div className="text-xs text-gray-500 mt-1">
                  {filteredAndSortedProperties.length > 0
                    ? `${Math.round((filteredAndSortedProperties.filter(p => p.status === 'ocupado').length / filteredAndSortedProperties.length) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mb-8">
              <FilterControls filters={filters} onFilterChange={handleFilterChange} />
            </div>
          )}

          <PropertyList
            properties={filteredAndSortedProperties}
            selectedOperation={selectedOperation}
            viewMode={viewMode}
            onAddNew={handleAddProperty}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      )}

      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'error'
          ? 'bg-red-100 border border-red-400 text-red-700'
          : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-lg font-semibold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PropertyManagement;