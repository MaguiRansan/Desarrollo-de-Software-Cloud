import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaKey } from "react-icons/fa";
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaLock, FaUnlockAlt } from "react-icons/fa";
import { API_BASE_URL } from '../../../config/apiConfig';
import logo from '../../../logo/logo.png';

const ResetPassword = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  let token = queryParams.get('ref');
  if (token) {
    token = decodeURIComponent(token).trim();
  }

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isCommonPassword = ['password', '12345678', 'qwerty', 'admin', 'welcome'].includes(password.toLowerCase());

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula.';
    }
    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número.';
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*).';
    }
    if (isCommonPassword) {
      return 'Por favor, elija una contraseña más segura.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('Token inválido. Por favor, solicita restablecer la contraseña de nuevo.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Usuario/reestablecer-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: token, nuevaContraseña: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Error al restablecer la contraseña';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessage(data.message || 'Contraseña restablecida con éxito.');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 opacity-12 pointer-events-none">
        <div className="absolute top-8 left-8 text-blue-200 text-5xl">
          <FaKey className="transform rotate-15" />
        </div>
        <div className="absolute bottom-8 right-8 text-blue-200 text-4xl">
          <FaBuilding className="transform -rotate-95" />
        </div>
        <div className="absolute top-8 right-8 text-blue-200 text-3xl">
          <FaHome className="transform rotate-175" />
        </div>
        <div className="absolute bottom-8 left-8 text-blue-200 text-2xl">
          <FaKey className="transform -rotate-25" />
        </div>

        <div className="absolute top-1/2 left-8 text-blue-200 text-xl">
          <FaBuilding className="transform rotate-205" />
        </div>
        <div className="absolute bottom-1/2 right-8 text-blue-200 text-lg">
          <FaHome className="transform -rotate-135" />
        </div>
        <div className="absolute top-8 left-1/2 text-blue-200 text-sm">
          <FaKey className="transform rotate-285" />
        </div>
        <div className="absolute bottom-8 right-1/2 text-blue-200 text-xs">
          <FaBuilding className="transform -rotate-215" />
        </div>

        <div className="absolute top-16 left-1/4 text-blue-200 text-lg">
          <FaHome className="transform rotate-75" />
        </div>
        <div className="absolute bottom-16 right-1/4 text-blue-200 text-sm">
          <FaKey className="transform -rotate-105" />
        </div>
        <div className="absolute top-1/4 left-16 text-blue-200 text-sm">
          <FaBuilding className="transform rotate-155" />
        </div>
        <div className="absolute bottom-1/4 right-16 text-blue-200 text-xs">
          <FaHome className="transform -rotate-85" />
        </div>

        <div className="absolute top-3/4 left-1/3 text-blue-200 text-lg">
          <FaKey className="transform rotate-315" />
        </div>
        <div className="absolute bottom-3/4 right-1/3 text-blue-200 text-sm">
          <FaBuilding className="transform -rotate-245" />
        </div>
        <div className="absolute top-1/3 left-3/4 text-blue-200 text-xs">
          <FaHome className="transform rotate-195" />
        </div>
        <div className="absolute bottom-1/3 right-3/4 text-blue-200 text-sm">
          <FaKey className="transform -rotate-75" />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10">

        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 sm:p-10">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Logo Inmobiliaria"
              className="mx-auto h-28 w-28 object-contain mb-6"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Restablecer Contraseña
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUnlockAlt className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              Restablecer Contraseña
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-md text-center text-sm font-medium transition-colors ${
              message.includes('éxito') || 
              message.includes('Contraseña restablecida')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.includes('éxito') || message.includes('Contraseña restablecida') ? (
                <>
                  <FaCheck className="inline-block mr-2 text-green-600" />
                  {message}
                </>
              ) : (
                <>
                  <FaTimes className="inline-block mr-2 text-red-600" />
                  {message}
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Mkalpin Negocios Inmobiliarios
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;