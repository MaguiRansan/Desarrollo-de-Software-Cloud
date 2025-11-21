import React, { useState, useEffect } from 'react';
import { FaCog, FaDatabase, FaSave } from "react-icons/fa";
import AdminLayout from '../AdminLayout';
import { API_BASE_URL } from '../../../config/apiConfig';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: FaCog },
    { id: 'sistema', name: 'Sistema', icon: FaDatabase },
  ];

  const renderInput = (label, type = 'text', value = '', onChange = () => { }, options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
    </div>
  );

  const [formData, setFormData] = useState({
    general: {
      nombreEmpresa: 'MKalpin Negocios Inmobiliarios',
      telefonoPrincipal: '+598 99 123 456',
      emailPrincipal: 'info@mkalpin.com',
      direccion: 'Montevideo, Uruguay',
    },
    sistema: {
      zonaHoraria: 'UTC-3 (Montevideo)',
      moneda: 'USD - Dólar Americano',
      idioma: 'Español',
      formatoFecha: 'DD/MM/YYYY',
    }
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const sections = ['general', 'sistema'];
    sections.forEach(async (section) => {
      try {
        const res = await fetch(`${API_BASE_URL}/Config/settings/${section}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json?.status && json?.data) {
          setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...json.data } }));
        }
      } catch (err) {
        console.error('Error loading settings', section, err);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const section = activeTab;
      const payload = formData[section] || {};
      const res = await fetch(`${API_BASE_URL}/Config/settings/${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error en la petición');
      const json = await res.json();
      if (json?.status) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Error saving settings', err);
      setSaveStatus('error');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">⚙️ Configuración del Sistema</h1>
        <p className="text-gray-600">Administra las configuraciones generales y preferencias del sistema </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
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
        <div className="p-8">
          {activeTab === 'general' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Nombre de la Empresa', 'text', formData.general.nombreEmpresa, (v) => handleInputChange('general', 'nombreEmpresa', v))}
                {renderInput('Teléfono Principal', 'tel', formData.general.telefonoPrincipal, (v) => handleInputChange('general', 'telefonoPrincipal', v))}
                {renderInput('Email Principal', 'email', formData.general.emailPrincipal, (v) => handleInputChange('general', 'emailPrincipal', v))}
                {renderInput('Dirección', 'text', formData.general.direccion, (v) => handleInputChange('general', 'direccion', v))}
              </div>
            </section>
          )}

          {activeTab === 'sistema' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ajustes del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Zona Horaria', 'select', formData.sistema.zonaHoraria, (v) => handleInputChange('sistema', 'zonaHoraria', v), [
                  'UTC-3 (Montevideo)',
                  'UTC-3 (Buenos Aires)',
                  'UTC-5 (Lima)',
                ])}
                {renderInput('Moneda por Defecto', 'select', formData.sistema.moneda, (v) => handleInputChange('sistema', 'moneda', v), [
                  'USD - Dólar Americano',
                  'UYU - Peso Uruguayo',
                  'ARS - Peso Argentino',
                ])}
                {renderInput('Idioma', 'select', formData.sistema.idioma, (v) => handleInputChange('sistema', 'idioma', v), ['Español', 'English', 'Português'])}
                {renderInput('Formato de Fecha', 'select', formData.sistema.formatoFecha, (v) => handleInputChange('sistema', 'formatoFecha', v), [
                  'DD/MM/YYYY',
                  'MM/DD/YYYY',
                  'YYYY-MM-DD',
                ])}
              </div>


            </section>
          )}

          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              {saveStatus === 'saving' && <p className="text-gray-600 text-sm">Guardando cambios...</p>}
              {saveStatus === 'success' && <p className="text-green-600 text-sm">Cambios guardados correctamente</p>}
              {saveStatus === 'error' && <p className="text-red-600 text-sm">Error al guardar. Intenta de nuevo.</p>}
            </div>
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
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