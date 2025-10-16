import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar, FaCar, FaTree, FaSnowflake, FaSwimmingPool, FaLock } from "react-icons/fa";
import Header from '../Componentes/Header';
import Footer from '../Componentes/Footer';
import { API_BASE_URL } from '../../../config/apiConfig';

const AlquilerDetalle = () => {
    const { id } = useParams();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const defaultPlaceholderImage = "/images/placeholder-800x500.png";

    const [mainImage, setMainImage] = useState(defaultPlaceholderImage);
    const [activeTab, setActiveTab] = useState("caracteristicas");
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });

    useEffect(() => {
        const fetchPropiedadData = async () => {
            try {
                if (!id) {
                    setError("ID de propiedad no proporcionado");
                    setLoading(false);
                    return;
                }

                setLoading(true);

                const propiedadResponse = await fetch(`${API_BASE_URL}/Propiedad/Obtener/${id}`);
                const propiedadData = await propiedadResponse.json();

                if (!propiedadData.status || !propiedadData.value) {
                    setError(propiedadData.msg || "Error al cargar la propiedad");
                    setLoading(false);
                    return;
                }

                const imagenesResponse = await fetch(`${API_BASE_URL}/ImagenesPropiedad/ObtenerPropiedad/${id}`);
                const imagenesData = await imagenesResponse.json();

                if (imagenesData.status && imagenesData.value && imagenesData.value.length > 0) {
                    const fetchedImages = imagenesData.value.map(img => img.url).filter(url => url);
                    setImagenes(fetchedImages);
                    if (fetchedImages.length > 0) {
                        setMainImage(fetchedImages[0]);
                    } else {
                        setMainImage(defaultPlaceholderImage);
                    }
                } else {
                    console.warn("No se recibieron URLs de imágenes o la API de imágenes falló:", imagenesData.msg || "Sin datos");
                    setImagenes([]);
                    setMainImage(defaultPlaceholderImage);
                }

                setPropiedad(propiedadData.value);
                setLoading(false);

            } catch (err) {
                console.error("Error general al obtener datos:", err);
                setError("Error al conectar con el servidor. Por favor, verifica la conexión y las rutas de la API.");
                setLoading(false);
            }
        };

        fetchPropiedadData();
    }, [id]);

    const cambiarImagenPrincipal = (imgUrl) => {
        if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '') {
            setMainImage(imgUrl);
        } else {
            setMainImage(defaultPlaceholderImage);
        }
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
            const response = await fetch(`${API_BASE_URL}/Contacto/EnviarConsulta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    propiedadId: id
                })
            });

            const data = await response.json();

            if (data.status) {
                alert("¡Gracias por tu interés! Te contactaremos pronto.");
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    mensaje: ''
                });
            } else {
                alert("Hubo un error al enviar tu consulta. Por favor intenta nuevamente: " + (data.msg || "Error desconocido."));
            }
        } catch (error) {
            console.error("Error al enviar formulario:", error);
            alert("Error de conexión al enviar el formulario. Por favor intenta más tarde.");
        }
    };

    const Mapa = ({ lat, lng }) => {
        return (
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                    <div className="text-center">
                        <FaMapMarkerAlt className="text-red-600 text-4xl mb-2 mx-auto" />
                        <p className="text-gray-700 font-medium">Ubicación de la propiedad</p>
                        <p className="text-gray-600 text-sm">Lat: {lat || 'N/A'}, Lng: {lng || 'N/A'}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-700">Cargando detalles de la propiedad...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center text-center p-4">
                <p className="text-lg text-red-600">Error: {error}</p>
                <p className="text-md text-gray-500 mt-2">Por favor, intenta de nuevo más tarde o contacta soporte.</p>
            </div>
        );
    }

    if (!propiedad) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-700">No se encontró la propiedad.</p>
            </div>
        );
    }

    const inmuebleDisplay = {
        titulo: propiedad.titulo || "Propiedad sin título",
        precio: propiedad.transaccionTipo === "Alquiler"
            ? `$${propiedad.precio?.toLocaleString('es-AR')}/mes`
            : `$${propiedad.precio?.toLocaleString('es-AR')}`,
        direccion: `${propiedad.ubicacion || ''}${propiedad.barrio ? `, ${propiedad.barrio}` : ''}`,
        coordenadas: {
            lat: propiedad.latitud || null,
            lng: propiedad.longitud || null
        },
        descripcion: propiedad.descripcion || "No hay descripción disponible para esta propiedad.",
        caracteristicas: [
            { icon: <FaBuilding />, texto: `${propiedad.superficieM2 || 'N/A'} m² construidos` },
            { icon: <FaTree />, texto: `${propiedad.terrenoM2 || 'N/A'} m² de terreno` },
            { icon: <FaBed />, texto: `${propiedad.habitaciones || 'N/A'} Habitaciones` },
            { icon: <FaBath />, texto: `${propiedad.banos || 'N/A'} Baños` },
            { icon: <FaCar />, texto: `${propiedad.estacionamientos || 'N/A'} Estacionamientos` },
            { icon: <FaRuler />, texto: propiedad.cocinaEquipada ? "Cocina equipada" : "Cocina no equipada" }
        ].filter(item => !item.texto.includes('N/A')),
        especificaciones: [
            { icon: <FaBuilding />, texto: `Antigüedad: ${propiedad.antiguedad || 'N/A'} años` },
            { icon: <FaSun />, texto: `Orientación: ${propiedad.orientacion || 'N/A'}` },
            { icon: <FaSnowflake />, texto: propiedad.aireAcondicionado ? "Aire acondicionado" : "No tiene A/C" },
            { icon: <FaSwimmingPool />, texto: propiedad.piscina ? "Piscina" : "No tiene piscina" },
            { icon: <FaLock />, texto: propiedad.seguridad24hs ? "Seguridad 24hs" : "No tiene seguridad 24hs" }
        ].filter(item => !item.texto.includes('N/A') && !item.texto.includes('No tiene')),
        imagenes: imagenes.length > 0 ? imagenes : [defaultPlaceholderImage],
        similares: []
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-10 mt-10">
                    <h1 className="text-3xl font-bold text-gray-900">{inmuebleDisplay.titulo}</h1>
                    <p className="mt-2 text-gray-600">{inmuebleDisplay.direccion}</p>
                    <p className="mt-4 text-2xl font-semibold text-gray-900">
                        {inmuebleDisplay.precio}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({propiedad.transaccionTipo === "Alquiler" ? "Alquiler" : "Venta"})
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img
                            src={mainImage}
                            alt={`Imagen principal de la propiedad ${inmuebleDisplay.titulo}`}
                            className="w-full h-96 object-cover rounded-lg shadow-sm"
                            onError={(e) => { e.target.src = defaultPlaceholderImage; console.error("Error al cargar la imagen principal:", e.target.src); }}
                        />
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {inmuebleDisplay.imagenes.map((imgUrl, index) => (
                                <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Miniatura de la vista ${index + 1} de ${inmuebleDisplay.titulo}`}
                                    className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition duration-200"
                                    onClick={() => cambiarImagenPrincipal(imgUrl)}
                                    onError={(e) => { e.target.src = "/images/placeholder-50x50.png"; console.error("Error al cargar miniatura:", e.target.src); }}
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
                                Detalles
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === "ubicacion" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                                onClick={() => setActiveTab("ubicacion")}
                            >
                                Ubicación
                            </button>
                        </div>

                        <div className="mt-4">
                            {activeTab === "caracteristicas" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {inmuebleDisplay.caracteristicas.map((item, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-700 text-xl mr-3">{item.icon}</span>
                                            <span className="text-gray-700">{item.texto}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "descripcion" && (
                                <div>
                                    <p className="text-gray-700 leading-relaxed">{inmuebleDisplay.descripcion}</p>
                                </div>
                            )}

                            {activeTab === "especificaciones" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {inmuebleDisplay.especificaciones.map((item, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-700 text-xl mr-3">{item.icon}</span>
                                            <span className="text-gray-700">{item.texto}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "ubicacion" && (
                                <div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Ubicación de la propiedad</h3>
                                        <p className="text-gray-700 mb-4">{inmuebleDisplay.direccion}</p>
                                        <Mapa lat={inmuebleDisplay.coordenadas.lat} lng={inmuebleDisplay.coordenadas.lng} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">¿Te interesa esta propiedad?</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                />
                                <textarea
                                    id="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
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

                {inmuebleDisplay.similares.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Inmuebles Similares</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {inmuebleDisplay.similares.map((similar, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <img src={similar.imagen} alt={similar.titulo} className="w-full h-48 object-cover" />
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{similar.titulo}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{similar.direccion}</p>
                                        <div className="flex space-x-2 text-sm text-gray-700">
                                            {similar.detalles.map((detalle, idx) => (
                                                <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full">{detalle}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AlquilerDetalle;