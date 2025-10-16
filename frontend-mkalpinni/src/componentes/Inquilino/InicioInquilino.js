import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { ChevronLeft, ChevronRight, MapPin, Heart } from "lucide-react";
import Header from "../inicio/Componentes/Header";
import Footer from "../inicio/Componentes/Footer";
import { propertyService } from "../../services/api";
import { API_STATIC_URL } from "../../config/apiConfig";

export default function Propiedades() {
  const [currentProperty, setCurrentProperty] = useState(0);
  const [propiedadesDestacadas, setPropiedadesDestacadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        setIsLoading(true);
        const response = await propertyService.getAll();
        
        if (response.status && response.value) {
          const propiedades = response.value.slice(0, 4).map(prop => ({
            id: prop._id,
            titulo: prop.titulo,
            precio: prop.precio ? `$${prop.precio.toLocaleString('es-AR')}` : 'Precio a consultar',
            imagen: prop.imagenes && prop.imagenes.length > 0 
              ? `${API_STATIC_URL}/uploads/${prop.imagenes[0].rutaArchivo}`
              : "https://cdn.prod.website-files.com/61e9b342b016364181c41f50/62a014dd84797690c528f25e_38.jpg",
            ubicacion: `${prop.ubicacion || ''}${prop.localidad ? `, ${prop.localidad}` : ''}${prop.provincia ? `, ${prop.provincia}` : ''}`,
            caracteristicas: { 
              dormitorios: prop.habitaciones || 0, 
              banos: prop.banos || 0, 
              superficie: `${prop.superficieM2 || 0}m²` 
            },
          }));
          setPropiedadesDestacadas(propiedades);
        } else {
          setError('No se pudieron cargar las propiedades');
        }
      } catch (err) {
        console.error('Error cargando propiedades:', err);
        setError('Error al cargar las propiedades');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropiedades();
  }, []);

  const prevProperty = () => {
    setCurrentProperty((prev) => (prev === 0 ? propiedadesDestacadas.length - 1 : prev - 1));
  };

  const nextProperty = () => {
    setCurrentProperty((prev) => (prev === propiedadesDestacadas.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <Header />
      <div className="text-center py-40 bg-blue-100 ">
        
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido/a Maria Jose</h1>
        <p className="text-lg text-gray-600 mt-2">Estamos agradecidos de que alquile con MKalpin Negocios Inmobiliarios</p>
      </div>
      
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Propiedades Destacadas</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aquí encuentra otro de nuestros inmuebles destacados en alquiler o venta
            </p>
          </div>
          
          {/* Estado de carga */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando propiedades...</p>
            </div>
          )}
          
          {/* Estado de error */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* Propiedades cargadas */}
          {!isLoading && !error && propiedadesDestacadas.length > 0 && (
            <div className="relative w-full">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-4">
                <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentProperty * 100}%)` }}>
                  {propiedadesDestacadas.map((propiedad) => (
                  <div key={propiedad.id} className="w-full flex-shrink-0">
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative lg:w-1/2">
                        <img src={propiedad.imagen} alt={propiedad.titulo} className="w-full h-96 lg:h-116 object-cover" />
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium text-xl">
                            {propiedad.precio}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 lg:w-1/2 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{propiedad.titulo}</h3>
                        <p className="text-gray-600 mb-6 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" /> {propiedad.ubicacion}
                        </p>
                        <button className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
              
              <button onClick={prevProperty} className="absolute top-1/2 -translate-y-1/2 -left-5 bg-white shadow-lg p-3 rounded-full hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button onClick={nextProperty} className="absolute top-1/2 -translate-y-1/2 -right-5 bg-white shadow-lg p-3 rounded-full hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          )}
          
          {/* Mensaje cuando no hay propiedades */}
          {!isLoading && !error && propiedadesDestacadas.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600">No hay propiedades disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
