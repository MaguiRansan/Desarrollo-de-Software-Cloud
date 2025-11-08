import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import Header from '../Componentes/Header';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import contactoImage from './pexels-freestockpro-7599735.jpg';
import Footer from '../Componentes/Footer';
import { API_BASE_URL } from '../../../config/apiConfig';
const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/Contacto/Enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ success: true, message: data.message });
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          mensaje: ''
        });
      } else {
        throw new Error(data.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.message || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <img
            src={contactoImage}
            alt="Contacto"
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>
        <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Contáctanos</h2>
          {submitStatus.message && (
            <div className={`p-4 mb-6 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {submitStatus.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-lg font-medium text-gray-700">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-lg font-medium text-gray-700">Teléfono:</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="mensaje" className="block text-lg font-medium text-gray-700">Mensaje:</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
     <Footer/>
    </div>
  );
};

export default Contacto;
