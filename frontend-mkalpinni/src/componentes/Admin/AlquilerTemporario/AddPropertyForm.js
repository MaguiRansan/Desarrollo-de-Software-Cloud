import React, { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalendarAlt, FaPercent, FaUsers, FaMoneyBillWave, FaExclamationTriangle, FaRulerCombined, FaTag, FaTools, FaStar } from "react-icons/fa";

const AVAILABLE_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'Dólar Americano' },
    { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
];

const initialAvailability = {
    startDate: '',
    endDate: '',
    availableGuests: '',
};

const initialSeasonalPrice = {
  startDate: '',
  endDate: '',
  percentage: '', 
};

const initialPropertyState = {
  titulo: '',
  descripcion: '',
  direccion: '',
  barrio: '',
  localidad: '',
  provincia: '',
  ubicacion: '', 
  tipoPropiedad: 'Apartamento', 
  transaccionTipo: 'Alquiler Temporario', 
  
  precioPorNoche: '',
  precioPorSemana: '',
  precioPorMes: '',
  currency: 'USD', 
  
  habitaciones: '',
  banos: '',
  superficieM2: '',
  terrenoM2: '',
  capacidadPersonas: '', 
  estado: 'Disponible',

  esAlquilerTemporario: true,
  especificaciones: [],
  servicios: [],
  reglasPropiedad: [],
  horarioCheckIn: '15:00',
  horarioCheckOut: '11:00',
  depositoSeguridad: '',
  
  activo: true,
  latitud: '',
  longitud: '',
  imagenes: [], 
};

const BASE_SERVICES = ['WiFi', 'Limpieza general', 'Estacionamiento', 'Kit de Bienvenida', 'Ropa de Cama', 'Servicio de conserjeria', 'Cocina Equipada', 'Seguridad 24hs', 'Smart TV', 'Aire acondicionado', 'Sin Piscina'];
const availableReglas = ['No fumar', 'No mascotas', 'Respetar horarios de descanso', 'Solo Familias'];


const ConfirmationModal = ({ show, onConfirm, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 scale-100">
                <div className="flex items-center text-yellow-600 mb-4">
                    <FaExclamationTriangle className="w-6 h-6 mr-3" />
                    <h3 className="text-lg font-bold text-gray-800">Confirmar Cancelación</h3>
                </div>
                <p className="text-gray-700 mb-6">
                    Estás a punto de cancelar el registro. <strong className="font-extrabold text-black-600">Perderás todos los datos ingresados</strong> en el formulario. ¿Estás seguro?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Volver
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150"
                    >
                        Sí, Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};


const AddPropertyForm = ({ onAddProperty, isSubmitting = false }) => {
  const [property, setProperty] = useState(initialPropertyState);
  const [imageFiles, setImageFiles] = useState([]); 
  const [seasonalPrices, setSeasonalPrices] = useState([]); 
  const [availability, setAvailability] = useState(initialAvailability);
  const [seasonalPriceError, setSeasonalPriceError] = useState(null); 
  
  const [newServiceInput, setNewServiceInput] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false); 


  const isDateRangeAvailable = (seasonalStart, seasonalEnd) => {
    const { startDate: availableStart, endDate: availableEnd } = availability;

    if (!availableStart || !availableEnd) {
      setSeasonalPriceError('Debe definir el Rango de Disponibilidad Inicial antes de establecer precios por temporada.');
      return false;
    }

    if (!seasonalStart || !seasonalEnd) { return true; } 

    const startSeason = new Date(seasonalStart);
    const endSeason = new Date(seasonalEnd);
    
    startSeason.setHours(0, 0, 0, 0);
    endSeason.setHours(23, 59, 59, 999);

    if (startSeason > endSeason) {
        setSeasonalPriceError('La fecha de fin de temporada debe ser posterior o igual a la fecha de inicio.');
        return false;
    }

    setSeasonalPriceError(null);
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const listName = name; 
      const updatedList = checked
        ? [...property[listName], value]
        : property[listName].filter((item) => item !== value);
      
      setProperty(prev => ({ ...prev, [listName]: updatedList }));
      return;
    }
    
    setProperty(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailability(prev => ({
        ...prev,
        [name]: value
    }));
    if (seasonalPrices.length > 0) {
        setSeasonalPriceError(null); 
    }
  };

  const handleAddNewService = (e) => {
    e.preventDefault();
    const newService = newServiceInput.trim();

    if (newService && !property.servicios.includes(newService)) {
      setProperty(prev => ({ 
        ...prev, 
        servicios: [...prev.servicios, newService] 
      }));
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setProperty(prev => ({
        ...prev,
        servicios: prev.servicios.filter(s => s !== serviceToRemove)
    }));
  };

  const handleImageFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);
    const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));
    setProperty(prev => ({ ...prev, imagenes: [...prev.imagenes, ...newImageUrls] }));
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(property.imagenes[indexToRemove]);

    setProperty(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }));
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSetMainImage = (indexToPromote) => {
    if (indexToPromote === 0) return; 

    const newImages = [...property.imagenes];
    const [promotedUrl] = newImages.splice(indexToPromote, 1);
    newImages.unshift(promotedUrl);
    setProperty(prev => ({ ...prev, imagenes: newImages }));

    const newImageFiles = [...imageFiles];
    const [promotedFile] = newImageFiles.splice(indexToPromote, 1);
    newImageFiles.unshift(promotedFile);
    setImageFiles(newImageFiles);
  };

  const handleSeasonalPriceChange = (index, e) => {
    const { name, value } = e.target;
    const newSeasonalPrices = [...seasonalPrices];
    
    const updatedSeasonalPrice = {
      ...newSeasonalPrices[index],
      [name]: value
    };
    
    const newStart = name === 'startDate' ? value : updatedSeasonalPrice.startDate;
    const newEnd = name === 'endDate' ? value : updatedSeasonalPrice.endDate;

    if (newStart && newEnd) {
      const startDate = new Date(newStart);
      const endDate = new Date(newEnd);
      
      if (startDate > endDate) {
        setSeasonalPriceError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      } else if (!availability.startDate || !availability.endDate) {
        setSeasonalPriceError('Primero debe definir el rango de disponibilidad de la propiedad.');
      } else {
        const availableStart = new Date(availability.startDate);
        const availableEnd = new Date(availability.endDate);
        
        if (startDate < availableStart || endDate > availableEnd) {
          setSeasonalPriceError('El rango de fechas de la temporada debe estar dentro del rango de disponibilidad de la propiedad.');
        } else {
          const hasOverlap = seasonalPrices.some((sp, i) => {
            if (i === index) return false; 
            if (!sp.startDate || !sp.endDate) return false; 
            
            const existingStart = new Date(sp.startDate);
            const existingEnd = new Date(sp.endDate);
            
            return (startDate <= existingEnd && endDate >= existingStart);
          });
          
          if (hasOverlap) {
            setSeasonalPriceError('No se pueden superponer los rangos de fechas de las temporadas.');
          } else {
            setSeasonalPriceError(null);
          }
        }
      }
    } else {
      setSeasonalPriceError(null);
    }
    
    newSeasonalPrices[index] = updatedSeasonalPrice;
    setSeasonalPrices(newSeasonalPrices);
  };

  const addSeasonalPrice = () => {
    if (seasonalPriceError) {
      alert("Por favor, corrige el error de fecha en la temporada actual antes de añadir una nueva.");
      return;
    }
    
    const hasIncompleteEntry = seasonalPrices.some(sp => 
      !sp.startDate || !sp.endDate || !sp.percentage
    );
    
    if (hasIncompleteEntry) {
      alert("Por favor, completa la información de la temporada actual antes de agregar una nueva.");
      return;
    }
    
    if (!availability.startDate || !availability.endDate) {
      alert("Debe definir primero el rango de disponibilidad de la propiedad antes de agregar ajustes de temporada.");
      return;
    }
    
    setSeasonalPrices(prev => [...prev, { ...initialSeasonalPrice }]);
  };

  const removeSeasonalPrice = (indexToRemove) => {
    setSeasonalPrices(prev => prev.filter((_, index) => index !== indexToRemove));
    setSeasonalPriceError(null); 
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const hasBasePrice = property.precioPorNoche || property.precioPorSemana || property.precioPorMes;
    const hasSeasonalPrice = seasonalPrices.length > 0;

    if (!hasBasePrice && hasSeasonalPrice) {
        alert('Debe ingresar un Precio Base (Noche, Semana o Mes) para poder aplicar un porcentaje de ajuste por temporada.');
        return;
    }
    
    if (seasonalPrices.length > 0 && (!availability.startDate || !availability.endDate)) {
         alert('Debe definir el Rango de Disponibilidad Inicial antes de establecer precios por temporada.');
         return;
    }
    
    for (const sp of seasonalPrices) {
        if (!isDateRangeAvailable(sp.startDate, sp.endDate)) {
            alert('¡Error de validación de fecha! La fecha de inicio no puede ser posterior a la de fin en una temporada.');
            return;
        }
    }

    const finalProperty = {
      ...property,
      
      precio: property.precio === '' ? null : parseFloat(property.precio),
      precioPorNoche: property.precioPorNoche === '' ? null : parseFloat(property.precioPorNoche),
      precioPorSemana: property.precioPorSemana === '' ? null : parseFloat(property.precioPorSemana),
      precioPorMes: property.precioPorMes === '' ? null : parseFloat(property.precioPorMes),
      capacidadPersonas: property.capacidadPersonas === '' ? 0 : parseInt(property.capacidadPersonas),
      habitaciones: property.habitaciones === '' ? 0 : parseInt(property.habitaciones),
      banos: property.banos === '' ? 0 : parseInt(property.banos),
      superficieM2: property.superficieM2 === '' ? 0 : parseInt(property.superficieM2),
      terrenoM2: property.terrenoM2 === '' ? 0 : parseInt(property.terrenoM2),
      depositoSeguridad: property.depositoSeguridad === '' ? null : parseFloat(property.depositoSeguridad),

      ubicacion: property.localidad, 
      esAlquilerTemporario: property.transaccionTipo === 'Alquiler Temporario',
      
      availability: availability.startDate && availability.endDate && availability.availableGuests ? [{
          startDate: availability.startDate,
          endDate: availability.endDate,
          availableGuests: parseInt(availability.availableGuests),
      }] : [],
      
      seasonalPrices: seasonalPrices.filter(sp => 
          sp.startDate && sp.endDate && sp.percentage
      ).map(sp => ({
          ...sp,
          percentage: sp.percentage === '' ? 0 : parseFloat(sp.percentage),
      })),
      
      imagenes: property.imagenes,
    };

    onAddProperty(finalProperty, imageFiles);

    setProperty(initialPropertyState);
    setImageFiles([]);
    setSeasonalPrices([]);
    setAvailability(initialAvailability);
    setSeasonalPriceError(null);
    setNewServiceInput('');
  };

  const handleShowCancelModal = () => {
    setShowCancelModal(true);
  };
  
  const handleConfirmCancel = () => {
    property.imagenes.forEach(url => URL.revokeObjectURL(url));
    
    setProperty(initialPropertyState);
    setImageFiles([]);
    setSeasonalPrices([]);
    setAvailability(initialAvailability);
    setSeasonalPriceError(null);
    setNewServiceInput('');
    
    setShowCancelModal(false); 
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false); 
  };

  const selectedCurrencySymbol = AVAILABLE_CURRENCIES.find(c => c.code === property.currency)?.symbol || '$';
  const customServices = property.servicios.filter(s => !BASE_SERVICES.includes(s));
  
  const minDateRestriction = availability.startDate || '';
  const maxDateRestriction = availability.endDate || '';


  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
        
      <ConfirmationModal 
          show={showCancelModal}
          onConfirm={handleConfirmCancel}
          onClose={handleCloseCancelModal}
      />

      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <span>Registro de Propiedad Temporal</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="col-span-full text-lg font-semibold text-gray-800">Datos Principales</h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">Título *</label>
            <input type="text" name="titulo" id="titulo" value={property.titulo} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Hermoso Apartamento..." required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transaccionTipo">Tipo de Transacción *</label>
            <select name="transaccionTipo" id="transaccionTipo" value={property.transaccionTipo} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
                <option value="Alquiler Temporario">Alquiler Temporario</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoPropiedad">Tipo de Propiedad *</label>
            <select name="tipoPropiedad" id="tipoPropiedad" value={property.tipoPropiedad} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Local">Local/Oficina</option>
                <option value="Terreno">Terreno</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="direccion">Dirección *</label>
            <input type="text" name="direccion" id="direccion" value={property.direccion} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Av. 10 Norte 245" required />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="barrio">Barrio</label>
            <input type="text" name="barrio" id="barrio" value={property.barrio} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Centro" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="localidad">Localidad / Ubicación *</label>
            <input type="text" name="localidad" id="localidad" value={property.localidad} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: La Plata" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provincia">Provincia *</label>
            <input type="text" name="provincia" id="provincia" value={property.provincia} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Buenos Aires" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estado">Estado *</label>
            <select name="estado" id="estado" value={property.estado} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
                <option value="Disponible">Disponible</option>
                <option value="Reservado">No Disponible</option>
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">Descripción *</label>
            <textarea name="descripcion" id="descripcion" value={property.descripcion} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Descripción detallada de la propiedad" rows="3" required />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 p-4 border rounded-lg">
            <h3 className="col-span-full text-lg font-semibold text-gray-800 flex items-center space-x-2"><FaRulerCombined /><span>Características</span></h3>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="habitaciones">Habitaciones</label>
                <input type="number" name="habitaciones" id="habitaciones" value={property.habitaciones} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 3" />
            </div>
            
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="banos">Baños</label>
                <input type="number" name="banos" id="banos" value={property.banos} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 2" />
            </div>
            
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="superficieM2">Superficie (m²)</label>
                <input type="number" name="superficieM2" id="superficieM2" value={property.superficieM2} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 65" />
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="terrenoM2">Terreno (m²)</label>
                <input type="number" name="terrenoM2" id="terrenoM2" value={property.terrenoM2} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 190 (si aplica)" />
            </div>
        </div>
        
        <div className="mb-6 p-4 border border-green-400 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                <FaCalendarAlt />
                <span>Disponibilidad de la propiedad *</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className='text-xs text-gray-600 block mb-1'>Fecha de Entrada *</label>
                    <input type="date" name="startDate" value={availability.startDate} onChange={handleAvailabilityChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" required />
                </div>

                <div>
                    <label className='text-xs text-gray-600 block mb-1'>Fecha de Salida *</label>
                    <input type="date" name="endDate" value={availability.endDate} onChange={handleAvailabilityChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" required />
                </div>

                <div>
                    <label className='text-xs text-gray-600 block mb-1'>Capacidad Máxima en este Rango *</label>
                    <div className="relative">
                        <input type="number" name="availableGuests" placeholder="Ej: 4" value={availability.availableGuests} onChange={handleAvailabilityChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 pr-8" min="1" required />
                        <span className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                            <FaUsers className='h-4 w-4' />
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-xs text-gray-600 mb-1" htmlFor="horarioCheckIn">Horario Check-In</label>
                    <input type="time" name="horarioCheckIn" id="horarioCheckIn" value={property.horarioCheckIn} onChange={handleInputChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" />
                </div>
                
                <div>
                    <label className="block text-xs text-gray-600 mb-1" htmlFor="horarioCheckOut">Horario Check-Out</label>
                    <input type="time" name="horarioCheckOut" id="horarioCheckOut" value={property.horarioCheckOut} onChange={handleInputChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" />
                </div>
            </div>
        </div>

        <div className="mb-6 p-4 border border-gray-400 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <FaMoneyBillWave />
                <span>Precios Base y Moneda</span>
            </h3>
            
            <div className='mb-4'>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">Moneda Base *</label>
                <select name="currency" id="currency" value={property.currency} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
                    {AVAILABLE_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.symbol} {c.code} - {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="number" name="precioPorNoche" placeholder={`Noche (${selectedCurrencySymbol})`} value={property.precioPorNoche} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />
                <input type="number" name="precioPorSemana" placeholder={`Semana (${selectedCurrencySymbol})`} value={property.precioPorSemana} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />
                <input type="number" name="precioPorMes" placeholder={`Mes (${selectedCurrencySymbol})`} value={property.precioPorMes} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />
            </div>
        </div>

        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2"><FaTag /><span>Ajuste de Precios por Temporada</span></h3>
            
            {seasonalPriceError && (
                <div className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    <FaExclamationTriangle className="w-5 h-5 mr-3" />
                    <span className="font-medium">Error de Fecha:</span> {seasonalPriceError}
                </div>
            )}

            {seasonalPrices.map((sp, index) => (
                <div key={index} className="mb-4 p-4 border border-dashed border-blue-300 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-medium text-sm text-gray-700">Temporada {index + 1}</p>
                        <button type="button" onClick={() => removeSeasonalPrice(index)} className="text-red-500 hover:text-red-700 transition duration-150" title="Eliminar temporada"><FaTrash /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className='text-xs text-gray-600 block mb-1'>Fecha de Inicio *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={sp.startDate}
                                onChange={(e) => handleSeasonalPriceChange(index, e)}
                                className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min={minDateRestriction} 
                                max={maxDateRestriction} 
                                required
                            />
                        </div>

                        <div>
                            <label className='text-xs text-gray-600 block mb-1'>Fecha de Fin *</label>
                            <input
                                type="date"
                                name="endDate"
                                value={sp.endDate}
                                onChange={(e) => handleSeasonalPriceChange(index, e)}
                                className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min={minDateRestriction} 
                                max={maxDateRestriction} 
                                required
                            />
                        </div>

                        <div>
                            <label className='text-xs text-gray-600 block mb-1'>Ajuste de Porcentaje*</label>
                            <div className="relative">
                                <input type="number" name="percentage" placeholder="Ej: 20" value={sp.percentage} onChange={(e) => handleSeasonalPriceChange(index, e)} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 pr-8" required />
                                <span className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500 pointer-events-none"><FaPercent className='h-4 w-4' /></span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addSeasonalPrice} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition duration-300 text-sm" disabled={!!seasonalPriceError}>
                <FaPlus />
                <span>Añadir Periodo de Ajuste</span>
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
                <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center space-x-2"><FaTools /><span>Servicios y Especificaciones</span></label>
                
                <div className="p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                    <p className="font-semibold text-xs mb-2 text-gray-700 border-b pb-1">Seleccionar Servicios:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {BASE_SERVICES.map((service) => (
                            <label key={service} className="flex items-center text-gray-700 text-sm">
                            <input type="checkbox" name="servicios" value={service} checked={property.servicios.includes(service)} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2" />
                            {service}
                            </label>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleAddNewService} className="mt-4 flex flex-col gap-2">
                    <label className='text-xs text-gray-600 block'>Agregar Servicio Personalizado:</label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            placeholder="Ej: Sauna, Conserje 24/7"
                            value={newServiceInput}
                            onChange={(e) => setNewServiceInput(e.target.value)}
                            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 text-sm"
                        />
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-1 w-20">
                            <FaPlus className="w-3 h-3"/>
                            <span>Añadir</span>
                        </button>
                    </div>
                </form>

                {customServices.length > 0 && (
                    <div className="mt-3 p-3 border-t border-gray-200">
                        <p className="font-semibold text-xs mb-2 text-gray-700">Servicios Adicionales:</p>
                        <div className="flex flex-wrap gap-2">
                            {customServices.map(service => (
                                <div key={service} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center shadow-sm">
                                    {service}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveService(service)}
                                        className="ml-2 text-indigo-500 hover:text-indigo-700 transition duration-150"
                                        title="Quitar servicio"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-3">Reglas de la Propiedad</label>
                <div className="p-3 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                    {availableReglas.map((regla) => (
                        <label key={regla} className="flex items-center text-gray-700 text-sm">
                            <input type="checkbox" name="reglasPropiedad" value={regla} checked={property.reglasPropiedad.includes(regla)} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2" />
                            {regla}
                        </label>
                    ))}
                </div>
            </div>
        </div>

        <div className="col-span-full mb-6 p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">Imágenes de la propiedad</label>
          <input type="file" id="image-upload" multiple onChange={handleImageFileChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={imageFiles.length === 0} />
          
          {property.imagenes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {property.imagenes.map((url, index) => (
                <div key={index} className="relative group">
                  <div className={`
                    relative 
                    h-24 w-24 
                    object-cover rounded-lg shadow-md border 
                    ${index === 0 ? 'border-4 border-yellow-500' : 'border-gray-200'}
                  `}>
                    <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover rounded-md"
                    />
                    
                    {index === 0 && (
                        <div className="absolute top-0 left-0 bg-yellow-500 text-xs text-white px-2 py-0.5 rounded-br-lg font-semibold">
                            PRINCIPAL
                        </div>
                    )}
                  </div>
                  
                  <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    {index !== 0 && (
                        <button
                            type="button"
                            onClick={() => handleSetMainImage(index)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-1 shadow-lg"
                            title="Hacer principal"
                        >
                            <FaStar className="h-3 w-3" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg"
                        title="Eliminar foto"
                    >
                        <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !!seasonalPriceError} 
            className={`${
              isSubmitting || seasonalPriceError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300`}
          >
            {isSubmitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Guardando...</span></>
            ) : (
              <><FaSave /><span>Agregar Propiedad</span></>
            )}
          </button>
          <button
            type="button"
            onClick={handleShowCancelModal} 
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
            disabled={isSubmitting}
          >
            <FaTimes />
            <span>Cancelar</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyForm;