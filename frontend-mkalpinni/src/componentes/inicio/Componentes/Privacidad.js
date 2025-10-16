import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 1,
      title: "Introducción",
      content: (
        <p className="text-gray-700 leading-relaxed">
          En <strong className="text-blue-600">Mkalpin Negocios Inmobiliarios</strong>, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, compartimos y protegemos tu información cuando utilizas nuestro sitio web.
        </p>
      ),
    },
    {
      id: 2,
      title: "Información que Recopilamos",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.1 Información Personal:</strong> Recopilamos información que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y dirección postal cuando te registras o utilizas nuestros servicios.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.2 Información de Uso:</strong> Recopilamos datos sobre cómo interactúas con la Plataforma, como las páginas que visitas, el tiempo que pasas en ellas y las acciones que realizas.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.3 Información Técnica:</strong> Recopilamos información técnica, como tu dirección IP, tipo de navegador, sistema operativo y detalles del dispositivo que utilizas para acceder a la Plataforma.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Cómo Utilizamos tu Información",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">3.1 Para Proveer Servicios:</strong> Utilizamos tu información para brindarte acceso a la Plataforma, gestionar tu cuenta y ofrecerte nuestros servicios.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">3.2 Para Mejorar la Plataforma:</strong> Analizamos los datos de uso para mejorar la funcionalidad, el rendimiento y la experiencia del usuario en la Plataforma.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">3.3 Para Comunicarnos Contigo:</strong> Utilizamos tu información para enviarte actualizaciones, notificaciones y respuestas a tus consultas.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Compartición de Información",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">4.1 Con Terceros:</strong> No compartimos tu información personal con terceros, excepto cuando sea necesario para proveer nuestros servicios, cumplir con la ley o proteger nuestros derechos.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">4.2 Con Proveedores de Servicios:</strong> Podemos compartir tu información con proveedores de servicios que nos ayudan a operar la Plataforma, como empresas de hosting, análisis y soporte técnico.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Seguridad de tus Datos",
      content: (
        <p className="text-gray-700 leading-relaxed">
          Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra accesos no autorizados, alteraciones, divulgaciones o destrucción. Sin embargo, ningún sistema es completamente seguro, por lo que no podemos garantizar la seguridad absoluta de tus datos.
        </p>
      ),
    },
    {
      id: 6,
      title: "Tus Derechos",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">6.1 Acceso y Rectificación:</strong> Tienes derecho a acceder a tu información personal y solicitar correcciones si es inexacta o incompleta.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">6.2 Eliminación:</strong> Puedes solicitar que eliminemos tu información personal, siempre que no estemos obligados a conservarla por motivos legales.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">6.3 Oposición:</strong> Tienes derecho a oponerte al procesamiento de tu información personal en ciertas circunstancias.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Cambios en esta Política",
      content: (
        <p className="text-gray-700 leading-relaxed">
          Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cualquier cambio significativo publicando la nueva versión en la Plataforma. Te recomendamos revisar esta página periódicamente para mantenerte informado.
        </p>
      ),
    },
    {
      id: 8,
      title: "Contacto",
      content: (
        <div>
          <p className="text-gray-700 leading-relaxed">
            Si tienes alguna pregunta sobre esta Política de Privacidad o cómo manejamos tus datos, contáctanos a través de{' '}
            <a href="mailto:info@inmobiliaria.com" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 decoration-blue-300 underline-offset-2">
              mkalpinni@gmail.com
            </a>.
          </p>
          <div className="mt-6 bg-blue-100 rounded-lg p-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              Estamos aquí para ayudarte y resolver cualquier duda relacionada con tu privacidad.
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow py-12"> {/* Padding vertical para separar del Header y Footer */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            Política de Privacidad
          </h1>
          <p className="text-gray-600 italic">Última actualización: 01/03/2025</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            {sections.map((section) => (
              <section key={section.id} className="mb-10 hover:bg-blue-50 p-6 rounded-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                    {section.id}
                  </div>
                  <h2 className="text-2xl font-semibold text-blue-800">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-14">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;