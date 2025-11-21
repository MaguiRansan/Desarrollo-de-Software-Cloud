import React, { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaExclamationTriangle, FaRulerCombined, FaTools, FaStar } from "react-icons/fa";

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
  capacidadPersonas: '',
  estado: 'Disponible',

  esAlquilerTemporario: true,
  especificaciones: [],
  servicios: [],
  reglasPropiedad: [],
  horarioCheckIn: '15:00',
  horarioCheckOut: '11:00',
  estadiaMinima: '',

  activo: true,
  latitud: '',
  longitud: '',
  imagenes: [],
};

const BASE_SERVICES = ['WiFi', 'Limpieza general', 'Estacionamiento', 'Kit de Bienvenida', 'Ropa de Cama', 'Servicio de conserjeria', 'Cocina Equipada', 'Seguridad 24hs', 'Smart TV', 'Aire acondicionado', 'Sin Piscina'];

const availableReglas = ['No fumar', 'No mascotas', 'Respetar horarios de descanso', 'Solo Familias'];

const getSavedCustomServices = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('customServices');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const getSavedCustomRules = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('customRules');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

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


const AddPropertyForm = ({ onAddProperty, onCancel, isSubmitting = false }) => {
  const [property, setProperty] = useState(initialPropertyState);
  const [imageFiles, setImageFiles] = useState([]);
  const [availability, setAvailability] = useState(initialAvailability);

  const [newServiceInput, setNewServiceInput] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [customServices, setCustomServices] = useState(getSavedCustomServices());
  const [customRules, setCustomRules] = useState(getSavedCustomRules());
  const [newRuleInput, setNewRuleInput] = useState('');

  const saveCustomServices = (services) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customServices', JSON.stringify(services));
    }
  };

  const saveCustomRules = (rules) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customRules', JSON.stringify(rules));
    }
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
  };

  const handleAddNewService = (e) => {
    e.preventDefault();
    const newService = newServiceInput.trim();

    if (newService) {
      const allServices = [...BASE_SERVICES, ...customServices];
      const serviceExists = allServices.some(
        s => s.toLowerCase() === newService.toLowerCase()
      );

      if (!serviceExists) {
        const updatedCustomServices = [...customServices, newService];
        setCustomServices(updatedCustomServices);
        saveCustomServices(updatedCustomServices);

        setProperty(prev => ({
          ...prev,
          servicios: [...(prev.servicios || []), newService]
        }));

        setNewServiceInput('');
      } else {
        alert('Este servicio ya existe en la lista');
      }
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setProperty(prev => ({
      ...prev,
      servicios: prev.servicios.filter(s => s !== serviceToRemove)
    }));
  };

  const handleAddNewRule = (e) => {
    e.preventDefault();
    const newRule = newRuleInput.trim();

    if (newRule) {
      const allRules = [...availableReglas, ...customRules];
      const ruleExists = allRules.some(
        r => r.toLowerCase() === newRule.toLowerCase()
      );

      if (!ruleExists) {
        const updatedCustomRules = [...customRules, newRule];
        setCustomRules(updatedCustomRules);
        saveCustomRules(updatedCustomRules);

        setProperty(prev => ({
          ...prev,
          reglasPropiedad: [...(prev.reglasPropiedad || []), newRule]
        }));

        setNewRuleInput('');
      } else {
        alert('Esta regla ya existe en la lista');
      }
    }
  };

  const handleRemoveRule = (ruleToRemove) => {
    setProperty(prev => ({
      ...prev,
      reglasPropiedad: prev.reglasPropiedad.filter(r => r !== ruleToRemove)
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


  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (property.titulo.length < 5) {
        alert('El título debe tener al menos 5 caracteres.');
        return;
      }

      if (property.direccion.length < 5) {
        alert('La dirección debe tener al menos 5 caracteres.');
        return;
      }

      const finalProperty = {
        ...property,

        titulo: property.titulo || 'Sin título',
        descripcion: property.descripcion || 'Sin descripción',
        direccion: property.direccion || 'Sin dirección',
        barrio: property.barrio || 'Sin barrio',
        localidad: property.localidad || 'Sin localidad',
        provincia: property.provincia || 'Sin provincia',
        tipoPropiedad: property.tipoPropiedad || 'Casa',
        transaccionTipo: 'Alquiler Temporario',

        habitaciones: property.habitaciones ? parseInt(property.habitaciones) : 0,
        banos: property.banos ? parseInt(property.banos) : 0,
        superficieM2: property.superficieM2 ? parseFloat(property.superficieM2) : 0,
        capacidadPersonas: property.capacidadPersonas ? parseInt(property.capacidadPersonas) : 1,

        precioPorNoche: property.precioPorNoche ? parseFloat(property.precioPorNoche) : null,
        precioPorSemana: property.precioPorSemana ? parseFloat(property.precioPorSemana) : null,
        precioPorMes: property.precioPorMes ? parseFloat(property.precioPorMes) : null,
        estadiaMinima: property.estadiaMinima ? parseInt(property.estadiaMinima) : 1,

        estado: property.estado || 'Disponible',
        activo: property.activo,
        esAlquilerTemporario: property.transaccionTipo === 'Alquiler Temporario',
        horarioCheckIn: property.horarioCheckIn || '15:00',
        horarioCheckOut: property.horarioCheckOut || '11:00',

        servicios: Array.isArray(property.servicios) ? property.servicios : [],
        reglasPropiedad: Array.isArray(property.reglasPropiedad) ? property.reglasPropiedad : [],

        ubicacion: property.localidad,
        latitud: property.latitud || 0,
        longitud: property.longitud || 0,

        availability: availability.startDate && availability.endDate && availability.availableGuests ? [{
          id: `temp-${Math.random().toString(36).substr(2, 9)}`,
          startDate: availability.startDate,
          endDate: availability.endDate,
          availableGuests: parseInt(availability.availableGuests) || 1,
          status: 'disponible',
          clientName: '',
          deposit: 0,
          guests: 1
        }] : [],

        imagenes: property.imagenes || [],
      };

      console.log('Datos a enviar:', JSON.stringify(finalProperty, null, 2));
      onAddProperty(finalProperty, imageFiles);

      setProperty(initialPropertyState);
      setImageFiles([]);
      setAvailability(initialAvailability);
      setNewServiceInput('');
      setNewRuleInput('');

    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      alert('Ocurrió un error al procesar el formulario. Por favor, intente nuevamente.');
    }
  };


  const handleShowCancelModal = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    property.imagenes.forEach(url => URL.revokeObjectURL(url));

    setProperty(initialPropertyState);
    setImageFiles([]);
    setAvailability(initialAvailability);
    setNewServiceInput('');
    setNewRuleInput('');

    setShowCancelModal(false);
    onCancel && onCancel();
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const selectedCurrencySymbol = AVAILABLE_CURRENCIES.find(c => c.code === property.currency)?.symbol || '$';

  const currentCustomServices = property.servicios.filter(s =>
    !BASE_SERVICES.includes(s) && !customServices.includes(s)
  );

  const currentCustomRules = property.reglasPropiedad.filter(r =>
    !availableReglas.includes(r) && !customRules.includes(r)
  );

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
            <input type="text" name="titulo" id="titulo" value={property.titulo} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Hermoso Apartamento..." required minLength={5} />
            <p className="text-xs text-gray-500 mt-1">Mínimo 5 caracteres</p>
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
            <input type="text" name="direccion" id="direccion" value={property.direccion} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Av. 10 Norte 245" required minLength={5} />
            <p className="text-xs text-gray-500 mt-1">Mínimo 5 caracteres</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 border rounded-lg">
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

            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="estadiaMinima">Estadía Mínima (noches)</label>
              <input type="number" name="estadiaMinima" id="estadiaMinima" value={property.estadiaMinima} onChange={handleInputChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" min="1" placeholder="Ej: 3" />
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 border rounded-lg">
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center space-x-2"><FaTools /><span>Servicios y Especificaciones</span></label>

            <div className="p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
              <p className="font-semibold text-xs mb-2 text-gray-700 border-b pb-1">Seleccionar Servicios:</p>
              <div className="grid grid-cols-2 gap-2">
                {[...BASE_SERVICES, ...customServices].map((service) => (
                  <label key={service} className="flex items-center text-gray-700 text-sm">
                    <input
                      type="checkbox"
                      name="servicios"
                      value={service}
                      checked={property.servicios.includes(service)}
                      onChange={handleInputChange}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                    />
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewService(e)}
                />
                <button
                  type="button"
                  onClick={handleAddNewService}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-1 w-20"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>
            </form>

            {currentCustomServices.length > 0 && (
              <div className="mt-3 p-3 border-t border-gray-200">
                <p className="font-semibold text-xs mb-2 text-gray-700">Servicios Adicionales de esta propiedad:</p>
                <div className="flex flex-wrap gap-2">
                  {currentCustomServices.map(service => (
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


          <div className="p-4 border rounded-lg">
            <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center space-x-2"><FaExclamationTriangle /><span>Reglas de la Propiedad</span></label>

            <div className="p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
              <p className="font-semibold text-xs mb-2 text-gray-700 border-b pb-1">Seleccionar Reglas:</p>
              <div className="grid grid-cols-2 gap-2">
                {[...availableReglas, ...customRules].map((regla) => (
                  <label key={regla} className="flex items-center text-gray-700 text-sm">
                    <input
                      type="checkbox"
                      name="reglasPropiedad"
                      value={regla}
                      checked={property.reglasPropiedad.includes(regla)}
                      onChange={handleInputChange}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                    />
                    {regla}
                  </label>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddNewRule} className="mt-4 flex flex-col gap-2">
              <label className='text-xs text-gray-600 block'>Agregar Regla Personalizada:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: No se permiten fiestas"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewRule(e)}
                />
                <button
                  type="button"
                  onClick={handleAddNewRule}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-sm transition duration-150 flex items-center justify-center space-x-1 w-20"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>
            </form>

            {currentCustomRules.length > 0 && (
              <div className="mt-3 p-3 border-t border-gray-200">
                <p className="font-semibold text-xs mb-2 text-gray-700">Reglas Adicionales de esta propiedad:</p>
                <div className="flex flex-wrap gap-2">
                  {currentCustomRules.map(rule => (
                    <div key={rule} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center shadow-sm">
                      {rule}
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule)}
                        className="ml-2 text-amber-500 hover:text-amber-700 transition duration-150"
                        title="Quitar regla"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            disabled={isSubmitting}
            className={`${isSubmitting
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