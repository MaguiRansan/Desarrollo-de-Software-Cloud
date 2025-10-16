import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { usePayments } from '../../../hooks/useAdminData';
import { PageLoader } from '../LoadingSpinner';

const Pagos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const { 
    payments: pagos, 
    isLoading, 
    error,
    totalPaid,
    totalPending,
    totalOverdue 
  } = usePayments();

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader message="Cargando datos de pagos..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error al cargar pagos</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pagado':
        return <FaCheck className="text-green-600" />;
      case 'pendiente':
        return <FaMoneyBillWave className="text-yellow-600" />;
      case 'vencido':
        return <FaTimes className="text-red-600" />;
      default:
        return <FaMoneyBillWave className="text-gray-600" />;
    }
  };

  const pagosFiltrados = pagos.filter(pago => {
    const matchesSearch = !searchTerm || 
      (pago.concepto && pago.concepto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pago.inquilino && pago.inquilino.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pago.propiedad && pago.propiedad.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = !filtroEstado || pago.estado === filtroEstado;

    return matchesSearch && matchesEstado;
  });

  const totalPagado = totalPaid;
  const totalPendiente = totalPending;
  const totalVencido = totalOverdue;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pagos</h1>
        <p className="text-gray-600">Administra los pagos de alquileres y comisiones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaCheck className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pagos Realizados</h3>
              <p className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FaMoneyBillWave className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pagos Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600">${totalPendiente.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FaTimes className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pagos Vencidos</h3>
              <p className="text-2xl font-bold text-red-600">${totalVencido.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaMoneyBillWave className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="text-2xl font-bold text-blue-600">${(totalPagado + totalPendiente + totalVencido).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por concepto, inquilino o propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>

            <button className="inline-flex items-center bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              <FaDownload className="mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Pagos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{pago.concepto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{pago.inquilino}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{pago.propiedad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">${pago.monto.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{pago.fechaVencimiento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                      {getEstadoIcon(pago.estado)}
                      <span className="ml-1 capitalize">{pago.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FaEye />
                      </button>
                      {pago.estado === 'pendiente' && (
                        <button className="text-green-600 hover:text-green-900">
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagosFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <FaMoneyBillWave className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
            <p className="text-gray-500">Prueba ajustando los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Pagos;