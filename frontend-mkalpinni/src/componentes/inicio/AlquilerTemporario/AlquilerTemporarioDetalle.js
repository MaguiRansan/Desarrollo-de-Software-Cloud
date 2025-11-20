import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { FaBuilding, FaTree, FaBed, FaBath } from "react-icons/fa";
import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';
import { API_BASE_URL } from '../../../config/apiConfig';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

const AlquilerTemporarioDetalle = () => {
  const { id } = useParams();
  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("caracteristicas");
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaEntrada: '',
    fechaSalida: '',
    cantidadPersonas: '',
    mensaje: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);


  useEffect(() => {
    const fetchInmueble = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/Propiedad/Obtener/${id}`);
        if (response.data.status) {
          const fetchedInmueble = response.data.value;
          const lat = parseFloat(fetchedInmueble.latitud);
          const lng = parseFloat(fetchedInmueble.longitud);

          const imagenesArray = fetchedInmueble.imagenes || [];
          const imagenesUrls = imagenesArray.map(img => {
            if (typeof img === 'string') return img;
            if (img.rutaArchivo) return img.rutaArchivo;
            if (img.url) return img.url;
            return null;
          }).filter(url => url);

          setInmueble({
            ...fetchedInmueble,
            coordenadas: {
              lat: isNaN(lat) ? null : lat,
              lng: isNaN(lng) ? null : lng,
            },
            imagenes: imagenesUrls,
            servicios: fetchedInmueble.servicios || [],
            caracteristicas: [
              { icon: <FaBuilding />, texto: `${fetchedInmueble.superficieM2 || 'N/A'} m² construidos` },
              { icon: <FaTree />, texto: `${fetchedInmueble.terrenoM2 || 'N/A'} m² de terreno` },
              { icon: <FaBed />, texto: `${fetchedInmueble.habitaciones || 'N/A'} Habitaciones` },
              { icon: <FaBath />, texto: `${fetchedInmueble.banos || 'N/A'} Baños` }
            ],
            disponibilidad: {
              minEstadia: fetchedInmueble.estadiaMinima || 1,
              maxEstadia: 365,
              fechasOcupadas: Array.isArray(fetchedInmueble.disponibilidad) ? fetchedInmueble.disponibilidad : []
            },
            precio: `$${fetchedInmueble.precio} / noche`
          });

          setMainImage(imagenesUrls.length > 0 ? imagenesUrls[0] : "/api/placeholder/800/500");
        } else {
          setError(response.data.msg || "No se pudo cargar la propiedad.");
        }
      } catch (err) {
        setError("Error al conectar con el servidor o cargar la propiedad.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInmueble();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Cargando detalles de la propiedad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <p className="text-gray-600">Por favor, intenta de nuevo más tarde o verifica la URL.</p>
      </div>
    );
  }

  if (!inmueble) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center p-4">
        <p className="text-xl text-gray-700 mb-4">No se encontró la propiedad.</p>
        <p className="text-gray-600">Es posible que la propiedad que buscas no exista o haya sido eliminada.</p>
      </div>
    );
  }

  const cambiarImagenPrincipal = (img) => {
    setMainImage(img);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.telefono || !formData.fechaEntrada || !formData.fechaSalida || !formData.cantidadPersonas) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/Contacto/AlquilerTemporal`, {
        ...formData,
        propiedadId: id,
        propiedadTitulo: inmueble?.titulo || 'Alquiler Temporario'
      });

      if (response.data.status) {
        setShowSuccess(true);
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fechaEntrada: '',
          fechaSalida: '',
          cantidadPersonas: '',
          mensaje: ''
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert('Hubo un error al enviar tu consulta. Por favor, inténtalo nuevamente.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar la consulta. Por favor, inténtalo nuevamente.';
      alert(errorMessage);
    }
  };

  const Mapa = ({ lat, lng, titulo, direccion }) => {
    useEffect(() => {
      if (activeTab !== "ubicacion") {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        return;
      }

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        return;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
      L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`<b>${titulo || 'Propiedad'}</b><br>${direccion || 'Ubicación'}`).openPopup();

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [lat, lng, titulo, direccion, activeTab]);

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
      return <p className="text-gray-500 p-4 bg-gray-100 rounded-lg">Ubicación geográfica no disponible para esta propiedad.</p>;
    }

    return (
      <div
        ref={mapContainerRef}
        className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden"
        style={{ zIndex: 1 }}
      />
    );
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10 mt-10">
          <h1 className="text-3xl font-bold text-gray-900">{inmueble.titulo}</h1>
          <p className="mt-2 text-gray-600">{inmueble.direccion}</p>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{inmueble.precio}</p>

          <div className="mt-4 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Disponible para alquiler temporario
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={mainImage || "/api/placeholder/800/500"}
              alt="Imagen principal"
              className="w-full h-96 object-cover rounded-lg shadow-sm"
            />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {inmueble.imagenes.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition duration-200"
                  onClick={() => cambiarImagenPrincipal(img)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
              <button
                className={`py-2 px-4 font-medium ${activeTab === "caracteristicas" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("caracteristicas")}
              >
                Características
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "descripcion" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("descripcion")}
              >
                Descripción
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "especificaciones" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("especificaciones")}
              >
                Servicios
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "ubicacion" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("ubicacion")}
              >
                Ubicación
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "informacionEstadia" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("informacionEstadia")}
              >
                Estadía
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "caracteristicas" && (
                <div className="grid grid-cols-2 gap-4">
                  {inmueble.caracteristicas.map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 text-xl mr-3">{item.icon}</span>
                      <span className="text-gray-700">{item.texto}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "descripcion" && (
                <div className="space-y-8">
                  {inmueble.descripcion && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Descripción</h3>
                      <p className="text-gray-700 leading-relaxed">{inmueble.descripcion}</p>
                    </div>
                  )}

                  {(inmueble.horarioCheckIn || inmueble.horarioCheckOut) && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Horarios de estadía</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {inmueble.horarioCheckIn && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Entrada</p>
                                <p className="text-gray-900 font-medium">{inmueble.horarioCheckIn} hs</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {inmueble.horarioCheckOut && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Salida</p>
                                <p className="text-gray-900 font-medium">{inmueble.horarioCheckOut} hs</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {inmueble.reglasPropiedad && inmueble.reglasPropiedad.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Reglas de la propiedad</h3>
                      <ul className="space-y-2 mt-4 pl-5 list-disc text-gray-700">
                        {inmueble.reglasPropiedad.map((regla, index) => (
                          <li key={index} className="pl-2">
                            {regla}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "especificaciones" && (
                <div>
                  {inmueble.especificaciones && inmueble.especificaciones.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {inmueble.especificaciones.map((item, index) => {
                        const texto = typeof item === 'string' ? item : item?.texto;
                        if (!texto) return null;
                        return (
                          <div key={`${index}-${texto}`} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="mr-3 text-lg leading-none">•</span>
                            <span className="text-gray-700">{texto}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-2">Servicios incluidos</h3>
                    {inmueble.servicios && inmueble.servicios.length > 0 ? (
                      <ul className="text-gray-700 space-y-2 pl-5 list-disc grid grid-cols-2">
                        {inmueble.servicios.map((servicio) => (
                          <li key={servicio}>{servicio}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm">Esta propiedad no tiene servicios declarados.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "ubicacion" && (
                <div>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Ubicación de la propiedad</h3>
                    <p className="text-gray-700 mb-4">{inmueble.direccion}</p>
                    <Mapa
                      lat={inmueble.coordenadas.lat}
                      lng={inmueble.coordenadas.lng}
                      titulo={inmueble.titulo}
                      direccion={inmueble.direccion}
                    />
                  </div>
                </div>
              )}

              {activeTab === "informacionEstadia" && (
                <div>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">Información de estadía</h3>
                    <div className="space-y-3 text-gray-700">

                      <p className="flex justify-between">
                        <span className="font-medium">Estadía mínima:</span>
                        <span className="font-semibold text-gray-900">{inmueble.disponibilidad.minEstadia} noches</span>
                      </p>

                      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mt-4">
                        <p>Por favor, utilice el formulario de contacto para consultar la disponibilidad exacta para las fechas deseadas.</p>

                        <p className="mt-2 font-medium text-yellow-800">El valor publicado puede variar según la temporada y la duración de la estadía</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Te interesa este alquiler temporario?</h3>
              {showSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  ¡Gracias por tu interés en este alquiler temporario! Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad.
                </div>
              )}
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Nombre completo"
                  required
                />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Email"
                  required
                />
                <input
                  type="tel"
                  id="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Teléfono"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fechaEntrada" className="block text-sm text-gray-600 mb-1">Fecha de ingreso</label>
                    <input
                      type="date"
                      id="fechaEntrada"
                      value={formData.fechaEntrada}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="fechaSalida" className="block text-sm text-gray-600 mb-1">Fecha de salida</label>
                    <input
                      type="date"
                      id="fechaSalida"
                      value={formData.fechaSalida}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cantidadPersonas" className="block text-sm text-gray-600 mb-1">Cantidad de personas</label>
                  <input
                    type="number"
                    id="cantidadPersonas"
                    value={formData.cantidadPersonas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mensaje" className="block text-sm text-gray-600 mb-1">Mensaje</label>
                  <textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Me interesa alquilar esta propiedad..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  Consultar disponibilidad y precio
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AlquilerTemporarioDetalle;