import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { API_BASE_URL } from '../../config/apiConfig';
import logo from "../../logo/logo.png";
import Foto from './pexels-expect-best-79873-323705.jpg';
import { useUser } from "../../Context/UserContext";
import ForgotPassword from './ForgotPassword';

const handleLogin = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Usuario/IniciarSesion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: email,
        contrasenaHash: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al iniciar sesión');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const saveUserSession = (token, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await handleLogin({
        email: formData.email,
        password: formData.password
      });


      await login({
        email: formData.email,
        password: formData.password,
      });

      saveUserSession(response.token, formData.rememberMe);


    } catch (error) {
      console.error('Error en submit:', error);
      setErrors({
        submit: 'Error al iniciar sesión. Por favor verifica tus credenciales.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  return (
    <div className="flex h-screen">
      {/* Columna izquierda con la imagen */}
      <div className="w-1/2 bg-gray-100 hidden md:block">
        <img src={Foto} alt="Imagen" className="w-full h-full object-cover" />
      </div>

      {/* Columna derecha con el formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img
              src={logo}
              alt="Logo"
              className="mx-auto mb-6 cursor-pointer"
              style={{ width: '180px' }}
              onClick={handleLogoClick}
            />

            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-gray-900">Iniciar Sesión</h1>
              <p className="text-gray-600">¡Bienvenido! Ingrese sus datos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 text-left">
                  Correo electrónico
                </label>
                <input
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
              </div>

              <div>
                <label htmlFor="contraseña" className="block text-gray-700 text-left">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="contraseña"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm">{errors.password}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ¿Olvidaste la contraseña?
                </button>
              </div>

              <button
                type="submit"
                className={`w-full p-3 mt-4 text-white font-semibold rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              {errors.submit && (
                <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
              )}
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;