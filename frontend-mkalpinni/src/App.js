import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtegerRuta from "./ProtectedRoute";
import { UserProvider } from "./Context/UserContext";
import { AdminProvider } from "./Context/AdminContext";
import "./App.css";

import Login from "./componentes/Login/Login";
import { Registrar } from "./componentes/Registrar/Registrar";

import Inicio from "./componentes/inicio/Inicio/Inicio";
import Comprar from "./componentes/inicio/Comprar/Comprar";
import Ventadetalle from "./componentes/inicio/Comprar/VentaDetalle";
import Alquiler from "./componentes/inicio/Alquiler/Alquiler";
import AlquilerDetalle from "./componentes/inicio/Alquiler/AlquilerDetalle";
import AlquilerTemporario from "./componentes/inicio/AlquilerTemporario/AlquilerTemporario";
import AlquilerTemporarioDetalle from "./componentes/inicio/AlquilerTemporario/AlquilerTemporarioDetalle";
import Tasaciones from "./componentes/inicio/Tasaciones/Tasaciones";
import Contacto from "./componentes/inicio/Contacto/Contacto";
import Terminos from "./componentes/inicio/Componentes/Terminos";
import Privacidad from "./componentes/inicio/Componentes/Privacidad";

import Inquilino from "./componentes/Inquilino/Inquilino";
import Forms from "./componentes/Inquilino/Forms";
import MisDatos from "./componentes/Inquilino/MisDatos";
import InicioInquilino from "./componentes/Inquilino/InicioInquilino";
import Propiedades from "./componentes/Inquilino/Propiedades";

import Perfil from "./componentes/Perfil/Perfil";
import EditPerfil from "./componentes/Perfil/EditarPerfil";

import Admin from "./componentes/Admin/Admi";
import PropiedadesA from "./componentes/Admin/Propiedades/Propiedades";
import AlquilerTem from "./componentes/Admin/AlquilerTemporario/Temporarios";
import RegistroCliente from "./componentes/Admin/Clientes/RegistroCliente";
import Reportes from "./componentes/Admin/Reportes/Reportes";
import Configuracion from "./componentes/Admin/Configuracion/Configuracion";
import Actividad from "./componentes/Admin/Actividad/Actividad";
import Pagos from "./componentes/Admin/Pagos/Pagos";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Routes>
          <Route path="/iniciarsesion" element={<Login />} />
          <Route path="/registrarse" element={<Registrar />} />
          

          <Route path="/" element={<Inicio />} />
          <Route path="/venta" element={<Comprar />} />
          <Route path="/venta/detalle/:id" element={<Ventadetalle />} />
          <Route path="/alquiler" element={<Alquiler />} />
          <Route path="/alquiler/detalle/:id" element={<AlquilerDetalle />} />
          <Route path="/alquilerTemporario" element={<AlquilerTemporario />} />
          <Route path="/alquilerTemporario/detalle/:id" element={<AlquilerTemporarioDetalle />} />
          <Route path="/tasaciones" element={<Tasaciones />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />

          <Route path="/cliente" element={<ProtegerRuta><Inquilino /></ProtegerRuta>} />
          <Route path="/cliente/formulario" element={<ProtegerRuta><Forms /></ProtegerRuta>} />
          <Route path="/cliente/misdatos" element={<ProtegerRuta><MisDatos /></ProtegerRuta>} />
          <Route path="/cliente/iniciocliente" element={<ProtegerRuta><InicioInquilino /></ProtegerRuta>} />
          <Route path="/cliente/propiedades" element={<ProtegerRuta><Propiedades /></ProtegerRuta>} />

          <Route path="/admin" element={
            <ProtegerRuta>
              <AdminProvider>
                <Admin />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/propiedades" element={
            <ProtegerRuta>
              <AdminProvider>
                <PropiedadesA />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/temporarios" element={
            <ProtegerRuta>
              <AdminProvider>
                <AlquilerTem />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/clientes" element={
            <ProtegerRuta>
              <AdminProvider>
                <RegistroCliente />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/reportes" element={
            <ProtegerRuta>
              <AdminProvider>
                <Reportes />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/configuracion" element={
            <ProtegerRuta>
              <AdminProvider>
                <Configuracion />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/actividad" element={
            <ProtegerRuta>
              <AdminProvider>
                <Actividad />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/admin/pagos" element={
            <ProtegerRuta>
              <AdminProvider>
                <Pagos />
              </AdminProvider>
            </ProtegerRuta>
          } />
          <Route path="/registrar-cliente" element={
            <ProtegerRuta>
              <AdminProvider>
                <RegistroCliente />
              </AdminProvider>
            </ProtegerRuta>
          } />

          <Route path="/perfil" element={<ProtegerRuta><Perfil /></ProtegerRuta>} />
          <Route path="/editarperfil" element={<ProtegerRuta><EditPerfil /></ProtegerRuta>} />

          

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;