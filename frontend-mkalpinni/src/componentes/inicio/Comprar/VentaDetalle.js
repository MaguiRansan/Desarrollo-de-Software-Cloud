import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar, FaCar, FaTree, FaSnowflake, FaSwimmingPool, FaLock } from "react-icons/fa";
import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';
import { API_BASE_URL } from '../../../config/apiConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const DetalleInmueble = () => {
    const { id } = useParams();
    const [inmueble, setInmueble] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState("/placeholder.jpg");
    const [activeTab, setActiveTab] = useState("caracteristicas");
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const customIcon = L.divIcon({
        className: 'custom-marker-detail',
        html: `<div class="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });

    const parseCoordinate = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().replace(',', '.');
            if (normalized === '') return null;
            const parsed = parseFloat(normalized);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };

    const buildDisplayAddress = (propiedad) => {
        if (!propiedad) return '';

        const parts = [
            propiedad.direccion,
            propiedad.barrio,
            propiedad.localidad,
            propiedad.provincia
        ].map(part => (typeof part === 'string' ? part.trim() : ''));

        const uniqueParts = parts.filter((part, index, array) => part && array.indexOf(part) === index);
        return uniqueParts.length > 0 ? uniqueParts.join(', ') : '';
    };

    useEffect(() => {
        const fetchInmueble = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/Propiedad/Obtener/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.status && data.value) {
                    const inmuebleProcesado = {
                        ...data.value,
                        latitud: parseCoordinate(data.value.latitud),
                        longitud: parseCoordinate(data.value.longitud)
                    };

                    setInmueble(inmuebleProcesado);

                    const imagenes = inmuebleProcesado.imagenes || [];
                    const imagenesUrls = imagenes.map(img => {
                        if (typeof img === 'string') return img;
                        if (img.rutaArchivo) return img.rutaArchivo;
                        if (img.url) return img.url;
                        return null;
                    }).filter(url => url);

                    if (imagenesUrls.length > 0) {
                        setMainImage(imagenesUrls[0]);
                    }
                } else {
                    setError(data.msg || "No se pudo cargar la propiedad.");
                }
            } catch (err) {
                setError("Hubo un problema al conectar con el servidor: " + err.message);
                console.error("Error fetching inmueble:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInmueble();
        }
    }, [id]);

    const cambiarImagenPrincipal = (img) => {
        setMainImage(img);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_BASE_URL}/Contacto/EnviarConsultaPropiedad`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    idPropiedad: id,
                    tituloPropiedad: inmueble?.titulo || 'Propiedad sin título'
                })
            });

            const data = await response.json();

            if (data.status) {
                setShowSuccess(true);
                // Reset form
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    mensaje: ''
                });
                // Hide success message after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                throw new Error(data.message || 'Error al enviar la consulta');
            }
        } catch (error) {
            console.error('Error al enviar la consulta:', error);
            alert('Hubo un error al enviar tu consulta. Por favor, inténtalo nuevamente más tarde.');
        }
    };

    const Mapa = ({ lat, lng, titulo, ubicacion }) => {
        useEffect(() => {
            if (activeTab !== "ubicacion") return;

            if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                console.warn("Coordenadas inválidas para el mapa.");
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

            L.marker([lat, lng], { icon: customIcon })
                .addTo(mapRef.current)
                .bindPopup(`<b>${titulo || 'Propiedad'}</b><br>${ubicacion || 'Ubicación'}`).openPopup();
            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        }, [lat, lng, activeTab, titulo, ubicacion]); 

        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            return <p className="text-gray-500 p-4 bg-gray-100 rounded-lg">Ubicación geográfica no disponible o inválida para esta propiedad.</p>;
        }

        return (
            <div 
                ref={mapContainerRef} 
                className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden" 
                style={{ zIndex: 1 }} 
            />
        );
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-700 text-lg">Cargando detalles de la propiedad...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
        );
    }

    if (!inmueble) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-700 text-lg">No se encontró la propiedad con el ID {id}.</p>
            </div>
        );
    }

    const obtenerImagenes = () => {
        if (!inmueble) return [];

        if (Array.isArray(inmueble.imagenes)) {
            return inmueble.imagenes.map(img => {
                if (typeof img === 'string') return img;
                if (img.rutaArchivo) return img.rutaArchivo;
                if (img.url) return img.url;
                return null;
            }).filter(url => url);
        }

        return [];
    };

    const imagenes = obtenerImagenes();

    const getCaracteristicasDisplay = (inmueble) => [
        { icon: <FaBuilding />, texto: inmueble.superficieM2 ? `${inmueble.superficieM2} m² construidos` : null },
        { icon: <FaTree />, texto: inmueble.terrenoM2 ? `${inmueble.terrenoM2} m² de terreno` : null },
        { icon: <FaBed />, texto: inmueble.numeroHabitaciones ? `${inmueble.numeroHabitaciones} Habitaciones` : null },
        { icon: <FaBath />, texto: inmueble.numeroBanios ? `${inmueble.numeroBanios} Baños` : null },
        { icon: <FaCar />, texto: inmueble.estacionamientos ? `${inmueble.estacionamientos} Estacionamientos` : (inmueble.estacionamientos === 0 ? 'Sin estacionamiento' : null) },
        { icon: <FaRuler />, texto: inmueble.cocinaEquipada !== undefined && inmueble.cocinaEquipada !== null ? (inmueble.cocinaEquipada ? "Cocina equipada" : "Cocina no equipada") : null }
    ].filter(item => item.texto !== null);

    const getEspecificacionesDisplay = (inmueble) => [
        { icon: <FaBuilding />, texto: inmueble.antiguedad ? `Antigüedad: ${inmueble.antiguedad} años` : null },
        { icon: <FaSun />, texto: inmueble.orientacion ? `Orientación: ${inmueble.orientacion}` : null },
        { icon: <FaSnowflake />, texto: inmueble.aireAcondicionado !== undefined && inmueble.aireAcondicionado !== null ? (inmueble.aireAcondicionado ? "Aire acondicionado" : "Sin aire acondicionado") : null },
        { icon: <FaSwimmingPool />, texto: inmueble.piscina !== undefined && inmueble.piscina !== null ? (inmueble.piscina ? "Piscina" : "Sin piscina") : null },
        { icon: <FaLock />, texto: inmueble.seguridad24hs !== undefined && inmueble.seguridad24hs !== null ? (inmueble.seguridad24hs ? "Seguridad 24hs" : "Sin seguridad") : null }
    ].filter(item => item.texto !== null);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-10 mt-10">
                    <h1 className="text-3xl font-bold text-gray-900">{inmueble.titulo || 'Título no disponible'}</h1>
                    <p className="mt-2 text-gray-600">{inmueble.ubicacion || 'Dirección no disponible'}</p>
                    <p className="mt-4 text-2xl font-semibold text-gray-900">${inmueble.precio?.toLocaleString('es-AR') || 'Precio no disponible'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img
                            src={mainImage}
                            alt="Imagen principal"
                            className="w-full h-96 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.jpg";
                            }}
                        />
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {imagenes.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Vista ${index + 1}`}
                                    className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition duration-200"
                                    onClick={() => cambiarImagenPrincipal(img)}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder.jpg";
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
                            <button
                                className={`py-2 px-4 font-medium ${
                                    activeTab === "caracteristicas"
                                        ? "text-gray-900 border-b-2 border-gray-900"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("caracteristicas")}
                            >
                                Características
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${
                                    activeTab === "descripcion"
                                        ? "text-gray-900 border-b-2 border-gray-900"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("descripcion")}
                            >
                                Descripción
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${
                                    activeTab === "ubicacion"
                                        ? "text-gray-900 border-b-2 border-gray-900"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveTab("ubicacion")}
                            >
                                Ubicación
                            </button>
                        </div>

                        <div className="mt-4">
                            {activeTab === "caracteristicas" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {getCaracteristicasDisplay(inmueble).map((item, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-700 text-xl mr-3">{item.icon}</span>
                                            <span className="text-gray-700">{item.texto}</span>
                                        </div>
                                    ))}
                                    {getCaracteristicasDisplay(inmueble).length === 0 && (
                                        <p className="text-gray-500 col-span-2">No hay características disponibles.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === "descripcion" && (
                                <div>
                                    <p className="text-gray-700 leading-relaxed">{inmueble.descripcion || 'No hay descripción disponible para esta propiedad.'}</p>
                                </div>
                            )}

                            {activeTab === "especificaciones" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {getEspecificacionesDisplay(inmueble).map((item, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-700 text-xl mr-3">{item.icon}</span>
                                            <span className="text-gray-700">{item.texto}</span>
                                        </div>
                                    ))}
                                    {getEspecificacionesDisplay(inmueble).length === 0 && (
                                        <p className="text-gray-500 col-span-2">No hay detalles o especificaciones disponibles.</p>
                                    )}
                                </div>
                            )}

                            {}
                            {activeTab === "ubicacion" && (
                                <div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Ubicación de la propiedad</h3>
                                        <p className="text-gray-700 mb-4">{inmueble.ubicacion || buildDisplayAddress(inmueble) || 'Dirección no disponible.'}</p>
                                        <Mapa 
                                            lat={inmueble.latitud} 
                                            lng={inmueble.longitud} 
                                            titulo={inmueble.titulo}
                                            ubicacion={inmueble.ubicacion || buildDisplayAddress(inmueble)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Te interesa esta propiedad?</h3>
                            {showSuccess && (
                                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                    ¡Gracias por tu interés en esta propiedad! Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad.
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-500"
                                    placeholder="Nombre completo"
                                    required
                                />
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-500"
                                    placeholder="Email"
                                    required
                                />
                                <input
                                    type="tel"
                                    id="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-500"
                                    placeholder="Teléfono"
                                />
                                <textarea
                                    id="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-500"
                                    placeholder="Me interesa esta propiedad..."
                                    required
                                ></textarea>
                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                                >
                                    Contactar ahora
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

export default DetalleInmueble;