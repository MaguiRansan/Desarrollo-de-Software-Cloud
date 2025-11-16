import { FaUsers, FaCalendarAlt, FaPlus, FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaCalendarCheck, FaClock, FaMoneyBill, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, isWithinInterval, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

import { API_BASE_URL } from '../../../config/apiConfig';

const mapStatus = (statusFromForm) => {
  if (!statusFromForm) return 'disponible';
  const lowerStatus = statusFromForm.toLowerCase();
  if (lowerStatus === 'disponible') return 'disponible';
  if (lowerStatus === 'reservado') return 'reservado_temp';
  return lowerStatus;
};

const TemporaryPropertyList = ({ properties, viewMode = 'grid', onAddNew, onEdit, onDelete, onUpdateStatus }) => {
  console.log('Propiedades recibidas en TemporaryPropertyList:', properties);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  
  const [availabilityData, setAvailabilityData] = useState({
    estado: 'disponible', 
    availability: []      
  });
  
  const [clientName, setClientName] = useState('');
  const [reservationDeposit, setReservationDeposit] = useState('');
  const [reservationGuests, setReservationGuests] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSeason, setNewSeason] = useState({
    startDate: '',
    endDate: '',
    percentage: '',
    description: ''
  });
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadPropertyAvailability = async () => {
      if (!selectedProperty) {
        setAvailabilityData({ estado: 'disponible', availability: [] });
        return;
      }

      try {
        const propertyId = selectedProperty._id || selectedProperty.id;
        if (!propertyId) {
          console.error('No property ID available');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/Propiedad/Disponibilidad/${propertyId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }) 
          }
        });

        if (!response.ok) {
          let errorMsg = `Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || 'Error al cargar la disponibilidad';
          } catch (e) {
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        
        if (data.status && data.value) {
          setAvailabilityData({
            estado: data.value.estado || 'disponible',
            availability: data.value.availability || []
          });
        } else {
          throw new Error(data.message || 'La respuesta del servidor no fue válida');
        }
      } catch (error) {
        console.error('Error loading availability:', error);
        toast.error(error.message);
        setAvailabilityData({ estado: 'disponible', availability: [] });
      }
    };

    loadPropertyAvailability();
  }, [selectedProperty]); 

  
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const filteredProperties = propertiesArray.filter(property => {
    if (!property || typeof property !== 'object' || !property.title) {
        return false;
    }
    const searchTermLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchTermLower) ||
      (property.address && property.address.toLowerCase().includes(searchTermLower)) ||
      (property.neighborhood && property.neighborhood.toLowerCase().includes(searchTermLower))
    );
  });

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    setClientName('');
    setReservationDeposit(''); 
    setReservationGuests(''); 
    setCurrentImageIndex(0);
    setSelectedDates({ startDate: null, endDate: null }); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setClientName('');
    setReservationDeposit('');
    setReservationGuests('');
    setShowSeasonForm(false);
    setNewSeason({
      startDate: '',
      endDate: '',
      percentage: '',
      description: ''
    });
    setCurrentImageIndex(0);
  };

  const handleSeasonChange = (e) => {
    const { name, value } = e.target;
    setNewSeason(prev => ({
      ...prev,
      [name]: name === 'percentage' ? value.replace(/[^0-9-]/g, '') : value
    }));
  };

  const handleAddSeason = (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    
    setIsSubmitting(true);
    
    const updatedProperty = {
      ...selectedProperty,
      seasonalPrices: [
        ...(selectedProperty.seasonalPrices || []),
        {
          ...newSeason,
          id: Date.now(), 
          percentage: parseFloat(newSeason.percentage)
        }
      ]
    };
    
    setSelectedProperty(updatedProperty); 
    
    setShowSeasonForm(false);
    setNewSeason({
      startDate: '',
      endDate: '',
      percentage: '',
      description: ''
    });
    setIsSubmitting(false);
    toast.info("Ajuste de temporada añadido localmente. Recuerda guardar la propiedad.");
  };

  const handleDeleteSeason = (seasonId) => {
    if (!selectedProperty || !window.confirm('¿Estás seguro de que deseas eliminar este ajuste de temporada?')) {
      return;
    }
    
    const updatedSeasons = (selectedProperty.seasonalPrices || []).filter(season => 
      season.id !== seasonId
    );
    
    const updatedProperty = {
      ...selectedProperty,
      seasonalPrices: updatedSeasons
    };
    
    setSelectedProperty(updatedProperty);
    toast.info("Ajuste de temporada eliminado localmente. Recuerda guardar la propiedad.");
  };


  const isDateBooked = (date) => {
    const checkDate = date instanceof Date ? date : new Date(date);
    
    return availabilityData.availability && availabilityData.availability.some(range => {
      if (!range || !range.startDate || !range.endDate) return false;
      
      try {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);
        
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const isInRange = isWithinInterval(checkDate, { start: startDate, end: endDate });
        const isBookedStatus = range.status && ['reservado_temp', 'ocupado_temp'].includes(range.status);
        
        return isInRange && isBookedStatus;
      } catch (error) {
        console.error('Error checking if date is booked:', error, range);
        return false;
      }
    });
  };
  
  const isDateAvailable = (date) => {
    const checkDate = date instanceof Date ? date : new Date(date);
    
    return availabilityData.availability && availabilityData.availability.some(range => {
      if (!range || !range.startDate || !range.endDate) return false;
      
      try {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const isInRange = isWithinInterval(checkDate, { start: startDate, end: endDate });
        const isAvailableStatus = range.status === 'disponible';
        
        return isInRange && isAvailableStatus;
      } catch (error) {
        console.error('Error checking if date is available:', error, range);
        return false;
      }
    });
  };

  const isRangeBooked = (start, end) => {
    if (!start || !end) return false;
    let currentDate = new Date(start);
    const finalEndDate = new Date(end);

    while (isBefore(currentDate, finalEndDate) || currentDate.getTime() === finalEndDate.getTime()) {
      if (isDateBooked(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };
  
  const isRangeFullyAvailable = (start, end) => {
    if (!start || !end) return false;
    let currentDate = new Date(start);
    const finalEndDate = new Date(end);
    
    if (!availabilityData.availability || availabilityData.availability.length === 0) {
      return false;
    }

    while (isBefore(currentDate, finalEndDate) || currentDate.getTime() === finalEndDate.getTime()) {
      if (!isDateAvailable(currentDate)) {
        return false; 
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };
  
  const sendAvailabilityUpdate = async (status, startDate, endDate, clientName, deposit, guests) => {
    if (!selectedProperty) return;

    try {
      const propertyId = selectedProperty._id || selectedProperty.id;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/Propiedad/Disponibilidad/${propertyId}`, {
        method: 'PUT', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          clientName: clientName || '',
          deposit: parseFloat(deposit) || 0,
          guests: parseInt(guests) || 1,
          status: status 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la disponibilidad');
      }

      const data = await response.json();
      
      if (data.status) {
        setAvailabilityData({
          estado: data.value.estado,
          availability: data.value.availability || []
        });
        
        setSelectedProperty(prev => ({
          ...prev,
          estado: data.value.estado,
          availability: data.value.availability
        }));

        setClientName('');
        setSelectedDates({ startDate: null, endDate: null });
        setReservationDeposit('');
        setReservationGuests('');
        
        return true; 
      } else {
        throw new Error(data.message || 'Error al guardar la disponibilidad');
      }
    } catch (error) {
      console.error(`Error en sendAvailabilityUpdate (status: ${status}):`, error);
      toast.error(error.message);
      return false; 
    }
  };


  const handleReserveProperty = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Por favor seleccione un rango de fechas.');
      return;
    }
    if (!clientName || !reservationGuests) {
      toast.error('Por favor complete el Nombre del Cliente y el Número de Huéspedes.');
      return;
    }
    if (isRangeBooked(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: El rango seleccionado se superpone con fechas que ya están reservadas u ocupadas.');
      return;
    }
    if (!isRangeFullyAvailable(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: Solo puede reservar u ocupar fechas que estén explícitamente marcadas como "Disponibles".');
      return;
    }
    
    const success = await sendAvailabilityUpdate(
      'reservado_temp',
      selectedDates.startDate,
      selectedDates.endDate,
      clientName,
      reservationDeposit,
      reservationGuests
    );

    if (success) {
      toast.success('Propiedad reservada exitosamente');
    }
  };

  const handleOccupyProperty = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Por favor seleccione un rango de fechas.');
      return;
    }
    if (!clientName || !reservationGuests) {
      toast.error('Por favor complete el Nombre del Cliente y el Número de Huéspedes.');
      return;
    }
    if (isRangeBooked(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: El rango seleccionado se superpone con fechas que ya están reservadas u ocupadas.');
      return;
    }
    if (!isRangeFullyAvailable(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: Solo puede reservar u ocupar fechas que estén explícitamente marcadas como "Disponibles".');
      return;
    }

    const success = await sendAvailabilityUpdate(
      'ocupado_temp',
      selectedDates.startDate,
      selectedDates.endDate,
      clientName,
      reservationDeposit,
      reservationGuests
    );

    if (success) {
      toast.success('Ocupación registrada exitosamente');
    }
  };
  
  const handleSetAvailable = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Por favor seleccione un rango de fechas para marcar como disponible.');
      return;
    }

    if (isRangeBooked(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: El rango seleccionado se superpone con fechas que ya están reservadas u ocupadas.');
      return;
    }

    const success = await sendAvailabilityUpdate(
      'disponible',
      selectedDates.startDate,
      selectedDates.endDate,
      '', 0, 0 
    );

    if (success) {
      toast.success('Rango de fechas marcado como disponible');
    }
  };
  
  const renderDayContents = (day, date) => {
    const baseClasses = "rounded-full w-9 h-9 flex items-center justify-center";
    
    if (isDateBooked(date)) {
      return <div className={`bg-red-100 text-red-800 ${baseClasses}`}>{day}</div>;
    }
    if (isDateAvailable(date)) {
      return <div className={`bg-green-100 text-green-800 ${baseClasses}`}>{day}</div>;
    }
    return <div className={`text-gray-400 ${baseClasses}`}>{day}</div>;
  };
  
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    
    const startDate = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
    const endDate = end ? new Date(end.setHours(23, 59, 59, 999)) : null;
    
    setSelectedDates({ 
      startDate: startDate,
      endDate: endDate 
    });
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? (selectedProperty.images?.length || 1) - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === (selectedProperty.images?.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

  const renderPropertyImage = (property) => {
    const images = property.images || [];
    if (images.length > 0) {
      const firstImage = images[0];
      
      const imageUrl = (typeof firstImage === 'object' && firstImage !== null) 
        ? (firstImage.rutaArchivo || firstImage.url) 
        : (typeof firstImage === 'string' ? firstImage : null);
      
      if (imageUrl) {
        return (
          <img
            src={imageUrl}
            alt={property.title || 'Propiedad sin título'}
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300";
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
    <div className="temporary-property-list">
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, dirección, barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => {
            if (!property || typeof property !== 'object') {
              console.error(`Invalid property at index ${index}:`, property);
              return null;
            }
            
            const propertyId = property.id || property._id || `property-${index}`;
            const propertyTitle = property.title || 'Sin título';
            const currentStatus = mapStatus(property.estado || property.status || 'disponible');
            const displayPrice = property.price || property.precioPorNoche || property.pricePerWeek || property.pricePerMonth || 0;
            const priceDescription = (property.price || property.precioPorNoche) ? 'por noche' : (property.pricePerWeek ? 'por semana' : (property.pricePerMonth ? 'por mes' : ''));
            
            return (
              <div
                key={propertyId}
                className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${
                  currentStatus === 'ocupado_temp' ? 'opacity-80 border-l-4 border-red-500' : ''
                } ${
                  currentStatus === 'reservado_temp' ? 'border-l-4 border-yellow-400' : ''
                }`}
              >
                {renderPropertyImage(property)}
                
                <div className="p-6">
                  <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{propertyTitle}</h3>
                    <p className="text-gray-600 flex items-center mb-1">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      {property.address || property.direccion}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(property.neighborhood || property.barrio) && `${property.neighborhood || property.barrio}, `}
                      {(property.locality || property.localidad) && `${property.locality || property.localidad}, `}
                      {property.province || property.provincia}
                    </p>  
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-green-600 font-bold text-xl">${displayPrice ? displayPrice.toLocaleString() : 'N/A'}</span>
                      
                      {currentStatus === 'ocupado_temp' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimes className="w-3 h-3 mr-1" />
                          Ocupado
                        </span>
                      )}
                      {currentStatus === 'reservado_temp' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaClock className="w-3 h-3 mr-1" />
                          Reservado
                        </span>
                      )}
                      {currentStatus === 'disponible' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="w-3 h-3 mr-1" />
                          Disponible
                        </span>
                      )}
                    </div>
                    {priceDescription && (
                      <span className="text-sm text-gray-500 mt-1">{priceDescription}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-gray-600 mb-6 text-sm">
                    <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                      <FaBed className="text-blue-500 mb-1" />
                      <span>{property.bedrooms || property.habitaciones || 0} dorm.</span>
                    </span>
                    <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                      <FaBath className="text-blue-500 mb-1" />
                      <span>{property.bathrooms || property.banos || 0} baños</span>
                    </span>
                    <span className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                      <FaRulerCombined className="text-blue-500 mb-1" />
                      <span>{property.squareMeters || property.superficieM2 || 0} m²</span>
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(property)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition duration-300"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(propertyId)}
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
            )
          })}
          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No se encontraron propiedades temporarias.
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredProperties.map((property) => {
            const propertyId = property.id || property._id;
            const propertyTitle = property.title || 'Sin título';
            const currentStatus = mapStatus(property.estado || property.status || 'disponible');
            const displayPrice = property.price || property.precioPorNoche || property.pricePerWeek || property.pricePerMonth || 0;
            const priceDescription = (property.price || property.precioPorNoche) ? 'por noche' : (property.pricePerWeek ? 'por semana' : (property.pricePerMonth ? 'por mes' : ''));

            return (
              <div
                key={propertyId}
                className={`bg-white rounded-xl shadow-lg overflow-hidden flex ${
                  currentStatus === 'ocupado_temp' ? 'bg-red-50' : ''
                } ${
                  currentStatus === 'reservado_temp' ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="w-48 h-32 flex-shrink-0">
                  {renderPropertyImage(property)}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{propertyTitle}</h3>
                      <p className="text-gray-600 flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        {property.address || property.direccion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(property.neighborhood || property.barrio) && `${property.neighborhood || property.barrio}, `}
                        {(property.locality || property.localidad) && `${property.locality || property.localidad}, `}
                        {property.province || property.provincia}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-bold text-xl">${displayPrice ? displayPrice.toLocaleString() : 'N/A'}</span>
                      {priceDescription && (
                        <p className="text-sm text-gray-500">{priceDescription}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-6 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <FaBed className="mr-1 text-blue-500" />
                      {property.bedrooms || property.habitaciones || 0} dorm.
                    </span>
                    <span className="flex items-center">
                      <FaBath className="mr-1 text-blue-500" />
                      {property.bathrooms || property.banos || 0} baños
                    </span>
                    <span className="flex items-center">
                      <FaRulerCombined className="mr-1 text-blue-500" />
                      {property.squareMeters || property.superficieM2 || 0} m²
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {currentStatus === 'ocupado_temp' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Ocupado
                        </span>
                      )}
                      {currentStatus === 'reservado_temp' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Reservado
                        </span>
                      )}
                      {currentStatus === 'disponible' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Disponible
                        </span>
                      )}
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
                        onClick={() => onDelete(propertyId)}
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
            );
          })}
          {filteredProperties.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron propiedades temporarias.
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl p-6 overflow-y-auto max-h-[95vh]">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{selectedProperty.title || selectedProperty.titulo}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              
              <div className="lg:col-span-2 space-y-4">
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[400px] flex items-center justify-center shadow-lg">
                  {(selectedProperty.images && selectedProperty.images.length > 0) ? (
                    <>
                      <img
                        src={(typeof selectedProperty.images[currentImageIndex] === 'object' && selectedProperty.images[currentImageIndex] !== null) ? 
                             (selectedProperty.images[currentImageIndex].rutaArchivo || selectedProperty.images[currentImageIndex].url) :
                             selectedProperty.images[currentImageIndex]}
                        alt={`Imagen ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x400";
                        }}
                      />
                      {selectedProperty.images.length > 1 && (
                        <>
                          <button
                            onClick={goToPreviousImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75 transition"
                          >
                            <FaChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={goToNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none hover:bg-opacity-75 transition"
                          >
                            <FaChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {selectedProperty.images.map((_, idx) => (
                              <span
                                key={idx}
                                className={`block w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-400 opacity-75'}`}
                              ></span>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-lg">Sin imágenes disponibles</span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mt-6">Información General</h3>
                <div className="grid grid-cols-2 gap-y-2 text-gray-600 text-base">
                  <p><span className="font-semibold">Dirección:</span> {selectedProperty.address || selectedProperty.direccion}</p>
                  <p><span className="font-semibold">Tipo:</span> {selectedProperty.type || selectedProperty.tipoPropiedad}</p>
                  <p><span className="font-semibold">Localidad:</span> {selectedProperty.locality || selectedProperty.localidad}</p>
                  <p><span className="font-semibold">Barrio:</span> {selectedProperty.neighborhood || selectedProperty.barrio}</p>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mt-6">Servicios Incluidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {(selectedProperty.services || selectedProperty.servicios)?.map((service, index) => (
                    <div key={index} className="flex items-center text-base text-gray-700">
                      <FaCheck className="text-blue-500 mr-2 text-sm" />
                      <span>{service}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-base">No se han especificado servicios.</p>
                  )}
                </div>

                <div className="p-4 border rounded-lg bg-white shadow">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> Calendario de Disponibilidad
                  </h3>
                  
                  <div className="mb-4">
                    <DatePicker
                      selected={selectedDates.startDate}
                      onChange={handleDateChange}
                      startDate={selectedDates.startDate}
                      endDate={selectedDates.endDate}
                      selectsRange
                      inline
                      locale={es}
                      minDate={new Date()}
                      renderDayContents={renderDayContents}
                      className="border rounded-lg p-2 w-full"
                      monthsShown={2}
                    />
                    
                    <div className="flex items-center mt-2 text-base">
                      <div className="flex items-center mr-4">
                        <div className="w-4 h-4 bg-green-100 rounded-full mr-1"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <div className="w-4 h-4 bg-red-100 rounded-full mr-1"></div>
                        <span>Ocupado/Reservado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded-full mr-1"></div>
                        <span>No disponible</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nombre del Cliente (Obligatorio)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-3 border rounded text-base focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Seña ($) (Opcional)"
                          value={reservationDeposit}
                          onChange={(e) => setReservationDeposit(e.target.value)}
                          className="w-full p-3 border rounded text-base focus:ring-blue-500 focus:border-blue-500 pl-10"
                        />
                        <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Huéspedes (Obligatoratorio)"
                          value={reservationGuests}
                          onChange={(e) => setReservationGuests(e.target.value)}
                          className="w-full p-3 border rounded text-base focus:ring-blue-500 focus:border-blue-500 pl-10"
                          min="1"
                        />
                        <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        onClick={handleReserveProperty}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-base transition duration-300"
                        title="Reservar fechas seleccionadas"
                      >
                        <FaCalendarCheck />
                        <span>Reservar</span>
                      </button>
                      
                      <button
                        onClick={handleOccupyProperty}
                        className="bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-base transition duration-300"
                        title="Marcar como ocupado"
                      >
                        <FaTimes />
                        <span>Ocupar</span>
                      </button>
                      
                      <button
                        onClick={handleSetAvailable}
                        className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-base transition duration-300"
                        title="Marcar como disponible"
                      >
                        <FaCheck />
                        <span>Disponible</span>
                      </button>
                    </div>
                    
                    {selectedDates.startDate && selectedDates.endDate && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg text-base">
                        <p className="font-semibold">Rango seleccionado:</p>
                        <p>{format(selectedDates.startDate, 'PPP', { locale: es })} - {format(selectedDates.endDate, 'PPP', { locale: es })}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          ({Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24))} noches)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white shadow">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <FaCalendarCheck className="mr-2 text-blue-500" /> Reservas y Ocupaciones
                  </h3>
                  
                  {availabilityData.availability && availabilityData.availability.filter(r => r.status !== 'disponible').length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {availabilityData.availability
                        .filter(range => range.status !== 'disponible') 
                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                        .map((range) => (
                          <div 
                            key={range.id || range._id}
                            className={`p-4 rounded-lg ${range.status === 'reservado_temp' ? 'bg-yellow-50' : 'bg-red-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-lg">
                                  {format(parseISO(range.startDate), 'PPP', { locale: es })} - {format(parseISO(range.endDate), 'PPP', { locale: es })}
                                </p>
                                <p className="text-base">
                                  {`${range.clientName || 'Sin nombre'} (${range.status === 'reservado_temp' ? 'Reservado' : 'Ocupado'})`}
                                </p>
                                
                                {range.status !== 'disponible' && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="mr-4">
                                      <FaUsers className="inline w-4 h-4 mr-1" />{range.guests || 1}
                                    </span>
                                    <span>
                                      <FaMoneyBillWave className="inline w-4 h-4 mr-1" />Seña: ${range.deposit ? range.deposit.toLocaleString() : '0'}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <button 
                                onClick={() => {
                                  if (window.confirm('¿Está seguro de que desea eliminar este rango de fechas?')) {
                                    toast.info('La eliminación de rangos individuales debe implementarse en el backend (DELETE /Disponibilidad/:id/:rangeId).');
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Eliminar"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-base">No hay reservas u ocupaciones registradas.</p>
                  )}
                </div>

              </div>

              <div className="lg:col-span-1 space-y-4">

                <div className="p-4 rounded-lg shadow-inner bg-gray-50">
                  <h3 className="text-xl font-bold mb-3 flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" /> Disponibilidad</h3>
                  <div className="space-y-2 text-base">
                    <p><span className="font-semibold">Entrada:</span> {selectedProperty.checkInTime || '14:00'}</p>
                    <p><span className="font-semibold">Salida:</span> {selectedProperty.checkOutTime || '10:00'}</p>
                    <p><span className="font-semibold">Estadía mínima:</span> {selectedProperty.minimumStay || 1} {selectedProperty.minimumStay > 1 ? 'noches' : 'noche'}</p>
                    {selectedProperty.availableFrom && (
                      <p><span className="font-semibold">Disponible desde:</span> {new Date(selectedProperty.availableFrom).toLocaleDateString()}</p>
                    )}
                    {selectedProperty.availableTo && (
                      <p><span className="font-semibold">Disponible hasta:</span> {new Date(selectedProperty.availableTo).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <h3 className="text-xl font-bold mb-3 flex items-center"><FaCalendarCheck className="mr-2 text-blue-500" /> Estado Actual</h3>
                    <div className="text-center">
                      {mapStatus(selectedProperty.estado) === 'disponible' && (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-medium bg-green-100 text-green-800">Disponible</span>
                      )}
                      {mapStatus(selectedProperty.estado) === 'reservado_temp' && (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-medium bg-yellow-100 text-yellow-800">Reservado</span>
                      )}
                      {mapStatus(selectedProperty.estado) === 'ocupado_temp' && (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-medium bg-red-100 text-red-800">Ocupado</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow">
                  <h3 className="text-xl font-bold mb-3 flex items-center"><FaMoneyBill className="mr-2 text-blue-500" /> Precios y Moneda</h3>
                  <div className="space-y-2 text-gray-700 text-base">
                    <div className="flex justify-between">
                      <span className="font-semibold">Moneda:</span>
                      <span>{selectedProperty.currency || 'ARS'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Precio por Noche:</span>
                      <span>${(selectedProperty.price || selectedProperty.precioPorNoche)?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Precio por Semana:</span>
                      <span>${(selectedProperty.pricePerWeek || selectedProperty.precioPorSemana)?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Precio por Mes:</span>
                      <span>${(selectedProperty.pricePerMonth || selectedProperty.precioPorMes)?.toLocaleString() || 'N/A'}</span>
                    </div>
                    {selectedProperty.cleaningFee > 0 && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Limpieza:</span>
                        <span>${selectedProperty.cleaningFee?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedProperty.securityDeposit > 0 && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Depósito de Seguridad:</span>
                        <span>${selectedProperty.securityDeposit?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mt-4 mb-2 border-t pt-3 flex items-center"><FaTag className="mr-2 text-blue-500" /> Ajustes por Temporada</h3>
                  
                  {(selectedProperty.seasonalPrices || []).map((season, index) => (
                    <div key={season.id || index} className="p-3 bg-gray-100 rounded-md mb-2 flex justify-between items-center text-base">
                      <div>
                        <p className="font-semibold">{season.description}</p>
                        <p className="text-sm">{season.startDate} a {season.endDate}</p>
                        <p className={`font-bold ${season.percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>{season.percentage}%</p>
                      </div>
                      <button onClick={() => handleDeleteSeason(season.id)} className="text-red-500 hover:text-red-700 p-1">
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => setShowSeasonForm(!showSeasonForm)} className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg flex items-center justify-center space-x-2 transition duration-300 text-base">
                    <FaPlus />
                    <span>{showSeasonForm ? 'Cerrar Formulario' : 'Añadir Ajuste'}</span>
                  </button>

                  {showSeasonForm && (
                    <form onSubmit={handleAddSeason} className="mt-4 space-y-3 p-3 border rounded-lg bg-gray-50">
                      <input name="description" value={newSeason.description} onChange={handleSeasonChange} placeholder="Descripción (Ej: Alta Temporada)" className="w-full p-2 border rounded text-base" required />
                      <input name="startDate" value={newSeason.startDate} onChange={handleSeasonChange} type="date" className="w-full p-2 border rounded text-base" required />
                      <input name="endDate" value={newSeason.endDate} onChange={handleSeasonChange} type="date" className="w-full p-2 border rounded text-base" required />
                      <input name="percentage" value={newSeason.percentage} onChange={handleSeasonChange} placeholder="Ajuste % (Ej: 10 o -5)" className="w-full p-2 border rounded text-base" type="number" required />
                      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400 text-base">
                        {isSubmitting ? 'Guardando...' : 'Guardar Ajuste'}
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>

            <div className="flex space-x-2 mt-6 border-t pt-4">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition duration-300 text-lg font-medium"
              >
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default TemporaryPropertyList;