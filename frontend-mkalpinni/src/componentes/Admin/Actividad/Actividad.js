import React from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar, FaClock } from "react-icons/fa";
import AdminLayout from '../AdminLayout';

const Actividad = () => {
  const actividades = [
    {
      id: 1,
      tipo: 'cliente',
      titulo: 'Nuevo cliente registrado',
      descripcion: 'Juan Pérez se registró como locatario',
      fecha: '2024-01-15 10:30',
      icon: FaUser,
      color: 'green'
    },
    {
      id: 2,
      tipo: 'propiedad',
      titulo: 'Nueva propiedad agregada',
      descripcion: 'Casa en Punta del Este - $250,000',
      fecha: '2024-01-15 09:15',
      icon: FaHome,
      color: 'blue'
    },
    {
      id: 3,
      tipo: 'pago',
      titulo: 'Pago recibido',
      descripcion: 'Alquiler enero - $1,200',
      fecha: '2024-01-14 16:45',
      icon: FaMoneyBillWave,
      color: 'yellow'
    },
    {
      id: 4,
      tipo: 'reserva',
      titulo: 'Nueva reserva',
      descripcion: 'Apartamento centro - 5 días',
      fecha: '2024-01-14 14:20',
      icon: FaCalendarAlt,
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[color] || colors.blue;
  };

  const getIconBg = (color) => {
    const colors = {
      green: 'bg-green-100',
      blue: 'bg-blue-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Actividad Reciente</h1>
        <p className="text-gray-600">Historial de actividades y eventos del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Todos</option>
              <option value="cliente">Clientes</option>
              <option value="propiedad">Propiedades</option>
              <option value="pago">Pagos</option>
              <option value="reserva">Reservas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividades Recientes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {actividades.map((actividad) => {
            const Icon = actividad.icon;
            return (
              <div key={actividad.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${getIconBg(actividad.color)}`}>
                    <Icon className={`${getIconColor(actividad.color)}`} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{actividad.titulo}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(actividad.color)}`}>
                        {actividad.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{actividad.descripcion}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1" />
                      {actividad.fecha}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Ver más actividades
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Actividad;
