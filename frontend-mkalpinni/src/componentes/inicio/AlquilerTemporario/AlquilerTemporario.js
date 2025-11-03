import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Header from '../Componentes/Header';
import { MapPin, Home, Bath, Maximize, Search, Bookmark, DollarSign, BedDouble, Filter, Loader2, RefreshCw } from 'lucide-react';
import Footer from '../Componentes/Footer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../../../config/apiConfig';

const MapContainer = React.memo(({ propiedades, propiedadSeleccionada, onMarkerClick }) => {
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const mapContainerRef = useRef(null); 

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([-34.603, -58.381], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(mapRef.current);
        }
    
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); 

    const updateMapMarkers = useCallback((propiedadesToDisplay) => {
        if (!mapRef.current) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const defaultIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg" style="width: 30px; height: 30px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
            iconSize: [30, 30], iconAnchor: [15, 30]
        });
        const selectedIcon = L.divIcon({
            className: 'custom-marker selected',
            html: `<div class="marker-pin bg-red-500 text-white flex items-center justify-center rounded-full shadow-lg animate-pulse" style="width: 36px; height: 36px;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
            iconSize: [36, 36], iconAnchor: [18, 36]
        });

        propiedadesToDisplay.forEach(propiedad => {
            if (!propiedad.coordenadas || typeof propiedad.coordenadas.lat !== 'number' || typeof propiedad.coordenadas.lng !== 'number' || isNaN(propiedad.coordenadas.lat) || isNaN(propiedad.coordenadas.lng)) {
                console.warn(`Coordenadas inválidas para propiedad ID ${propiedad.id}`); return;
            }
            const isSelected = propiedadSeleccionada?.id === propiedad.id;
            const icon = isSelected ? selectedIcon : defaultIcon;
            const marker = L.marker([propiedad.coordenadas.lat, propiedad.coordenadas.lng], { icon: icon, propiedadId: propiedad.id }).addTo(mapRef.current);

            marker.on('click', () => onMarkerClick(propiedad));

            const displayPrice = propiedad.precioPorNoche || propiedad.precio || 0;
            marker.bindPopup(`<div class="font-semibold">${propiedad.titulo || ''}</div><div class="text-blue-600 font-medium">$${displayPrice.toLocaleString()} / Noche</div><div class="text-sm text-gray-600">${propiedad.barrio || ''}</div>`);
            markersRef.current.push(marker);
        });

        if (markersRef.current.length > 0 && !propiedadSeleccionada) { 
            try {
                const group = L.featureGroup(markersRef.current);
                mapRef.current.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 16 });
            } catch (e) {
                console.error("Error fitting bounds:", e);
                mapRef.current.setView([-34.603, -58.381], 12);
            }
        } else if (markersRef.current.length === 0) {
            mapRef.current.setView([-34.603, -58.381], 12);
        }
    }, [propiedadSeleccionada, onMarkerClick]); 

    useEffect(() => {
        updateMapMarkers(propiedades);
    }, [propiedades, updateMapMarkers]);

    useEffect(() => {
        if (propiedadSeleccionada && mapRef.current) {
            if (propiedadSeleccionada.coordenadas && typeof propiedadSeleccionada.coordenadas.lat === 'number' && typeof propiedadSeleccionada.coordenadas.lng === 'number') {
                mapRef.current.flyTo([propiedadSeleccionada.coordenadas.lat, propiedadSeleccionada.coordenadas.lng], 15);
            }
            updateMapMarkers(propiedades);
        }
    }, [propiedadSeleccionada, propiedades, updateMapMarkers]); 

    return <div ref={mapContainerRef} className="h-full w-full z-10" />;
});

const AlquilerTemporario = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [propiedadesRaw, setPropiedadesRaw] = useState([]);
    const [filtros, setFiltros] = useState({
        precioMin: '', precioMax: '', banos: '',
        tipo: location.state?.tipoPropiedad || '',
        barrio: location.state?.barrio || '',
        checkIn: location.state?.checkIn || '',
        checkOut: location.state?.checkOut || '',
        adultos: location.state?.adultos || 1,
        niños: location.state?.menores || 0,
        habitacionesFiltro: location.state?.habitaciones || 1,
    });
    const [searchTerm, setSearchTerm] = useState(location.state?.barrio || '');
    const [propiedadesFiltradas, setPropiedadesFiltradas] = useState([]);
    const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [mostrarSelectorHuespedes, setMostrarSelectorHuespedes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [filteredLocationSuggestions, setFilteredLocationSuggestions] = useState([]);
    const searchInputRef = useRef(null);

    const buildUniqueLocations = useCallback((items) => {
        if (!Array.isArray(items)) return [];
        const normalized = items
            .flatMap(entry => [entry?.barrio, entry?.localidad, entry?.provincia])
            .filter(Boolean)
            .map(value => value.trim())
            .filter(Boolean);
        return [...new Set(normalized)];
    }, []);

    const fallbackLocations = useMemo(
        () => buildUniqueLocations(propiedadesRaw),
        [propiedadesRaw, buildUniqueLocations]
    );

    const fetchPropiedades = useCallback(async (apiParams = {}) => {
        setLoading(true); setError(null);
        try {
            const query = new URLSearchParams({
                transaccionTipo: 'Alquiler', esAlquilerTemporario: 'true',
                ...(apiParams.barrio && { barrio: apiParams.barrio }),
                ...(apiParams.precioMin && { precioMin: apiParams.precioMin }),
                ...(apiParams.precioMax && { precioMax: apiParams.precioMax }),
                ...(apiParams.habitacionesMin && { habitacionesMin: apiParams.habitacionesMin }),
                ...(apiParams.tipoPropiedad && { tipoPropiedad: apiParams.tipoPropiedad }),
            });
            const url = `${API_BASE_URL}/Propiedad/Buscar?${query.toString()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (data.status) {
                const mappedProperties = data.value.map(prop => ({
                    id: prop._id, idPropiedad: prop._id, titulo: prop.titulo,
                    descripcion: prop.descripcion, direccion: prop.direccion, barrio: prop.barrio,
                    localidad: prop.localidad, provincia: prop.provincia,
                    ubicacion: prop.barrio || prop.localidad || prop.provincia, 
                    tipoPropiedad: prop.tipoPropiedad, tipo: prop.tipoPropiedad,
                    transaccionTipo: prop.transaccionTipo,
                    precio: prop.precioPorNoche || prop.precio, 
                    precioPorNoche: prop.precioPorNoche,
                    precioOriginal: prop.precio, 
                    habitaciones: prop.habitaciones, banos: prop.banos,
                    superficieM2: prop.superficieM2, superficie: prop.superficieM2,
                    estado: prop.estado, latitud: prop.latitud, longitud: prop.longitud,
                    coordenadas: { lat: prop.latitud || -34.603, lng: prop.longitud || -58.381 },
                    favorito: prop.favorito || false, imagenes: prop.imagenes || [],
                    capacidadPersonas: prop.capacidadPersonas,
                    capacidadHuespedes: prop.capacidadPersonas || (prop.habitaciones ? prop.habitaciones * 2 : 1),
                    servicios: prop.servicios || [], disponibilidad: true,
                }));
                setPropiedadesRaw(mappedProperties);
            } else { throw new Error(data.msg || 'Error API'); }
        } catch (err) {
            console.error("Error fetching:", err); setError(`No se cargaron propiedades (${err.message})`); setPropiedadesRaw([]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const apiFilterParams = {
            barrio: filtros.barrio, precioMin: filtros.precioMin, precioMax: filtros.precioMax,
            habitacionesMin: filtros.habitacionesFiltro, tipoPropiedad: filtros.tipo,
        };
        fetchPropiedades(apiFilterParams);
    }, [fetchPropiedades, filtros.barrio, filtros.precioMin, filtros.precioMax, filtros.habitacionesFiltro, filtros.tipo]);

    useEffect(() => {
        const locBarrio = location.state?.barrio;
        if (locBarrio) {
            if (locBarrio !== filtros.barrio) setFiltros(prev => ({ ...prev, barrio: locBarrio }));
            if (locBarrio !== searchTerm) setSearchTerm(locBarrio);
        }
    }, [location.state?.barrio, filtros.barrio, searchTerm]);

    const aplicarTodosLosFiltros = useCallback(() => {
        let currentFilteredProperties = [...propiedadesRaw];
        const totalHuespedesDeseados = parseInt(filtros.adultos, 10) + parseInt(filtros.niños, 10);

        if (totalHuespedesDeseados > 0) {
            currentFilteredProperties = currentFilteredProperties.filter(prop =>
                prop.capacidadHuespedes >= totalHuespedesDeseados);
        }
        if (filtros.banos) {
            currentFilteredProperties = currentFilteredProperties.filter(prop =>
                prop.banos >= parseInt(filtros.banos, 10));
        }

        setPropiedadesFiltradas(currentFilteredProperties);
    }, [propiedadesRaw, filtros.adultos, filtros.niños, filtros.banos]); 

    useEffect(() => {
        aplicarTodosLosFiltros();
    }, [propiedadesRaw, aplicarTodosLosFiltros]); 

    const handleFiltroChange = (e) => { const { name, value } = e.target; setFiltros(prev => ({ ...prev, [name]: value })); };
    
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSearchError('');
        const pool = availableLocations.length
            ? availableLocations
            : fallbackLocations;
        if (value.trim()) {
            const normalized = value.trim().toLowerCase();
            const suggestions = pool.filter(location =>
                location.toLowerCase().includes(normalized)
            ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
            setFilteredLocationSuggestions(suggestions);
            setShowLocationSuggestions(true);
        } else {
            setFilteredLocationSuggestions([]);
            setShowLocationSuggestions(false);
        }
    };

    const handleSelectLocation = (location) => {
        setSearchTerm(location);
        setFiltros(prev => ({ ...prev, barrio: location }));
        setFilteredLocationSuggestions([]);
        setShowLocationSuggestions(false);
        setSearchError('');
        searchInputRef.current?.focus();
    };

    const handleMainSearch = () => {
        const trimmedValue = searchTerm.trim();
        const pool = availableLocations.length
            ? availableLocations
            : fallbackLocations;
        if (trimmedValue) {
            const normalizedValue = trimmedValue.toLowerCase();
            const matchedLocation =
                pool.find(location => location.toLowerCase() === normalizedValue) ||
                pool.find(location => location.toLowerCase().includes(normalizedValue));
            if (!matchedLocation) {
                setSearchError('Selecciona una ubicación válida.');
                setShowLocationSuggestions(true);
                setFilteredLocationSuggestions(pool.filter(location =>
                    location.toLowerCase().includes(normalizedValue)
                ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })));
                searchInputRef.current?.focus();
                return;
            }
            setSearchTerm(matchedLocation);
            setFiltros(prev => ({ ...prev, barrio: matchedLocation }));
        } else {
            setSearchTerm('');
            setFiltros(prev => ({ ...prev, barrio: '' }));
        }
        setShowLocationSuggestions(false);
        setFilteredLocationSuggestions([]);
        setSearchError('');
        setMostrarFiltros(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleMainSearch();
        }
    };

    const handleAplicarHuespedes = () => setMostrarSelectorHuespedes(false);

    const aplicarFiltrosLaterales = () => {
        setMostrarFiltros(false);
    };

    const limpiarFiltros = () => { 
        const initialFiltros = {
            precioMin: '', precioMax: '', banos: '', tipo: '', barrio: '',
            checkIn: '', checkOut: '', adultos: 1, niños: 0, habitacionesFiltro: 1,
        };
        setFiltros(initialFiltros);
        setSearchTerm('');
        setSearchError('');
        setShowLocationSuggestions(false);
        setFilteredLocationSuggestions([]);
    };

    const toggleFavorito = async (id, e) => {
        e.stopPropagation();
        const updateList = (list) => list.map(p => p.id === id ? { ...p, favorito: !p.favorito } : p);
        setPropiedadesRaw(updateList);
        setPropiedadesFiltradas(updateList); 
    };

    const tiposOptions = [...new Set(propiedadesRaw.map(p => p.tipo))].filter(Boolean).sort();
    const banosApiOptions = [...new Set(propiedadesRaw.map(p => p.banos))].filter(Boolean).sort((a, b) => a - b);
    const totalHuespedesDisplay = parseInt(filtros.adultos, 10) + parseInt(filtros.niños, 10);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/Propiedad/Obtener`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (data.status && Array.isArray(data.value)) {
                    const temporarias = data.value.filter(
                        (prop) => prop.esAlquilerTemporario || prop.transaccionTipo?.toLowerCase().includes('temporario')
                    );
                    const normalizedLocations = buildUniqueLocations(temporarias).sort((a, b) =>
                        a.localeCompare(b, 'es', { sensitivity: 'base' })
                    );
                    setAvailableLocations(normalizedLocations);
                }
            } catch (err) {
                console.error('Error cargando ubicaciones:', err);
            }
        };
        fetchLocations();
    }, [buildUniqueLocations]);

    return (
        <div className="flex flex-col min-h-screen bg-white-50">
            <Header />

            {/* Barra Superior */}
            <div className="bg-gray-200 text-black py-16 mb-10 mt-1">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Encuentra su alojamiento</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">Explora nuestra selección de propiedades exclusivas y encuentra tu hogar perfecto con nosotros.</p>
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Ubicación */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">¿A dónde vas?</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ubicación"
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${searchError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (searchTerm.trim()) {
                                                setShowLocationSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
                                        onKeyPress={handleKeyPress}
                                        autoComplete="off"
                                        ref={searchInputRef}
                                        aria-invalid={Boolean(searchError)}
                                    />
                                    {showLocationSuggestions && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                            {filteredLocationSuggestions.length > 0 ? (
                                                filteredLocationSuggestions.map((location) => (
                                                    <button
                                                        key={location}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        onMouseDown={() => handleSelectLocation(location)}
                                                    >
                                                        {location}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No hay coincidencias disponibles.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
                            </div>
                            {/* Check-in */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Entrada</label>
                                <input type="date" name="checkIn" value={filtros.checkIn} onChange={handleFiltroChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            {/* Check-out */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Salida</label>
                                <input type="date" name="checkOut" value={filtros.checkOut} onChange={handleFiltroChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            {/* Huéspedes */}
                            <div className="relative"> 
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Huéspedes</label>
                                <button onClick={() => setMostrarSelectorHuespedes(s => !s)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
                                    {totalHuespedesDisplay} huéspedes, {filtros.habitacionesFiltro} hab.
                                </button>
                                {mostrarSelectorHuespedes && (
                                    <div className="absolute bg-white p-4 rounded-lg shadow-lg mt-2 z-50 w-64"> 
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center"><label className="text-sm font-semibold text-gray-700">Adultos</label><input type="number" name="adultos" min="1" max="10" value={filtros.adultos} onChange={handleFiltroChange} className="w-16 p-1 border border-gray-300 rounded-lg text-center"/></div>
                                            <div className="flex justify-between items-center"><label className="text-sm font-semibold text-gray-700">Niños</label><input type="number" name="niños" min="0" max="5" value={filtros.niños} onChange={handleFiltroChange} className="w-16 p-1 border border-gray-300 rounded-lg text-center"/></div>
                                            <div className="flex justify-between items-center"><label className="text-sm font-semibold text-gray-700">Habitaciones</label><input type="number" name="habitacionesFiltro" min="1" max="10" value={filtros.habitacionesFiltro} onChange={handleFiltroChange} className="w-16 p-1 border border-gray-300 rounded-lg text-center"/></div>
                                            <div className="pt-2"><button onClick={handleAplicarHuespedes} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 text-sm rounded-lg">Aplicar</button></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Botón Buscar */}
                        <div className="mt-6">
                            <button onClick={handleMainSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Search size={18} className="mr-2" />} {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto p-4 flex-grow">
                {/* Filtros */}
                <div className="md:hidden mb-4">
                    <button onClick={() => setMostrarFiltros(s => !s)} className="w-full bg-white shadow rounded-lg p-3 flex items-center justify-center text-gray-700 font-medium">
                        <Filter size={18} className="mr-2 text-blue-600" /> {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className={`${mostrarFiltros ? 'block' : 'hidden'} md:block w-full md:w-1/4 transition-all duration-300`}>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><Filter size={20} className="mr-2 text-blue-600" /> Filtrar</h2>
                            <div className="space-y-5">
                                {/* Precio */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por Noche</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1"><span className="absolute inset-y-0 left-3 flex items-center text-gray-500"><DollarSign size={16} /></span><input type="number" name="precioMin" placeholder="Mín." value={filtros.precioMin} onChange={handleFiltroChange} className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                                        <span className="text-gray-400">-</span>
                                        <div className="relative flex-1"><span className="absolute inset-y-0 left-3 flex items-center text-gray-500"><DollarSign size={16} /></span><input type="number" name="precioMax" placeholder="Máx." value={filtros.precioMax} onChange={handleFiltroChange} className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                                    </div>
                                </div>
                                {/* Baños */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2"><div className="flex items-center gap-2"><Bath size={16} className="text-blue-600" /> Baños (mín.)</div></label>
                                    <div className="relative">
                                        <select name="banos" value={filtros.banos} onChange={handleFiltroChange} className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                            <option value="">Todos</option>
                                            {banosApiOptions.map(num => <option key={num} value={num}>{num}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                                    </div>
                                </div>
                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2"><div className="flex items-center gap-2"><Home size={16} className="text-blue-600" /> Tipo</div></label>
                                    <div className="relative">
                                        <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange} className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                                            <option value="">Todos</option>
                                            {tiposOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                                    </div>
                                </div>
                                {/* Botones */}
                                <div className="pt-4 space-y-3">
                                    <button onClick={aplicarFiltrosLaterales} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 animate-spin" size={18} />} Aplicar filtros
                                    </button>
                                    
                                    <button onClick={limpiarFiltros} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                                        <RefreshCw size={18} className="mr-2" /> Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido Principal */}
                    <div className="w-full md:w-3/4 space-y-6">
                        {/* Mapa */}
                        <div className="bg-white p-4 rounded-xl shadow-md h-64 md:h-96 relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><MapPin size={18} className="mr-2 text-blue-600" /> Ubicación</h2>
                            <div className="absolute inset-0 mt-16 rounded-lg overflow-hidden" style={{ height: 'calc(100% - 4rem)' }}>
                                <MapContainer
                                    propiedades={propiedadesFiltradas} 
                                    propiedadSeleccionada={propiedadSeleccionada}
                                    onMarkerClick={setPropiedadSeleccionada}
                                />
                                {propiedadSeleccionada && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-20 max-w-sm"> 
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-bold truncate pr-2">{propiedadSeleccionada.titulo}</h3>
                                            <span className="text-blue-600 font-semibold whitespace-nowrap">${(propiedadSeleccionada.precioPorNoche || propiedadSeleccionada.precioOriginal)?.toLocaleString() || 'N/A'} / Noche</span>
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">{propiedadSeleccionada.barrio || 'N/A'}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lista de Propiedades */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center"><Home size={20} className="mr-2 text-blue-600" /> Propiedades disponibles</h2>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{propiedadesFiltradas.length} resultados</span>
                            </div>

                            {loading ? ( <div className="text-center p-10"><Loader2 className="animate-spin text-blue-500 mx-auto" size={40} /></div> )
                            : error ? ( <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div> )
                            : propiedadesFiltradas.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl shadow-md text-center"><div className="text-blue-500 mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-blue-50 rounded-full"><Search size={32} /></div><h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3><p className="text-gray-600 mt-2">Intenta modificar los filtros de búsqueda</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {propiedadesFiltradas.map(prop => (
                                        <div key={prop.id} onClick={() => setPropiedadSeleccionada(prop)} className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${propiedadSeleccionada?.id === prop.id ? 'ring-2 ring-blue-500 scale-102' : ''}`}>
                                            <div className="h-52 bg-gray-200 relative">
                                                <img src={prop.imagenes?.[0] || `https://picsum.photos/seed/${prop.id}/400/300`} alt={prop.titulo} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute top-3 left-3 right-3 flex justify-between items-start"> 
                                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">{prop.tipo}</div>
                                
                                                    <button onClick={(e) => toggleFavorito(prop.id, e)} className={`p-2 rounded-full shadow-md transition-colors ${prop.favorito ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}>
                                                        <Bookmark size={18} className={prop.favorito ? 'fill-current' : ''} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{prop.titulo}</h3>
                                                    <span className="text-lg font-bold text-blue-600 whitespace-nowrap">${(prop.precioPorNoche || prop.precioOriginal)?.toLocaleString() || 'N/A'} <span className="text-sm font-normal text-gray-600">/ Noche</span></span>
                                                </div>
                                                <p className="text-sm text-gray-600 flex items-center truncate"><MapPin size={14} className="mr-1 text-blue-500 flex-shrink-0"/>{prop.barrio}, {prop.localidad || prop.provincia}</p>
                                                <div className="flex gap-4 mt-4 text-sm"> 
                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg"><BedDouble size={16} /><span>{prop.habitaciones || '?'}</span></div>
                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg"><Bath size={16} /><span>{prop.banos || '?'}</span></div>
                                                    
                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg"><Maximize size={16} /><span>{prop.superficie || '?'} m²</span></div>
                                                </div>

                                                {prop.servicios?.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Servicios incluidos</h4>
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                                                            {prop.servicios.slice(0, 4).map(servicio => (
                                                                <span key={servicio} className="bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                                                    {servicio}
                                                                </span>
                                                            ))}
                                                            {prop.servicios.length > 4 && (
                                                                <span className="text-gray-500">
                                                                    +{prop.servicios.length - 4} más
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <button onClick={() => navigate(`/alquilertemporario/detalle/${prop.id}`)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow">
                                                    Ver detalles
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AlquilerTemporario;