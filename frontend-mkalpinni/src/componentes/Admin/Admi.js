import React from 'react';
import { Link } from "react-router-dom";
import { FaHome, FaBuilding, FaCalendarAlt, FaPlus, FaEye, FaArrowUp, FaArrowDown } from "react-icons/fa";
import AdminLayout from './AdminLayout';
import { useAdminData, useStats } from '../../hooks/useAdminData';
import { useUser } from '../../Context/UserContext';
import { PageLoader } from './LoadingSpinner';

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
    properties = [], 
    isLoading, 
    error 
  } = useAdminData('all');
  
  const { stats = {} } = useStats();
  const { user } = useUser();

  const safeStats = {
    propiedadesDisponibles: stats?.propiedadesDisponibles || 0,
    propiedadesOcupadas: stats?.propiedadesOcupadas || 0,
  };

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
        { label: `${safeStats.propiedadesDisponibles} Disponibles`, color: 'text-green-600' },
        { label: `${safeStats.propiedadesOcupadas} Ocupadas`, color: 'text-blue-600' }
      ],
      trend: 5
    }
  ];

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu de administrador</h1>
            <p className="text-gray-600 mt-1">Resumen general de la gestión inmobiliaria</p>
          </div>
          <div className="flex space-x-3">
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

      <div className="grid grid-cols-1 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
      </div>
    </AdminLayout>
  );
};

export default Admin;