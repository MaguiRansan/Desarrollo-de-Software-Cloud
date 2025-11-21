import { FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaCalendarCheck, FaClock, FaMoneyBill, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

import { API_BASE_URL } from '../../../config/apiConfig';

const mapStatus = (statusFromForm) => {
  if (!statusFromForm) return 'disponible';
  const lowerStatus = statusFromForm.toLowerCase();
  if (lowerStatus === 'disponible') return 'disponible';
  if (lowerStatus === 'no disponible') return 'no disponible';
  return lowerStatus;
};

const TemporaryPropertyList = ({ properties, viewMode = 'grid', onAddNew, onEdit, onDelete, onUpdateStatus }) => {
  console.log('Propiedades recibidas en TemporaryPropertyList:', properties);
  const [searchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [availabilityData, setAvailabilityData] = useState({
    estado: 'disponible',
    availability: []
  });

  const [clientName, setClientName] = useState('');
  const [reservationDeposit, setReservationDeposit] = useState('');
  const [reservationGuests, setReservationGuests] = useState('');

  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
    status: 'disponible'
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [datePickerKey, setDatePickerKey] = useState(0);

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

        const token = sessionStorage.getItem('authToken');
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
          const availability = data.value.availability || data.value.disponibilidad || [];

          const normalizedAvailability = availability.map(range => ({
            ...range,
            status: range.status ? String(range.status).toLowerCase() : 'disponible'
          }));

          setAvailabilityData({
            estado: data.value.estado || 'disponible',
            availability: normalizedAvailability
          });
          setDatePickerKey(prev => prev + 1);
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
    setDatePickerKey(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setClientName('');
    setReservationDeposit('');
    setReservationGuests('');

    setCurrentImageIndex(0);
  };


  const handleDeleteRange = async (rangeId) => {
    if (!selectedProperty) return;

    const rangeToDelete = (selectedProperty.availability || []).find(
      range => (range.id === rangeId || range._id?.toString() === rangeId)
    );

    if (!rangeToDelete) return;

    const isAvailable = rangeToDelete.status?.toLowerCase() === 'disponible';

    let confirmMessage = `¿Está seguro de que desea eliminar este rango de fechas?\n\n` +
      `Del ${format(new Date(rangeToDelete.startDate), 'dd/MM/yyyy')} al ${format(new Date(rangeToDelete.endDate), 'dd/MM/yyyy')}\n\n`;

    if (!isAvailable) {
      confirmMessage += `• 'Aceptar' para marcar como disponible\n`;
    }
    confirmMessage += `• 'Cancelar' para no hacer cambios`;

    const userConfirmed = window.confirm(confirmMessage);

    if (!userConfirmed) return;

    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      const deleteResponse = await fetch(`${API_BASE_URL}/Propiedad/Disponibilidad/${selectedProperty.id || selectedProperty._id}/${rangeId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json().catch(() => ({}));

        if (deleteResponse.status === 401) {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userData');
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }

        throw new Error(errorData.message || 'Error al eliminar el rango de fechas');
      }

      if (!isAvailable) {
        const markAvailableResponse = await fetch(`${API_BASE_URL}/Propiedad/Disponibilidad/${selectedProperty.id || selectedProperty._id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startDate: rangeToDelete.startDate,
            endDate: rangeToDelete.endDate,
            status: 'disponible',
            clientName: '',
            deposit: 0,
            guests: 1
          })
        });

        if (!markAvailableResponse.ok) {
          const errorData = await markAvailableResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al marcar las fechas como disponibles');
        }
      }

      const updatedAvailability = (selectedProperty.availability || []).filter(
        range => range.id !== rangeId && range._id?.toString() !== rangeId
      );

      setSelectedProperty(prev => ({
        ...prev,
        availability: updatedAvailability,
        disponibilidad: updatedAvailability
      }));

      setAvailabilityData(prev => ({
        ...prev,
        availability: updatedAvailability
      }));

      toast.success('Rango de fechas eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el rango:', error);
      toast.error(error.message || 'Error al eliminar el rango de fechas');
    }
  };


  const isDateOccupied = (date) => {
    if (!date) return false;
    const checkDate = date;

    if (!availabilityData.availability || !Array.isArray(availabilityData.availability)) {
      return false;
    }

    return availabilityData.availability.some(range => {
      if (!range || !range.startDate || !range.endDate) return false;

      try {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        const isInRange = checkDate >= startDate && checkDate <= endDate;
        const statusLower = String(range.status || '').toLowerCase();
        const isOccupiedStatus = statusLower === 'ocupado_temp' || statusLower === 'ocupado';

        return isInRange && isOccupiedStatus;
      } catch (error) {
        console.error('Error checking if date is occupied:', error, range);
        return false;
      }
    });
  };

  const isDateReserved = (date) => {
    if (!date) return false;
    const checkDate = date;

    if (!availabilityData.availability || !Array.isArray(availabilityData.availability)) {
      return false;
    }

    return availabilityData.availability.some(range => {
      if (!range || !range.startDate || !range.endDate) return false;

      try {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        const isInRange = checkDate >= startDate && checkDate <= endDate;
        const statusLower = String(range.status || '').toLowerCase();
        const isReservedStatus = statusLower === 'reservado_temp' || statusLower === 'reservado';

        return isInRange && isReservedStatus;
      } catch (error) {
        console.error('Error checking if date is reserved:', error, range);
        return false;
      }
    });
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const checkDate = date;

    if (!availabilityData.availability || !Array.isArray(availabilityData.availability)) {
      return false;
    }

    return availabilityData.availability.some(range => {
      if (!range || !range.startDate || !range.endDate) return false;

      try {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        const isInRange = checkDate >= startDate && checkDate <= endDate;
        const statusLower = String(range.status || '').toLowerCase();
        const isAvailableStatus = statusLower === 'disponible';

        return isInRange && isAvailableStatus;
      } catch (error) {
        console.error('Error checking if date is available:', error, range);
        return false;
      }
    });
  };

  const isDateBooked = (date) => {
    return isDateOccupied(date) || isDateReserved(date);
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
  const isRangeOccupied = (start, end) => {
    if (!start || !end) return false;
    let currentDate = new Date(start);
    const finalEndDate = new Date(end);

    while (isBefore(currentDate, finalEndDate) || currentDate.getTime() === finalEndDate.getTime()) {
      if (isDateOccupied(currentDate)) { // Usa el helper que ya existe
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  const isRangeBookableOrOccupiable = (start, end) => {
    if (!start || !end) return false;
    let currentDate = new Date(start);
    const finalEndDate = new Date(end);

    if (!availabilityData.availability || availabilityData.availability.length === 0) {
      return false;
    }

    while (isBefore(currentDate, finalEndDate) || currentDate.getTime() === finalEndDate.getTime()) {
      const isAvailable = isDateAvailable(currentDate);
      const isReserved = isDateReserved(currentDate);

      if (!isAvailable && !isReserved) {
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
      const token = sessionStorage.getItem('authToken');

      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

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
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userData');
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }

        throw new Error(errorData.message || 'Error al actualizar la disponibilidad');
      }

      const data = await response.json();

      if (data.status) {
        const availability = data.value.availability || data.value.disponibilidad || [];
        console.log('Availability actualizada:', availability);
        console.log('Estado actualizado:', data.value.estado);

        const normalizedAvailability = availability.map(range => ({
          ...range,
          status: range.status ? String(range.status).toLowerCase() : 'disponible'
        }));

        setAvailabilityData({
          estado: data.value.estado || 'disponible',
          availability: normalizedAvailability
        });

        setSelectedProperty(prev => ({
          ...prev,
          estado: data.value.estado || 'disponible',
          availability: normalizedAvailability,
          disponibilidad: normalizedAvailability
        }));

        setClientName('');
        setSelectedDates({ startDate: null, endDate: null });
        setReservationDeposit('');
        setReservationGuests('');

        setDatePickerKey(prev => prev + 1);

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

    const maxGuests = parseInt(selectedProperty.capacity || selectedProperty.capacidadPersonas || 1);
    if (parseInt(reservationGuests) > maxGuests) {
      toast.error(`La cantidad de huéspedes supera la capacidad máxima de la propiedad (${maxGuests}).`);
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
      setClientName('');
      setReservationDeposit('');
      setReservationGuests('');
      setSelectedDates({ startDate: null, endDate: null });
      toast.success('Propiedad reservada correctamente');
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

    const maxGuests = parseInt(selectedProperty.capacity || selectedProperty.capacidadPersonas || 1);
    if (parseInt(reservationGuests) > maxGuests) {
      toast.error(`La cantidad de huéspedes supera la capacidad máxima de la propiedad (${maxGuests}).`);
      return;
    }

    if (isRangeOccupied(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: El rango seleccionado se superpone con fechas que ya están ocupadas.');
      return;
    }
    if (!isRangeBookableOrOccupiable(selectedDates.startDate, selectedDates.endDate)) {
      toast.error('Error: Solo puede ocupar fechas que estén explícitamente marcadas como "Disponibles" o "Reservadas".');
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
      setClientName('');
      setReservationDeposit('');
      setReservationGuests('');
      setSelectedDates({ startDate: null, endDate: null });
      toast.success('Propiedad marcada como ocupada correctamente');
    }
  };

  const handleSetAvailable = async () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast.error('Por favor seleccione un rango de fechas.');
      return;
    }

    const success = await sendAvailabilityUpdate(
      'disponible',
      selectedDates.startDate,
      selectedDates.endDate,
      '',
      0,
      1
    );

    if (success) {
      setClientName('');
      setReservationDeposit('');
      setReservationGuests('');
      setSelectedDates({ startDate: null, endDate: null });
      toast.success('Rango de fechas marcado como disponible correctamente');
    }
  };
  const handleDeleteDate = async (date) => {
    if (!selectedProperty || !date) return;

    const formattedDate = format(date, 'yyyy-MM-dd');

    const isBooked = isDateOccupied(date) || isDateReserved(date);
    const confirmMessage = isBooked
      ? `¿Está seguro de que desea marcar el día ${format(date, 'dd/MM/yyyy')} como disponible?`
      : `¿Está seguro de que desea marcar el día ${format(date, 'dd/MM/yyyy')} como no disponible?`;

    if (window.confirm(confirmMessage)) {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
        }

        const response = await fetch(`${API_BASE_URL}/Propiedad/Disponibilidad/${selectedProperty.id || selectedProperty._id}/date/${formattedDate}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al actualizar la fecha');
        }

        const data = await response.json();

        if (data.status && data.value) {
          const availability = data.value.availability || data.value.disponibilidad || [];

          const normalizedAvailability = availability.map(range => ({
            ...range,
            status: range.status ? String(range.status).toLowerCase() : 'disponible'
          }));

          setAvailabilityData(prev => ({
            ...prev,
            availability: normalizedAvailability
          }));

          setSelectedProperty(prev => ({
            ...prev,
            availability: normalizedAvailability,
            disponibilidad: normalizedAvailability
          }));

          setDatePickerKey(prev => prev + 1);

          toast.success('Fecha actualizada correctamente');
        } else {
          throw new Error(data.message || 'La respuesta del servidor no fue válida');
        }

      } catch (error) {
        console.error('Error al actualizar la fecha:', error);
        toast.error(error.message || 'Error al actualizar la fecha');
      }
    }
  };

  const renderDayContents = (day, date) => {
    const baseClasses = "rounded-full w-9 h-9 flex items-center justify-center font-medium";
    const isAvailable = isDateAvailable(date);
    const isOccupied = isDateOccupied(date);
    const isReserved = isDateReserved(date);

    let dayContent;
    let title = '';

    if (isOccupied) {
      dayContent = <div className={`bg-red-200 text-red-900 border-2 border-red-400 ${baseClasses} cursor-pointer hover:bg-red-300`}>{day}</div>;
      title = 'Doble clic para marcar como Disponible';
    } else if (isReserved) {
      dayContent = <div className={`bg-yellow-200 text-yellow-900 border-2 border-yellow-400 ${baseClasses} cursor-pointer hover:bg-yellow-300`}>{day}</div>;
      title = 'Doble clic para marcar como Disponible';
    } else if (isAvailable) {
      dayContent = <div className={`bg-green-200 text-green-900 border-2 border-green-400 ${baseClasses} cursor-pointer hover:bg-green-300`}>
        {day}
      </div>;
      title = 'Doble clic para marcar como No Disponible';
    } else {
      dayContent = <div className={`text-gray-400 ${baseClasses}`}>{day}</div>;
    }

    const canDoubleClick = isAvailable || isOccupied || isReserved;

    return (
      <div
        onDoubleClick={() => canDoubleClick && handleDeleteDate(date)}
        title={title}
      >
        {dayContent}
      </div>
    );
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;

    if (start && selectedDates.startDate && start.getTime() === selectedDates.startDate.getTime() && !end) {
      setSelectedDates({
        startDate: null,
        endDate: null,
        status: selectedDates.status
      });
      return;
    }

    if (end && selectedDates.endDate && end.getTime() === selectedDates.endDate.getTime()) {
      setSelectedDates(prev => ({
        ...prev,
        endDate: null
      }));
      return;
    }

    const startDate = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
    const endDate = end ? new Date(end.setHours(23, 59, 59, 999)) : null;

    setSelectedDates({
      startDate: startDate,
      endDate: endDate,
      status: selectedDates.status
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

  const getImageUrl = (image) => {
    if (!image) return null;
    const url = (typeof image === 'object' && image !== null)
      ? (image.rutaArchivo || image.url)
      : (typeof image === 'string' ? image : null);

    if (!url) return null;

    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http') || url.startsWith('https')) {
      return url;
    }
    return `data:image/jpeg;base64,${url}`;
  };

  const renderPropertyImage = (property) => {
    const images = property.images || [];
    if (images.length > 0) {
      const imageUrl = getImageUrl(images[0]);

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
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => {
            if (!property || typeof property !== 'object') {
              console.error(`Invalid property at index ${index}:`, property);
              return null;
            }

            const propertyId = property.id || property._id || `property-${index}`;
            const propertyTitle = property.title || 'Sin título';
            const currentStatus = mapStatus(property.estado || 'disponible');
            const displayPrice = property.price || property.precioPorNoche || property.pricePerWeek || property.pricePerMonth || 0;
            const priceDescription = (property.price || property.precioPorNoche) ? 'por noche' : (property.pricePerWeek ? 'por semana' : (property.pricePerMonth ? 'por mes' : ''));

            return (
              <div
                key={propertyId}
                className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${currentStatus === 'ocupado_temp' || currentStatus === 'no disponible' ? 'opacity-80 border-l-4 border-red-500' : ''
                  } ${currentStatus === 'reservado_temp' ? 'border-l-4 border-yellow-400' : ''
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
                      <span>{property.squareMeters || property.superficieM2 || 0}</span>
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
                className={`bg-white rounded-xl shadow-lg overflow-hidden flex ${currentStatus === 'ocupado_temp' ? 'bg-red-50' : ''
                  } ${currentStatus === 'reservado_temp' ? 'bg-yellow-50' : ''
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
                      {property.squareMeters || property.superficieM2 || 0}
                    </span>
                  </div>

                  {/* Fechas de Disponibilidad */}
                  {property.availability && property.availability.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        Fechas Registradas
                      </h4>
                      <div className="space-y-2">
                        {property.availability.map((range, index) => {
                          const startDate = new Date(range.startDate);
                          const endDate = new Date(range.endDate);
                          const statusLower = String(range.status || 'disponible').toLowerCase();

                          let statusBadge;
                          if (statusLower === 'ocupado_temp' || statusLower === 'ocupado') {
                            statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Ocupado</span>;
                          } else if (statusLower === 'reservado_temp' || statusLower === 'reservado') {
                            statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Reservado</span>;
                          } else {
                            statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Disponible</span>;
                          }

                          return (
                            <div key={range.id || range._id || index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {format(startDate, 'dd/MM/yyyy', { locale: es })} - {format(endDate, 'dd/MM/yyyy', { locale: es })}
                              </span>
                              {statusBadge}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                        src={getImageUrl(selectedProperty.images[currentImageIndex])}
                        alt={`Imagen ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600";
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

                <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mt-6">Reglas de la Propiedad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {(selectedProperty.rules || selectedProperty.reglasPropiedad)?.map((rule, index) => (
                    <div key={index} className="flex items-center text-base text-gray-700">
                      <FaCheck className="text-blue-500 mr-2 text-sm" />
                      <span>{rule}</span>
                    </div>
                  )) || (
                      <p className="text-gray-500 text-base">No se han especificado reglas.</p>
                    )}
                </div>

                <div className="p-4 border rounded-lg bg-white shadow">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> Calendario de Disponibilidad
                  </h3>

                  <div className="mb-4">
                    <DatePicker
                      key={`datepicker-${selectedProperty?._id || selectedProperty?.id}-${datePickerKey}`}
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

                    <div className="flex items-center mt-2 text-base flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded-full mr-2"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded-full mr-2"></div>
                        <span>Reservado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded-full mr-2"></div>
                        <span>Ocupado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded-full mr-2"></div>
                        <span>No disponible</span>
                      </div>
                    </div>

                    {/* Cartel informativo sobre funcionalidad de doble click */}
                    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                      <div className="flex items-start">
                        <FaCalendarAlt className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1"> Tip: Funcionalidad de Doble Click</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li><strong>Fechas Disponibles (verde):</strong> Doble click para marcar como "No Disponible"</li>
                            <li><strong>Fechas Reservadas (amarillo) u Ocupadas (rojo):</strong> Doble click para marcar como "Disponible"</li>
                          </ul>
                        </div>
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
                                onClick={() => handleDeleteRange(range.id || range._id)}
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
                    <p><span className="font-semibold">Estadía mínima:</span> {selectedProperty.estadiaMinima || 1}</p>
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
                      {mapStatus(selectedProperty.estado) === 'no disponible' && (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-medium bg-gray-100 text-gray-800">No disponible</span>
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