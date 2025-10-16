import React from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import AdminLayout from './AdminLayout';
import { useAdminData, useStats } from '../../hooks/useAdminData';
import { useUser } from '../../Context/UserContext';
import { PageLoader } from './LoadingSpinner';
import { 
  FaArrowUp, 
  FaArrowDown
} from 'react-icons/fa';

const StatCard = ({ icon, title, values, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className={`p-3 rounded-full ${icon.bgColor} mr-4`}>
            {icon.svg}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="mt-4">
          {values.map((value, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{value.label.split(' ')[1] || value.label}</span>
              <span className={`font-bold text-lg ${value.color}`}>
                {value.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </div>
);

const QuickMetric = ({ title, value, change, icon: Icon, color = "blue" }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {change && (
          <p className={`text-sm flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(change)}% vs mes anterior
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      )}
    </div>
  </div>
);

const ListCard = ({ title, link, items, renderItem, emptyMessage = "No hay elementos disponibles" }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <Link 
        to={link} 
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
      >
        Ver todas
        <FaEye className="ml-2" size={16} />
      </Link>
    </div>
    <div className="space-y-3">
      {items && items.length > 0 ? (
        items.slice(0, 5).map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            {renderItem(item)}
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  </div>
);

const Admin = () => {
  const { 
    properties, 
    clients, 
    payments, 
    isLoading, 
    error 
  } = useAdminData('all');
  
  const { stats } = useStats();
  const { user } = useUser();

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader message="Cargando datos del dashboard..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error al cargar datos</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      icon: {
        svg: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        ),
        bgColor: 'bg-blue-100'
      },
      title: 'Propiedades',
      subtitle: 'Gestión inmobiliaria',
      values: [
        { label: `${stats.propiedadesDisponibles} disponibles`, color: 'text-green-600' },
        { label: `${stats.propiedadesOcupadas} ocupadas`, color: 'text-blue-600' }
      ],
      trend: 5
    },
    {
      icon: {
        svg: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        ),
        bgColor: 'bg-green-100'
      },
      title: 'Clientes',
      subtitle: 'Base de datos',
      values: [
        { label: `${stats.propietarios} propietarios`, color: 'text-green-600' },
        { label: `${stats.inquilinos} inquilinos`, color: 'text-blue-600' }
      ],
      trend: 12
    },
    {
      icon: {
        svg: (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        ),
        bgColor: 'bg-purple-100'
      },
      title: 'Contratos',
      subtitle: 'Documentación legal',
      values: [
        { label: `${stats.contratosActivos} activos`, color: 'text-green-600' }
      ],
      trend: -3
    },
    {
      icon: {
        svg: (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        ),
        bgColor: 'bg-yellow-100'
      },
      title: 'Pagos',
      subtitle: 'Gestión financiera',
      values: [
        { label: `${stats.pagosPendientes} pendientes`, color: 'text-red-600' }
      ],
      trend: 8
    }
  ];

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu de administrador
            </h1>
            <p className="text-gray-600 mt-1">Resumen general de la gestión inmobiliaria</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              to="/admin/clientes" 
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
            >
              <FaPlus className="mr-2" size={16} />
              Nuevo Cliente
            </Link>
            <Link 
              to="/admin/propiedades" 
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <FaPlus className="mr-2" size={16} />
              Nueva Propiedad
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickMetric 
          title="Ingresos Mensuales"
          value={`$${stats.ingresosMensuales.toLocaleString()}`}
          change={15}
          icon={FaMoneyBillWave}
          color="green"
        />
        <QuickMetric 
          title="Ocupación"
          value={`${properties.length > 0 ? Math.round((stats.propiedadesOcupadas / properties.length) * 100) : 0}%`}
          change={5}
          icon={FaCalendarAlt}
          color="blue"
        />
        <QuickMetric 
          title="Total Propiedades"
          value={properties.length}
          change={8}
          icon={FaBuilding}
          color="purple"
        />
        <QuickMetric 
          title="Total Clientes"
          value={clients.length}
          change={12}
          icon={FaUsers}
          color="indigo"
        />
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen Financiero Mensual</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Ingresos Totales</h3>
                <p className="text-2xl font-bold text-green-600">${stats.ingresosMensuales.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Este mes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pagos Pendientes</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pagosPendientes}</p>
                <p className="text-sm text-gray-600 mt-1">Por cobrar</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaCalendarAlt className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tasa de Ocupación</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {properties.length > 0 ? Math.round((stats.propiedadesOcupadas / properties.length) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Del total</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBuilding className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ListCard
          title="Propiedades Recientes"
          link="/admin/propiedades"
          items={properties}
          emptyMessage="No hay propiedades registradas"
          renderItem={(property) => (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{property.title || property.tipo} - {property.address || property.direccion}</h3>
                <p className="text-sm text-gray-600">${(property.price || property.precio)?.toLocaleString() || 'Precio no definido'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                (property.disponible || property.status === 'disponible')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {(property.disponible || property.status === 'disponible') ? 'Disponible' : 'Ocupada'}
              </span>
            </div>
          )}
        />

        <ListCard
          title="Actividad Reciente"
          link="/admin/actividad"
          items={payments}
          emptyMessage="No hay actividad reciente"
          renderItem={(payment) => (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{payment.concepto || payment.concept || 'Pago'}</h3>
                <p className="text-sm text-gray-600">{payment.fecha || payment.date || 'Fecha no definida'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${(payment.monto || payment.amount)?.toLocaleString() || '0'}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  (payment.estado === 'pagado' || payment.status === 'paid') ? 'bg-green-100 text-green-800' : 
                  (payment.estado === 'pendiente' || payment.status === 'pending') ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.estado || payment.status || 'Pendiente'}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </AdminLayout>
  );
};

export default Admin;