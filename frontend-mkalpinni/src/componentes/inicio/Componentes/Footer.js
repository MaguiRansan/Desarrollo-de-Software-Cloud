import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { FaWhatsapp, FaYoutube } from "react-icons/fa";
import { SiZillow } from "react-icons/si";
import logo from "../../../logo/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">MARCELO KALPIN NEGOCIOS INMOBILIARIOS</h1>
            <p className="text-gray-400 text-sm">
              Mat. C.U.C.I.C.B.A 7025
            </p>
            <div className="flex space-x-4 md:ml-20">
              <a href="https://www.facebook.com/p/Mkalpin-Negocios-Inmobiliarios-100063507733126/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/mkalpinni/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://api.whatsapp.com/message/L4HL64FWSL4UH1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition duration-300">
                <FaWhatsapp className="h-6 w-6" />
              </a>
              <a href="https://youtube.com/@marcelokalpinnegociosinmob298?si=IZsrQdlpxIAxD2dg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaYoutube className="h-6 w-6" />
              </a>
              <a href="https://www.zonaprop.com.ar/inmobiliarias/marcelo-kalpin-negocios-inmobilarios_30057843-inmuebles.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition duration-300">
                <SiZillow className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start md:ml-36">
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/inicio" className="hover:text-blue-400 transition duration-300">Inicio</a></li>
              <li><a href="/venta" className="hover:text-blue-400 transition duration-300">Venta</a></li>
              <li><a href="/alquiler" className="hover:text-blue-400 transition duration-300">Alquiler</a></li>
              <li><a href="/alquilerTemporario" className="hover:text-blue-400 transition duration-300">Alquiler Temporario</a></li>
              <li><a href="/tasaciones" className="hover:text-blue-400 transition duration-300">Tasaciones</a></li>
              <li><a href="/contacto" className="hover:text-blue-400 transition duration-300">Contacto</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start md:ml-36">
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-1 text-blue-400" />
                <span>Florida 142, oficina: 8° i , CABA</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                <span>(011) 5669-0002</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                <span>mkalpinni@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 MKalpin Negocios Inmobiliarios. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="terminos" className="text-gray-400 hover:text-blue-400 transition duration-300 text-sm">Términos</a>
            <a href="privacidad" className="text-gray-400 hover:text-blue-400 transition duration-300 text-sm">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;