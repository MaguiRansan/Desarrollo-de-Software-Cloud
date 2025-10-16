import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';
import Header from '../inicio/Componentes/Header';
import Footer from '../inicio/Componentes/Footer';

const Form = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const isConfirmed = window.confirm("¿Estás seguro de que deseas enviar los documentos?");

    if (isConfirmed) {
      window.location.href = "/cliente/iniciocliente";
    } else {
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-12 text-center">Cargar Documentos</h1>
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Documentos Personales */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Documentos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Identificación Oficial</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de Domicilio</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                  <select className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="soltero">Soltero/a</option>
                    <option value="casado">Casado/a</option>
                    <option value="divorciado">Divorciado/a</option>
                    <option value="viudo">Viudo/a</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Comprobantes Financieros */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Comprobantes Financieros</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recibos de Sueldo</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Declaración de Impuestos</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carta Laboral</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Garantía o Aval */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Garantía o Aval</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escritura del Inmueble</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DNI del Avalista</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seguro de Caución</label>
                  <input type="file" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="mt-12 text-center">
              <button type="submit" className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Form;