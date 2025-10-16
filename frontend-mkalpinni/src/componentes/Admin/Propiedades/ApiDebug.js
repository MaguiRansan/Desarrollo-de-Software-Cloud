import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import { propertyService } from '../../../services/api';
import { useUser } from '../../../Context/UserContext';

const ApiDebug = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const addResult = (operation, result, error = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, {
      id: Date.now(),
      timestamp,
      operation,
      result,
      error,
      success: !error
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testAuth = () => {
    const token = sessionStorage.getItem('authToken');
    const userData = sessionStorage.getItem('userData');
    
    addResult('Test Autenticación', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      hasUserData: !!userData,
      user: user,
      userRole: user?.idrol,
      isAdmin: user?.idrol === 3
    });
  };

  const testGetProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getAll();
      addResult('GET Propiedades', response);
    } catch (error) {
      addResult('GET Propiedades', null, error.message);
    }
    setLoading(false);
  };

  const testCreateProperty = async () => {
    setLoading(true);
    try {
      const testProperty = {
        titulo: 'Propiedad de Prueba',
        descripcion: 'Esta es una propiedad de prueba creada desde el debugger',
        direccion: 'Calle Falsa 123',
        barrio: 'Centro',
        localidad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        tipoPropiedad: 'Casa',
        transaccionTipo: 'Venta',
        precio: 150000,
        habitaciones: 3,
        banos: 2,
        superficieM2: 120,
        estado: 'Disponible',
        activo: true
      };

      const response = await propertyService.create(testProperty);
      addResult('CREATE Propiedad', response);
    } catch (error) {
      addResult('CREATE Propiedad', null, error.message);
    }
    setLoading(false);
  };

  const testSearchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.search({ transaccionTipo: 'Venta' });
      addResult('SEARCH Propiedades', response);
    } catch (error) {
      addResult('SEARCH Propiedades', null, error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">API Debugger</h2>
          <p className="text-gray-600 mb-4">
            Herramienta para probar las operaciones CRUD con la API
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testAuth}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Auth
            </button>
            
            <button
              onClick={testGetProperties}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              GET Props
            </button>
            
            <button
              onClick={testSearchProperties}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              SEARCH Props
            </button>
            
            <button
              onClick={testCreateProperty}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              CREATE Prop
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Resultados</h3>
            <button
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 italic">No hay resultados aún. Ejecuta algún test.</p>
            ) : (
              results.map(result => (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {result.operation}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                  
                  {result.success ? (
                    <pre className="text-sm text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-sm text-red-800 bg-red-100 p-3 rounded">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Procesando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDebug;