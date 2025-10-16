import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';

const mockClients = [];

const RegistroClienteForm = ({ rolSeleccionado, tipoAlquiler, clienteData, onSave, onAddProperty }) => {
  const [formData, setFormData] = useState(clienteData || {
    nombreApellido: '',
    dni: '',
    fechaNacimiento: '',
    nacionalidad: '',
    estadoCivil: '',
    telefono: '',
    email: '',
    domicilio: '',
    profesion: '',
    empresa: '',
    ingresosMensuales: '',
    reciboSueldo: null,
    cuitCuil: '',
    tienePropiedad: false,
    rol: rolSeleccionado || '',
    tipoAlquiler: tipoAlquiler || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {clienteData ? 'Detalles del Cliente' : 'Registro de Cliente'}
          </h2>
          <p className="text-gray-600">
            {clienteData ? 'Información detallada del cliente' : 'Complete la información del nuevo cliente'}
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full font-medium">
            <FaUser className="inline mr-2" />
            Rol: {formData.rol || "No seleccionado"}
          </div>
          {formData.tipoAlquiler && (
            <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-full font-medium">
              Tipo: {formData.tipoAlquiler}
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="nombreApellido">Nombre y Apellido *</label>
              <input type="text" id="nombreApellido" name="nombreApellido" value={formData.nombreApellido} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="dni">DNI o Documento de Identidad *</label>
              <input type="text" id="dni" name="dni" value={formData.dni} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
              <input type="date" id="fechaNacimiento" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="nacionalidad">Nacionalidad *</label>
              <input type="text" id="nacionalidad" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="estadoCivil">Estado Civil *</label>
              <select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required disabled={clienteData !== null}>
                <option value="">Seleccionar...</option>
                <option value="Soltero">Soltero/a</option>
                <option value="Casado">Casado/a</option>
                <option value="Divorciado">Divorciado/a</option>
                <option value="Viudo">Viudo/a</option>
                <option value="Unión Civil">Unión Civil</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="rol">Rol *</label>
              <select id="rol" name="rol" value={formData.rol} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required disabled={clienteData !== null}>
                <option value="">Seleccionar...</option>
                <option value="Locador">Locador</option>
                <option value="Locatario">Locatario</option>
                <option value="Propietario">Propietario</option>
                <option value="Comprador">Comprador</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Datos de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="telefono">Teléfono *</label>
              <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">Correo Electrónico *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2" htmlFor="domicilio">Domicilio Real *</label>
              <input type="text" id="domicilio" name="domicilio" value={formData.domicilio} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required readOnly={clienteData !== null} />
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Información Laboral y Financiera 
            <span className="text-sm font-normal text-gray-500 ml-2">(especialmente para alquileres o compras a crédito)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="profesion">Profesión u Ocupación</label>
              <input type="text" id="profesion" name="profesion" value={formData.profesion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="empresa">Nombre de la Empresa</label>
              <input type="text" id="empresa" name="empresa" value={formData.empresa} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="ingresosMensuales">Ingresos Mensuales</label>
              <input type="number" id="ingresosMensuales" name="ingresosMensuales" value={formData.ingresosMensuales} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" readOnly={clienteData !== null} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="cuitCuil">CUIT/CUIL</label>
              <input type="text" id="cuitCuil" name="cuitCuil" value={formData.cuitCuil} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" readOnly={clienteData !== null} />
            </div>
            {!clienteData && (
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="reciboSueldo">Recibo de Sueldo o Constancia de Ingresos</label>
                <input type="file" id="reciboSueldo" name="reciboSueldo" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            )}
          </div>
        </div>
        {!clienteData && (
          <div className="mb-8">
            <div className="flex items-center">
              <input type="checkbox" id="tienePropiedad" name="tienePropiedad" checked={formData.tienePropiedad} onChange={handleChange} className="mr-2 h-5 w-5 text-green-500 focus:ring-green-500" />
              <label className="text-gray-700" htmlFor="tienePropiedad">¿Ya tiene una propiedad registrada?</label>
            </div>
            {!formData.tienePropiedad && (
              <div className="mt-4 flex justify-start">
                <button
                  type="button"
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-full transition-colors duration-300"
                  onClick={onAddProperty}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Agregar Propiedad
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-full transition-colors duration-300" onClick={() => window.history.back()}>
            {clienteData ? 'Volver' : 'Cancelar'}
          </button>
          {!clienteData && (
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300">
              Guardar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const ClientesTilesView = ({ rolSeleccionado, tipoAlquiler, onSelect, onBack, onNewClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredClients = mockClients.filter(client => {
    const matchesRole = rolSeleccionado === 'Propietario' || rolSeleccionado === 'Comprador' 
      ? client.rol === rolSeleccionado 
      : (client.rol === rolSeleccionado) && (client.tipoAlquiler === tipoAlquiler);
    const matchesSearch = !searchTerm || 
      client.nombreApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.dni.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors" onClick={onBack}>← Volver</button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
            <p className="text-gray-600">
              {rolSeleccionado === 'Propietario' || rolSeleccionado === 'Comprador' 
                ? `Clientes registrados como ${rolSeleccionado}` 
                : `${tipoAlquiler} - ${rolSeleccionado}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 text-green-800 py-2 px-4 rounded-full font-medium">
              <FaUser className="inline mr-2" />
              {rolSeleccionado}
            </div>
            {(rolSeleccionado === 'Locador' || rolSeleccionado === 'Locatario') && (
              <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-full font-medium">
                {tipoAlquiler}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar por nombre, DNI o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors" onClick={onNewClient}>
              <FaPlus className="mr-2" />
              Nuevo Cliente
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredClients.length}</div>
            <div className="text-sm text-gray-600">Total mostrados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockClients.filter(c => c.rol === rolSeleccionado).length}
            </div>
            <div className="text-sm text-gray-600">Total en BD</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {searchTerm ? filteredClients.length : mockClients.filter(c => c.rol === rolSeleccionado).length}
            </div>
            <div className="text-sm text-gray-600">Coincidencias</div>
          </div>
        </div>
      </div>
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" onClick={() => onSelect(client)}>
              <div className="p-6">
                <div className="flex items-start">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{client.nombreApellido}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600"><span className="font-medium">DNI:</span> {client.dni}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Tel:</span> {client.telefono}</p>
                      <p className="text-sm text-gray-600 truncate"><span className="font-medium">Email:</span> {client.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{client.profesion}</span>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEye size={16} /></button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><FaEdit size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Prueba con otros términos de búsqueda' 
              : `No hay clientes registrados para el rol ${rolSeleccionado}.`
            }
          </p>
          {!searchTerm && (
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 inline-flex items-center" onClick={onNewClient}>
              <FaPlus className="mr-2" />
              Registrar Nuevo Cliente
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const TipoAlquilerOptions = ({ rolSeleccionado, onSelect, onBack }) => {
  const options = [
    { title: "Alquiler Temporario", imageUrl: "/api/placeholder/320/320" },
    { title: "Alquiler", imageUrl: "/api/placeholder/320/320" }
  ];
  const filteredOptions = (rolSeleccionado === "Locador" || rolSeleccionado === "Locatario") 
    ? options 
    : [];
  return (
    <div className="p-8">
      <button className="mb-6 flex items-center text-green-600 hover:text-green-800 font-medium" onClick={onBack}>
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Volver
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Seleccione el tipo de alquiler</h2>
          <div className="bg-green-100 text-green-800 py-1 px-4 rounded-full font-medium">Rol: {rolSeleccionado}</div>
        </div>
        <div className="flex flex-wrap justify-center">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div key={index} className="flex flex-col items-center w-64 bg-white rounded-lg shadow-md p-6 m-2 cursor-pointer" onClick={() => onSelect(option.title)}>
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6">
                  <img src={option.imageUrl} alt={option.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{option.title}</h3>
                <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300">Seleccionar</button>
              </div>
            ))
          ) : (
            <div className="text-center w-full">
              <p className="text-gray-600 mb-6">Este rol no requiere selección de tipo de alquiler.</p>
              <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300" onClick={() => onSelect(null)}>Continuar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InmoBadge = ({ title, count = 0, imageUrl, setRolSeleccionado, setTipoAlquiler, setView }) => {
  const getIcon = (title) => {
    switch(title) {
      case 'Locador': return '🏠';
      case 'Locatario': return '👤';
      case 'Propietario': return '🏢';
      case 'Comprador': return '🛒';
      default: return '📋';
    }
  };
  const getColor = (title) => {
    switch(title) {
      case 'Locador': return 'from-blue-400 to-blue-600';
      case 'Locatario': return 'from-green-400 to-green-600';
      case 'Propietario': return 'from-purple-400 to-purple-600';
      case 'Comprador': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getColor(title)} flex items-center justify-center mb-4 mx-auto`}>
        <span className="text-2xl">{getIcon(title)}</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-blue-600">{count}</span>
          <span className="ml-2 text-sm text-gray-600">registrados</span>
        </div>
        <button
          className={`w-full bg-gradient-to-r ${getColor(title)} text-white font-medium py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300`}
          onClick={() => {
            setRolSeleccionado(title);
            if (title === 'Propietario' || title === 'Comprador') {
              setTipoAlquiler(null);
              setView('clientesTiles');
            } else {
              setView('tipoAlquiler');
            }
          }}
        >
          Gestionar {title}
        </button>
      </div>
    </div>
  );
};

const RegistroCliente = () => {
  const [view, setView] = useState('main');
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [tipoAlquiler, setTipoAlquiler] = useState('');
  const [setSelectedClient] = useState(null);
  
  const badgeTypes = [
    { title: "Locador", count: 2, imageUrl: "/api/placeholder/320/320" },
    { title: "Locatario", count: 3, imageUrl: "/api/placeholder/320/320" },
    { title: "Propietario", count: 1, imageUrl: "/api/placeholder/320/320" },
    { title: "Comprador", count: 0, imageUrl: "/api/placeholder/320/320" }
  ];
  
  const handleAddPropertyClick = () => {
    alert('Funcionalidad de "Agregar Propiedad" llamada. Aquí iría la lógica para abrir el formulario de propiedades.');
  };

  const renderView = () => {
    switch(view) {
      case 'main':
        return (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
                  <p className="text-gray-600">Administra la base de datos de todos los clientes</p>
                </div>
                <button
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                  onClick={() => setView('form')}
                >
                  <FaPlus className="mr-2" />
                  Registrar Cliente
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen General</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgeTypes.map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{badge.count}</div>
                    <div className="text-sm text-gray-600">{badge.title}s</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badgeTypes.map((badge, index) => (
                <InmoBadge
                  key={index}
                  title={badge.title}
                  count={badge.count}
                  imageUrl={badge.imageUrl}
                  setRolSeleccionado={setRolSeleccionado}
                  setTipoAlquiler={setTipoAlquiler}
                  setView={setView}
                />
              ))}
            </div>
          </div>
        );
      case 'tipoAlquiler':
        return (
          <TipoAlquilerOptions
            rolSeleccionado={rolSeleccionado}
            onSelect={(tipo) => {
              setTipoAlquiler(tipo);
              setView('clientesTiles');
            }}
            onBack={() => setView('main')}
          />
        );
      case 'clientesTiles':
        return (
          <ClientesTilesView
            rolSeleccionado={rolSeleccionado}
            tipoAlquiler={tipoAlquiler}
            onSelect={(client) => {
              setSelectedClient(client);
            }}
            onBack={() => setView('tipoAlquiler')}
            onNewClient={() => {
              setSelectedClient(null);
              setView('form');
            }}
          />
        );
      case 'form':
        return (
          <div className="p-8">
            <button
              className="mb-6 flex items-center text-green-600 hover:text-green-800 font-medium"
              onClick={() => {
                if (tipoAlquiler) {
                  setView('clientesTiles');
                } else {
                  setView('main');
                }
              }}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver
            </button>
            <RegistroClienteForm
              rolSeleccionado={rolSeleccionado}
              tipoAlquiler={tipoAlquiler}
              onAddProperty={handleAddPropertyClick}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      {renderView()}
    </AdminLayout>
  );
};

export default RegistroCliente;