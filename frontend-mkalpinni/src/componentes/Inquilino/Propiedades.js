import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { useState } from "react";
import Header from "../inicio/Componentes/Header";
import Footer from "../inicio/Componentes/Footer";

const propiedades = [
  { 
    id: 1, 
    titulo: "Casa en venta", 
    tipoUsuario: "Locador", 
    transaccion: "Venta", 
    foto: "https://via.placeholder.com/400x300", 
    direccion: "Calle Falsa 123, Ciudad Ficticia", 
    inquilino: "Juan Pérez", 
    propietario: "Carlos Sánchez", 
    estado: "Disponible" 
  },
  { 
    id: 2, 
    titulo: "Departamento en alquiler", 
    tipoUsuario: "Locatario", 
    transaccion: "Alquiler", 
    foto: "https://via.placeholder.com/400x300", 
    direccion: "Avenida Siempre Viva 456, Ciudad Ficticia", 
    inquilino: "María Gómez", 
    propietario: "Laura Martínez", 
    estado: "Pendiente" 
  },
  { 
    id: 3, 
    titulo: "Local comercial", 
    tipoUsuario: "Locador", 
    transaccion: "Venta", 
    foto: "https://via.placeholder.com/400x300", 
    direccion: "Calle Comercial 789, Ciudad Ficticia", 
    inquilino: "Carlos López", 
    propietario: "Ana Rodríguez", 
    estado: "Disponible" 
  },
  { 
    id: 4, 
    titulo: "Terreno en alquiler temporal", 
    tipoUsuario: "Locatario", 
    transaccion: "Alquiler Temporal", 
    foto: "https://via.placeholder.com/400x300", 
    direccion: "Boulevard de los Sueños 101, Ciudad Ficticia", 
    inquilino: "Ana Martínez", 
    propietario: "Pedro Gómez", 
    estado: "Disponible" 
  },
];

const usuarioAutenticado = { tipoUsuario: ["Locador", "Locatario"] };

export default function Propiedades() {
  const [filtroTransaccion, setFiltroTransaccion] = useState("");
  const [mostrarDisponibles, setMostrarDisponibles] = useState(false);

  const propiedadesFiltradas = propiedades.filter((prop) => {
    const cumpleTransaccion = filtroTransaccion ? prop.transaccion === filtroTransaccion : true;
    const cumpleDisponibilidad = mostrarDisponibles 
      ? prop.estado === "Disponible" 
      : true;
    return (
      usuarioAutenticado.tipoUsuario.includes(prop.tipoUsuario) &&
      cumpleTransaccion &&
      cumpleDisponibilidad
    );
  });

  const getColor = (transaccion, estado) => {
    if (estado === "Pendiente") return "bg-red-100 border-red-500";
    switch (transaccion) {
      case "Venta":
        return "bg-blue-100 border-blue-500";
      case "Alquiler":
        return "bg-green-100 border-green-500";
      case "Alquiler Temporal":
        return "bg-yellow-100 border-yellow-500";
      default:
        return "bg-gray-100 border-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Contenedor principal */}
      <div className="container mx-auto p-6 flex">
        {/* Filtro a la izquierda */}
        <div className="w-1/4 p-4 bg-white rounded-lg shadow-md mr-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Filtros</h2>
          <div className="space-y-4">
            {/* Filtro por transacción */}
            <select
              onChange={(e) => setFiltroTransaccion(e.target.value)}
              className="w-full p-3 border-2 border-blue-300 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Todas las transacciones</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Alquiler Temporal">Alquiler Temporal</option>
            </select>

            {/* Filtro por disponibilidad */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponible"
                checked={mostrarDisponibles}
                onChange={(e) => setMostrarDisponibles(e.target.checked)}
                className="w-5 h-5 border-2 border-blue-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="disponible" className="ml-2 text-gray-700 font-medium">
                Mostrar solo disponibles
              </label>
            </div>
          </div>
        </div>

        {/* Lista de propiedades a la derecha */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-8 text-blue-800">Propiedades</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propiedadesFiltradas.map((prop) => (
              <div 
                key={prop.id} 
                className={`p-6 border-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform ${getColor(prop.transaccion, prop.estado)}`}
              >
                <img 
                  src={prop.foto} 
                  alt={prop.titulo} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{prop.titulo}</h2>
                <p className="text-gray-700 mb-2 font-medium">
                  <span className="font-semibold">Dirección:</span> {prop.direccion}
                </p>
                <p className="text-gray-700 mb-2 font-medium">
                  <span className="font-semibold">Propietario:</span> {prop.propietario}
                </p>
                <p className="text-gray-700 mb-4 font-medium">
                  {prop.tipoUsuario === "Locador" 
                    ? <span><span className="font-semibold">Inquilino:</span> {prop.inquilino}</span> 
                    : <span><span className="font-semibold">Alquilado por:</span> {prop.inquilino}</span>}
                </p>
                {/* Badge de transacción */}
                <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-full">
                  {prop.transaccion}
                </span>
                {/* Badge de estado "Pendiente" */}
                {prop.estado === "Pendiente" && (
                  <span className="inline-block px-3 py-1 mt-2 text-sm font-semibold text-white bg-red-500 rounded-full">
                    Pendiente
                  </span>
                )}
                {/* Botón "Ver más" solo para Alquiler Temporal */}
                {prop.transaccion === "Alquiler Temporal" && (
                  <button
                    className="w-full mt-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver más
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}