import React, { useState } from 'react';
import { FaCog, FaUser, FaBell, FaLock, FaDatabase, FaSave } from "react-icons/fa";
import AdminLayout from '../AdminLayout';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: FaCog },
    { id: 'usuario', name: 'Usuario', icon: FaUser },
    { id: 'notificaciones', name: 'Notificaciones', icon: FaBell },
    { id: 'seguridad', name: 'Seguridad', icon: FaLock },
    { id: 'sistema', name: 'Sistema', icon: FaDatabase },
  ];

  const renderInput = (label, type = 'text', defaultValue = '', options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {options ? (
        <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {options.map((opt, i) => <option key={i}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">⚙️ Configuración del Sistema</h1>
        <p className="text-gray-600">Administra las configuraciones generales y preferencias del sistema </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Navegación de pestañas */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex flex-wrap gap-4 px-6 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all 
                    ${isActive ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido dinámico */}
        <div className="p-8">
          {activeTab === 'general' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Nombre de la Empresa', 'text', 'MKalpin Negocios Inmobiliarios')}
                {renderInput('Teléfono Principal', 'tel', '+598 99 123 456')}
                {renderInput('Email Principal', 'email', 'info@mkalpin.com')}
                {renderInput('Dirección', 'text', 'Montevideo, Uruguay')}
              </div>
            </section>
          )}

          {activeTab === 'usuario' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información del Usuario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Nombre Completo', 'text', 'Marcelo Kalpin')}
                {renderInput('Email', 'email', 'marcelo@mkalpin.com')}
                {renderInput('Rol', 'select', '', ['Administrador', 'Manager', 'Usuario'])}
                {renderInput('Teléfono', 'tel', '+598 99 123 456')}
              </div>
            </section>
          )}

          {activeTab === 'notificaciones' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferencias de Notificaciones</h3>
              <div className="space-y-5">
                {[
                  { title: 'Nuevos clientes', desc: 'Recibir alertas cuando se registre un nuevo cliente.' },
                  { title: 'Nuevas propiedades', desc: 'Notificación al agregar una nueva propiedad.' },
                  { title: 'Pagos vencidos', desc: 'Alertas sobre pagos vencidos o próximos a vencer.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:left-[2px] after:top-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'seguridad' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Seguridad</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Contraseña Actual', 'password')}
                  {renderInput('Nueva Contraseña', 'password')}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Autenticación de Dos Factores (2FA)</p>
                    <p className="text-sm text-gray-600">Aumenta la seguridad de tu cuenta activando 2FA.</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Activar 2FA
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'sistema' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ajustes del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Zona Horaria', 'select', '', [
                  'UTC-3 (Montevideo)',
                  'UTC-3 (Buenos Aires)',
                  'UTC-5 (Lima)',
                ])}
                {renderInput('Moneda por Defecto', 'select', '', [
                  'USD - Dólar Americano',
                  'UYU - Peso Uruguayo',
                  'ARS - Peso Argentino',
                ])}
                {renderInput('Idioma', 'select', '', ['Español', 'English', 'Português'])}
                {renderInput('Formato de Fecha', 'select', '', [
                  'DD/MM/YYYY',
                  'MM/DD/YYYY',
                  'YYYY-MM-DD',
                ])}
              </div>

              <div className="mt-8 border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Respaldo de Datos</h4>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                    <FaDatabase className="mr-2" />
                    Crear Respaldo
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Restaurar Respaldo
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Botón Guardar */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center shadow-sm">
              <FaSave className="mr-2" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Configuracion;
