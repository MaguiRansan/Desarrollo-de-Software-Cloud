import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import Header from "../inicio/Componentes/Header";
import Footer from "../inicio/Componentes/Footer";
import UserRoleDisplay from "./UserRoleDisplay";

const MisDatos = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    files: [],
    uploadTime: new Date().toISOString(),
  });

  const [isEditingAllowed, setIsEditingAllowed] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const checkEditingTime = () => {
    const uploadTime = new Date(userData.uploadTime);
    const currentTime = new Date();
    const timeDifference = currentTime - uploadTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      setIsEditingAllowed(false);
    }
  };

  useEffect(() => {
    checkEditingTime();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Mis Datos
          </h1>
          <UserRoleDisplay />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Información Personal
              </h2>
              {isEditingAllowed && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">Nombre:</span>
                {isEditing && isEditingAllowed ? (
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="border rounded-md p-2 flex-1"
                  />
                ) : (
                  <span className="text-gray-800">{userData.name}</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">Email:</span>
                {isEditing && isEditingAllowed ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="border rounded-md p-2 flex-1"
                  />
                ) : (
                  <span className="text-gray-800">{userData.email}</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">Teléfono:</span>
                {isEditing && isEditingAllowed ? (
                  <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="border rounded-md p-2 flex-1"
                  />
                ) : (
                  <span className="text-gray-800">{userData.phone}</span>
                )}
              </div>
              {isEditing && isEditingAllowed && (
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Cambios
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
              Archivos Subidos
            </h2>
            <ul className="space-y-4">
              {userData.files.map((file, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-gray-700">{file}</span>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    Descargar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isEditingAllowed && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Puedes editar tus datos durante las primeras 24 horas después de la subida.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MisDatos;