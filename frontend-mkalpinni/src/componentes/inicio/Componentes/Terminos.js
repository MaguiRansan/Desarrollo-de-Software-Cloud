import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const TermsAndConditions = () => {
  const sections = [
    {
      id: 1,
      title: "Introducción",
      content: (
        <p className="text-gray-700 leading-relaxed">
          Bienvenido/a a <strong className="text-blue-600">Mkalpin Negocios Inmobiliarios</strong> . Estos términos y condiciones rigen tu acceso y uso de nuestro sitio web. Al utilizar la Plataforma, aceptas cumplir con estos Términos. Si no estás de acuerdo con alguno de estos términos, te recomendamos que no utilices nuestros servicios.
        </p>
      ),
    },
    {
      id: 2,
      title: "Uso de la Plataforma",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.1 Elegibilidad:</strong> Para utilizar la Plataforma como inquilino o propietario, debes ser mayor de 18 años y tener la capacidad legal para celebrar contratos. Si eres menor de edad, necesitarás el consentimiento de un tutor legal.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.2 Licencia de Uso:</strong> Te otorgamos una licencia limitada, no exclusiva, intransferible y revocable para acceder y utilizar la Plataforma de acuerdo con estos Términos.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">2.3 Restricciones:</strong> No está permitido copiar, modificar, distribuir o crear obras derivadas de la Plataforma, ni utilizarla con fines ilegales o no autorizados.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Propiedad Intelectual",
      content: (
        
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">Derechos de Propiedad:</strong> Todo el contenido, diseño, logotipos y funcionalidades de la Plataforma son propiedad exclusiva de <strong className="text-blue-600">Mkalpin Negocios Inmobiliarios</strong> o de sus licenciantes, y están protegidos por las leyes de propiedad intelectual.
            </p>
         
        
      ),
    },
    {
      id: 4,
      title: "Privacidad y Protección de Datos",
      content: (
        <p className="text-gray-700 leading-relaxed">
          Respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Para más información sobre cómo recopilamos, utilizamos y protegemos tu información, consulta nuestra{' '}
          <a href="/politica-de-privacidad" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 decoration-blue-300 underline-offset-2">
            Política de Privacidad
          </a>.
        </p>
      ),
    },
    {
      id: 5,
      title: "Limitación de Responsabilidad",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">5.1 Exclusión de Garantías:</strong> La Plataforma se proporciona "tal cual" y "según disponibilidad". No ofrecemos garantías de ningún tipo, ya sean expresas o implícitas, incluyendo garantías de comerciabilidad o idoneidad para un propósito específico.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-blue-600">5.2 Limitación de Daños:</strong> En ningún caso <strong className="text-blue-600">Mkalpin Negocios Inmobiliarios</strong> será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos derivados del uso o la imposibilidad de uso de la Plataforma.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Contacto",
      content: (
        <div>
          <p className="text-gray-700 leading-relaxed">
            Si tienes alguna pregunta o inquietud sobre estos Términos, no dudes en contactarnos a través de{' '}
            <a href="mailto:info@inmobiliaria.com" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 decoration-blue-300 underline-offset-2">
             mkalpinni@gmail.com
            </a>.
          </p>
          <div className="mt-6 bg-blue-100 rounded-lg p-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              Estamos disponibles para resolver cualquier duda o consulta que puedas tener sobre nuestros servicios.
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow py-12"> {/* Añadido padding vertical (py-12) */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            Términos y Condiciones
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

export default TermsAndConditions;