import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaStar, FaTrash } from "react-icons/fa";

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
];

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [...defaultValue];
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error);
    return [...defaultValue];
  }
};

const BASE_SERVICES = loadFromLocalStorage('globalServices', ['WiFi', 'Limpieza general', 'Estacionamiento', 'Kit de Bienvenida', 'Ropa de Cama', 'Servicio de conserjeria', 'Cocina Equipada', 'Seguridad 24hs', 'Smart TV', 'Aire acondicionado', 'Sin Piscina']);
const availableReglas = loadFromLocalStorage('globalRules', ['No fumar', 'No mascotas', 'Respetar horarios de descanso', 'Solo Familias']);

const EditPropertyForm = ({ property, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    direccion: '',
    barrio: '',
    localidad: '',
    provincia: '',
    tipoPropiedad: '',
    precioPorNoche: '',
    precioPorSemana: '',
    precioPorMes: '',
    currency: '',
    habitaciones: '',
    banos: '',
    superficieM2: '',
    capacidadPersonas: '',
    estado: '',
    servicios: [],
    reglasPropiedad: [],
    horarioCheckIn: '',
    horarioCheckOut: '',
    estadiaMinima: '',
    imagenes: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');

  const [editingService, setEditingService] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [editServiceValue, setEditServiceValue] = useState('');
  const [editRuleValue, setEditRuleValue] = useState('');

  const [globalServices, setGlobalServices] = useState(BASE_SERVICES);
  const [globalRules, setGlobalRules] = useState(availableReglas);

  const allServices = [...new Set([...globalServices, ...formData.servicios])];
  const allRules = [...new Set([...globalRules, ...formData.reglasPropiedad])];

  useEffect(() => {
    if (property) {
      const rawEstadiaMinima = property.estadiaMinima;
      const initialEstadiaMinima = String(rawEstadiaMinima ?? '');

      setFormData({
        titulo: property.title || property.titulo || '',
        descripcion: property.description || property.descripcion || '',
        direccion: property.address || property.direccion || '',
        barrio: property.neighborhood || property.barrio || '',
        localidad: property.locality || property.localidad || '',
        provincia: property.province || property.provincia || '',
        tipoPropiedad: property.type || property.tipoPropiedad || 'Apartamento',
        precioPorNoche: property.price || property.precioPorNoche || '',
        precioPorSemana: property.pricePerWeek || property.precioPorSemana || '',
        precioPorMes: property.pricePerMonth || property.precioPorMes || '',
        currency: property.currency || 'USD',
        habitaciones: property.bedrooms || property.habitaciones || '',
        banos: property.bathrooms || property.banos || '',
        superficieM2: property.squareMeters || property.superficieM2 || '',
        capacidadPersonas: property.capacity || property.capacidadPersonas || '',
        estado: property.status || property.estado || 'Disponible',
        servicios: Array.isArray(property.services) ? property.services : (Array.isArray(property.servicios) ? property.servicios : []),
        reglasPropiedad: Array.isArray(property.rules) ? property.rules : (Array.isArray(property.reglasPropiedad) ? property.reglasPropiedad : []),
        horarioCheckIn: property.checkInTime || property.horarioCheckIn || '15:00',
        horarioCheckOut: property.checkOutTime || property.horarioCheckOut || '11:00',
        estadiaMinima: initialEstadiaMinima,

        imagenes: property.images || property.imagenes || [],
      });
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const listName = name;
      const updatedList = checked
        ? [...formData[listName], value]
        : formData[listName].filter((item) => item !== value);

      setFormData(prev => ({ ...prev, [listName]: updatedList }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  const handleAddNewService = (e) => {
    e.preventDefault();
    const newService = newServiceInput.trim();

    if (newService && !formData.servicios.includes(newService)) {
      if (!globalServices.includes(newService)) {
        const updatedServices = [...globalServices, newService];
        setGlobalServices(updatedServices);
        saveToLocalStorage('globalServices', updatedServices);
      }

      setFormData(prev => ({
        ...prev,
        servicios: [...prev.servicios, newService]
      }));
      setNewServiceInput('');
    }
  };

  const handleEditService = (service, index) => {
    setEditingService(index);
    setEditServiceValue(service);
  };

  const handleSaveService = (e, index) => {
    e.preventDefault();
    const updatedService = editServiceValue.trim();

    if (updatedService && updatedService !== globalServices[index]) {
      const updatedServices = [...globalServices];
      updatedServices[index] = updatedService;
      setGlobalServices(updatedServices);
      saveToLocalStorage('globalServices', updatedServices);

      if (formData.servicios.includes(globalServices[index])) {
        const updatedPropServices = formData.servicios.map(s =>
          s === globalServices[index] ? updatedService : s
        );
        setFormData(prev => ({
          ...prev,
          servicios: updatedPropServices
        }));
      }

      setEditingService(null);
    }
  };



  const handleAddNewRule = (e) => {
    e.preventDefault();
    const newRule = newRuleInput.trim();

    if (newRule && !formData.reglasPropiedad.includes(newRule)) {
      if (!globalRules.includes(newRule)) {
        const updatedRules = [...globalRules, newRule];
        setGlobalRules(updatedRules);
        saveToLocalStorage('globalRules', updatedRules);
      }

      setFormData(prev => ({
        ...prev,
        reglasPropiedad: [...prev.reglasPropiedad, newRule]
      }));
      setNewRuleInput('');
    }
  };

  const handleEditRule = (rule, index) => {
    setEditingRule(index);
    setEditRuleValue(rule);
  };

  const handleSaveRule = (e, index) => {
    e.preventDefault();
    const updatedRule = editRuleValue.trim();

    if (updatedRule && updatedRule !== globalRules[index]) {
      const updatedRules = [...globalRules];
      updatedRules[index] = updatedRule;
      setGlobalRules(updatedRules);
      saveToLocalStorage('globalRules', updatedRules);

      if (formData.reglasPropiedad.includes(globalRules[index])) {
        const updatedPropRules = formData.reglasPropiedad.map(r =>
          r === globalRules[index] ? updatedRule : r
        );
        setFormData(prev => ({
          ...prev,
          reglasPropiedad: updatedPropRules
        }));
      }

      setEditingRule(null);
    }
  };

  const handleRemoveRule = (ruleToRemove) => {
    const updatedRules = globalRules.filter(r => r !== ruleToRemove);
    setGlobalRules(updatedRules);
    saveToLocalStorage('globalRules', updatedRules);

    setFormData(prev => ({
      ...prev,
      reglasPropiedad: prev.reglasPropiedad.filter(r => r !== ruleToRemove)
    }));
  };

  const handleImageFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);

    const fileReaders = newFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then(newImageUrls => {
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImageUrls]
      }));
    });

    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(formData.imagenes[indexToRemove]);
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }));
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSetMainImage = (indexToPromote) => {
    if (indexToPromote === 0) return;

    const newImages = [...formData.imagenes];
    const [promotedUrl] = newImages.splice(indexToPromote, 1);
    newImages.unshift(promotedUrl);
    setFormData(prev => ({ ...prev, imagenes: newImages }));

    if (imageFiles.length === formData.imagenes.length) {
      const newImageFiles = [...imageFiles];
      const [promotedFile] = newImageFiles.splice(indexToPromote, 1);
      newImageFiles.unshift(promotedFile);
      setImageFiles(newImageFiles);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedEstadiaMinima = parseInt(formData.estadiaMinima);
    const finalEstadiaMinima = (isNaN(parsedEstadiaMinima) || parsedEstadiaMinima < 1) ? 1 : parsedEstadiaMinima;

    const finalProperty = {
      ...formData,
      precio: formData.precioPorNoche === '' ? null : parseFloat(formData.precioPorNoche),
      precioPorNoche: formData.precioPorNoche === '' ? null : parseFloat(formData.precioPorNoche),
      precioPorSemana: formData.precioPorSemana === '' ? null : parseFloat(formData.precioPorSemana),
      precioPorMes: formData.precioPorMes === '' ? null : parseFloat(formData.precioPorMes),
      capacidadPersonas: formData.capacidadPersonas === '' ? 0 : parseInt(formData.capacidadPersonas),
      habitaciones: formData.habitaciones === '' ? 0 : parseInt(formData.habitaciones),
      banos: formData.banos === '' ? 0 : parseInt(formData.banos),
      superficieM2: formData.superficieM2 === '' ? 0 : parseInt(formData.superficieM2),
      estadiaMinima: finalEstadiaMinima,

      ubicacion: formData.localidad,
      esAlquilerTemporario: true,
    };

    onSave(finalProperty, imageFiles);
  };

  const selectedCurrencySymbol = AVAILABLE_CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <span>Editar Propiedad Temporal</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="col-span-full text-lg font-semibold text-gray-800">Datos Principales</h3>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">Título *</label>
            <input type="text" name="titulo" id="titulo" value={formData.titulo} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Hermoso Apartamento..." required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoPropiedad">Tipo de Propiedad *</label>
            <select name="tipoPropiedad" id="tipoPropiedad" value={formData.tipoPropiedad} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Local">Local/Oficina</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="direccion">Dirección *</label>
            <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Av. 10 Norte 245" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="barrio">Barrio</label>
            <input type="text" name="barrio" id="barrio" value={formData.barrio} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Centro" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="localidad">Localidad / Ubicación *</label>
            <input type="text" name="localidad" id="localidad" value={formData.localidad} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: La Plata" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provincia">Provincia *</label>
            <input type="text" name="provincia" id="provincia" value={formData.provincia} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Ej: Buenos Aires" required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estado">Estado *</label>
            <select name="estado" id="estado" value={formData.estado} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
              <option value="Disponible">Disponible</option>
              <option value="Reservado">No Disponible</option>
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">Descripción *</label>
            <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="Descripción detallada de la propiedad" rows="3" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 p-4 border rounded-lg">
          <h3 className="col-span-full text-lg font-semibold text-gray-800">Características</h3>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="habitaciones">Habitaciones</label>
            <input type="number" name="habitaciones" id="habitaciones" value={formData.habitaciones} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 3" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="banos">Baños</label>
            <input type="number" name="banos" id="banos" value={formData.banos} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 2" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="superficieM2">Superficie (m²)</label>
            <input type="number" name="superficieM2" id="superficieM2" value={formData.superficieM2} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" placeholder="Ej: 65" />
          </div>



          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacidadPersonas">Capacidad de Personas</label>
            <input type="number" name="capacidadPersonas" id="capacidadPersonas" value={formData.capacidadPersonas} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="1" placeholder="Ej: 4" />
          </div>
        </div>

        <div className="mb-6 p-4 border border-gray-400 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Precios Base y Moneda</h3>

          <div className='mb-4'>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">Moneda Base *</label>
            <select name="currency" id="currency" value={formData.currency} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" required>
              {AVAILABLE_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="number" name="precioPorNoche" placeholder={`Noche (${selectedCurrencySymbol})`} value={formData.precioPorNoche} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />
            <input type="number" name="precioPorSemana" placeholder={`Semana (${selectedCurrencySymbol})`} value={formData.precioPorSemana} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />
            <input type="number" name="precioPorMes" placeholder={`Mes (${selectedCurrencySymbol})`} value={formData.precioPorMes} onChange={handleInputChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700" min="0" />

          </div>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Horarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="horarioCheckIn">Horario Check-In</label>
              <input type="time" name="horarioCheckIn" id="horarioCheckIn" value={formData.horarioCheckIn} onChange={handleInputChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="horarioCheckOut">Horario Check-Out</label>
              <input type="time" name="horarioCheckOut" id="horarioCheckOut" value={formData.horarioCheckOut} onChange={handleInputChange} className="shadow border rounded-lg w-full py-2 px-3 text-gray-700" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1" htmlFor="estadiaMinima">Estadía Mínima (noches) *</label>
              <input
                type="number"
                name="estadiaMinima"
                id="estadiaMinima"
                value={formData.estadiaMinima}
                onChange={handleInputChange}
                className="shadow border rounded-lg w-full py-2 px-3 text-gray-700"
                min="1"
                placeholder="Ej: 3"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 border rounded-lg">
            <label className="block text-gray-700 text-sm font-bold mb-3">Servicios y Especificaciones</label>

            <div className="p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto mb-4">
              <p className="font-semibold text-xs mb-2 text-gray-700 border-b pb-1">Seleccionar Servicios:</p>
              <div className="grid grid-cols-2 gap-2">
                {allServices.map((service, index) => (
                  <div key={service} className="flex items-center justify-between group">
                    <label className="flex-1 flex items-center text-gray-700 text-sm">
                      <input
                        type="checkbox"
                        name="servicios"
                        value={service}
                        checked={formData.servicios.includes(service)}
                        onChange={handleInputChange}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                      />
                      {editingService === index ? (
                        <input
                          type="text"
                          value={editServiceValue}
                          onChange={(e) => setEditServiceValue(e.target.value)}
                          className="border-b border-gray-400 px-1 py-0.5 text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        <span>{service}</span>
                      )}
                    </label>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingService === index ? (
                        <button
                          type="button"
                          onClick={(e) => handleSaveService(e, index)}
                          className="text-green-500 hover:text-green-700"
                          title="Guardar"
                        >
                          <FaSave className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditService(service, index)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className='text-xs text-gray-600 block'>Agregar Servicio Personalizado:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Sauna, Conserje 24/7"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewService(e)}
                  className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddNewService}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition duration-150 flex items-center justify-center whitespace-nowrap min-w-[100px]"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

          </div>

          <div className="p-4 border rounded-lg">
            <label className="block text-gray-700 text-sm font-bold mb-3">Reglas de la Propiedad</label>

            <div className="p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto mb-4">
              <p className="font-semibold text-xs mb-2 text-gray-700 border-b pb-1">Seleccionar Reglas:</p>
              <div className="grid grid-cols-1 gap-2">
                {allRules.map((regla, index) => (
                  <div key={regla} className="flex items-center justify-between group">
                    <label className="flex-1 flex items-center text-gray-700 text-sm">
                      <input
                        type="checkbox"
                        name="reglasPropiedad"
                        value={regla}
                        checked={formData.reglasPropiedad.includes(regla)}
                        onChange={handleInputChange}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                      />
                      {editingRule === index ? (
                        <input
                          type="text"
                          value={editRuleValue}
                          onChange={(e) => setEditRuleValue(e.target.value)}
                          className="border-b border-gray-400 px-1 py-0.5 text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        <span>{regla}</span>
                      )}
                    </label>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingRule === index ? (
                        <button
                          type="button"
                          onClick={(e) => handleSaveRule(e, index)}
                          className="text-green-500 hover:text-green-700"
                          title="Guardar"
                        >
                          <FaSave className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditRule(regla, index)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(regla)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className='text-xs text-gray-600 block'>Agregar Regla Personalizada:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: No se permiten fiestas"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewRule(e)}
                  className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddNewRule}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition duration-150 flex items-center justify-center whitespace-nowrap min-w-[100px]"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-full mb-6 p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">Imágenes de la propiedad</label>
          <input type="file" id="image-upload" multiple onChange={handleImageFileChange} className="shadow border rounded-lg w-full py-3 px-4 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

          {formData.imagenes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {formData.imagenes.map((imgData, index) => {
                let imgSrc;
                if (typeof imgData === 'string') {
                  if (imgData.startsWith('data:') || imgData.startsWith('blob:') || imgData.startsWith('http')) {
                    imgSrc = imgData;
                  } else {
                    imgSrc = `data:image/jpeg;base64,${imgData}`;
                  }
                } else if (typeof imgData === 'object' && imgData !== null) {
                  imgSrc = imgData.url || imgData.rutaArchivo || 'https://via.placeholder.com/100?text=No+Image';
                } else {
                  imgSrc = 'https://via.placeholder.com/100?text=Invalid+Image';
                }

                return (
                  <div key={index} className="relative group">
                    <div className={`
                      relative 
                      h-24 w-24 
                      object-cover rounded-lg shadow-md border 
                      ${index === 0 ? 'border-4 border-yellow-500' : 'border-gray-200'}
                    `}>
                      <img
                        src={imgSrc}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Error+loading+image';
                        }}
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
                );
              })}
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
          >
            <FaSave />
            <span>Guardar Cambios</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
          >
            <FaTimes />
            <span>Cancelar</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPropertyForm;