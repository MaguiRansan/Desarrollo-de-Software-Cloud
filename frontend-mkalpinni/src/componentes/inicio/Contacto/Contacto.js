import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { useState } from 'react';
import Header from '../Componentes/Header';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import contactoImage from './pexels-freestockpro-7599735.jpg';
import Footer from '../Componentes/Footer';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Gracias por contactarnos. Nos pondremos en contacto contigo pronto.');
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
                className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300"
              >
                Enviar
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
