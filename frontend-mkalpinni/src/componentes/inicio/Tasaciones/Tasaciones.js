import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../config/apiConfig";

const TasacionPage = () => {
  const [formData, setFormData] = useState({
    direccion: "",
    metrosCuadrados: "",
    habitaciones: "",
    banos: "",
    antiguedadAnios: "",
    descripcionPropiedad: "",
    nombreContacto: "",
    telefonoContacto: "",
    correoContacto: "",
    imagenes: [],
    tipoPropiedad: "casa",
    estadoPropiedad: "bueno",
    ubicacionTipo: "urbano",
    barrioPropiedad: "",
    localidadPropiedad: "",
    provinciaPropiedad: "",
  });

  const [step, setStep] = useState(1);
  const [valorTasacion, setValorTasacion] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tasacionRequestId, setTasacionRequestId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, imagenes: files });

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    setValorTasacion(null);
    setSuccessMessage(null);
    setTasacionRequestId(null);

    try {
      const formPayload = new FormData();

      formPayload.append("direccion", formData.direccion);
      formPayload.append("tipoPropiedad", formData.tipoPropiedad);
      formPayload.append("ubicacionTipo", formData.ubicacionTipo);
      formPayload.append("metrosCuadrados", formData.metrosCuadrados);
      formPayload.append("habitaciones", formData.habitaciones);
      formPayload.append("banos", formData.banos);
      formPayload.append("antiguedadAnios", formData.antiguedadAnios);
      formPayload.append("estadoPropiedad", formData.estadoPropiedad);
      formPayload.append("descripcionPropiedad", formData.descripcionPropiedad);
      formPayload.append("nombreContacto", formData.nombreContacto);
      formPayload.append("telefonoContacto", formData.telefonoContacto);
      formPayload.append("correoContacto", formData.correoContacto);
      formPayload.append("barrioPropiedad", formData.barrioPropiedad);
      formPayload.append("localidadPropiedad", formData.localidadPropiedad);
      formPayload.append("provinciaPropiedad", formData.provinciaPropiedad);

      formData.imagenes.forEach((file) => {
        formPayload.append("imagenes", file);
      });

      const response = await fetch(`${API_BASE_URL}/Tasacion/Crear`, {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la tasación");
      }

      if (data.status) {
        setSuccessMessage(
          data.message ||
            "¡Gracias! Tu solicitud de tasación fue enviada correctamente. Nos comunicaremos contigo a la brevedad."
        );
        setTasacionRequestId(data.value?.idTasacion || null);
      } else {
        setError(data.message || "No se pudo procesar la solicitud de tasación");
      }
    } catch (error) {
      setError(error.message || "Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.direccion || !formData.tipoPropiedad || !formData.ubicacionTipo) {
        setError("Por favor, completa todos los campos requeridos en este paso.");
        return;
      }
    } else if (step === 2) {
      if (
        !formData.metrosCuadrados ||
        !formData.habitaciones ||
        !formData.banos ||
        !formData.antiguedadAnios ||
        !formData.estadoPropiedad
      ) {
        setError("Por favor, completa todos los campos requeridos en este paso.");
        return;
      }
    }
    setError(null);
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="flex justify-center items-center p-6 my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-70"></div>

          {!successMessage && (
            <div className="mb-8 relative z-10">
              <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%"}`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className={step >= 1 ? "font-semibold text-blue-600" : ""}>
                  Propiedad
                </span>
                <span className={step >= 2 ? "font-semibold text-blue-600" : ""}>
                  Características
                </span>
                <span className={step >= 3 ? "font-semibold text-blue-600" : ""}>
                  Contacto
                </span>
              </div>
            </div>
          )}

          <h2 className="text-4xl font-bold text-gray-900 text-center mb-8 relative z-10">
            {successMessage
              ? "Solicitud enviada"
              : "Tasa tu propiedad con Nosotros"}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">¡Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {successMessage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-inner">
                <h3 className="text-xl font-bold text-blue-800">
                  {successMessage}
                </h3>
                <p className="text-sm text-blue-600 mt-4">
                  Nos comunicaremos utilizando los datos de contacto proporcionados.
                </p>
                {tasacionRequestId && (
                  <p className="text-xs text-gray-500 mt-2">
                    ID de solicitud: {tasacionRequestId}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Resumen de la Propiedad
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Dirección</p>
                    <p className="font-medium">{formData.direccion}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tipo</p>
                    <p className="font-medium capitalize">
                      {formData.tipoPropiedad}
                    </p>
                  </div>
                  {formData.barrioPropiedad && (
                    <div>
                      <p className="text-gray-600">Barrio</p>
                      <p className="font-medium">{formData.barrioPropiedad}</p>
                    </div>
                  )}
                  {formData.localidadPropiedad && (
                    <div>
                      <p className="text-gray-600">Localidad</p>
                      <p className="font-medium">{formData.localidadPropiedad}</p>
                    </div>
                  )}
                  {formData.provinciaPropiedad && (
                    <div>
                      <p className="text-gray-600">Provincia</p>
                      <p className="font-medium">{formData.provinciaPropiedad}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Tamaño</p>
                    <p className="font-medium">{formData.metrosCuadrados} m²</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Habitaciones</p>
                    <p className="font-medium">{formData.habitaciones}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Baños</p>
                    <p className="font-medium">{formData.banos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Antigüedad</p>
                    <p className="font-medium">{formData.antiguedadAnios} años</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex justify-center">
            <button
              onClick={() => {
                setValorTasacion(null);
                setSuccessMessage(null);
                setTasacionRequestId(null);
                setStep(1);
                setFormData({
                  direccion: "",
                  metrosCuadrados: "",
                  habitaciones: "",
                  banos: "",
                  antiguedadAnios: "",
                  descripcionPropiedad: "",
                  nombreContacto: "",
                  telefonoContacto: "",
                  correoContacto: "",
                  imagenes: [],
                  tipoPropiedad: "casa",
                  estadoPropiedad: "bueno",
                  ubicacionTipo: "urbano",
                  barrioPropiedad: "",
                  localidadPropiedad: "",
                  provinciaPropiedad: "",
                });
                setImagePreview([]);
                setError(null);
              }}
              className="py-3 px-6 bg-white border border-blue-500 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Nueva Tasación
            </button>
          </div>
              </div>
            </motion.div>
          ) : isCalculating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 animate-pulse">
                Analizando datos de la propiedad...
              </p>
            </div>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              {/* Paso 1: Datos básicos de la propiedad */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-2">
                    Información Básica
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Dirección de la propiedad:
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Ingresa la dirección completa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Barrio:
                      </label>
                      <input
                        type="text"
                        name="barrioPropiedad"
                        value={formData.barrioPropiedad}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: Centro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Localidad:
                      </label>
                      <input
                        type="text"
                        name="localidadPropiedad"
                        value={formData.localidadPropiedad}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: Rosario"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Provincia:
                    </label>
                    <input
                      type="text"
                      name="provinciaPropiedad"
                      value={formData.provinciaPropiedad}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Ej: Santa Fe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tipo de propiedad:
                    </label>
                    <select
                      name="tipoPropiedad"
                      value={formData.tipoPropiedad}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    >
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="terreno">Terreno</option>
                      <option value="local">Local Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Ubicación del inmueble:
                    </label>
                    <select
                      name="ubicacionTipo"
                      value={formData.ubicacionTipo}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    >
                      <option value="premium">Zona Premium</option>
                      <option value="urbano">Urbano</option>
                      <option value="suburbana">Suburbana</option>
                      <option value="rural">Rural</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Continuar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Paso 2: Características detalladas */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-2">
                    Características de la Propiedad
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Metros Cuadrados:
                      </label>
                      <input
                        type="number"
                        name="metrosCuadrados"
                        value={formData.metrosCuadrados}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: 120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Antigüedad (años):
                      </label>
                      <input
                        type="number"
                        name="antiguedadAnios"
                        value={formData.antiguedadAnios}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: 10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Habitaciones:
                      </label>
                      <input
                        type="number"
                        name="habitaciones"
                        value={formData.habitaciones}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Baños:
                      </label>
                      <input
                        type="number"
                        name="banos"
                        value={formData.banos}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="Ej: 2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Estado de la propiedad:
                    </label>
                    <select
                      name="estadoPropiedad"
                      value={formData.estadoPropiedad}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    >
                      <option value="excelente">Excelente</option>
                      <option value="bueno">Bueno</option>
                      <option value="regular">Regular</option>
                      <option value="a refaccionar">A refaccionar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Descripción de la propiedad:
                    </label>
                    <textarea
                      name="descripcionPropiedad"
                      value={formData.descripcionPropiedad}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Describe características adicionales..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Imágenes de la propiedad:
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors">
                      <input
                        type="file"
                        name="imagenes"
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                        id="imagenes"
                      />
                      <label htmlFor="imagenes" className="cursor-pointer block">
                        <div className="flex flex-col items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-blue-500 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-blue-600 font-medium">
                            Haz clic para seleccionar imágenes
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            o arrastra y suelta aquí
                          </span>
                        </div>
                      </label>
                    </div>

                    {imagePreview.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="relative">
                            <img
                              src={src}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-16 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Continuar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Paso 3: Datos de contacto */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-2">
                    Datos de Contacto
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nombre completo:
                    </label>
                    <input
                      type="text"
                      name="nombreContacto"
                      value={formData.nombreContacto}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Correo electrónico:
                    </label>
                    <input
                      type="email"
                      name="correoContacto"
                      value={formData.correoContacto}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Ingresa tu email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Teléfono:
                    </label>
                    <input
                      type="tel"
                      name="telefonoContacto"
                      value={formData.telefonoContacto}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                      placeholder="Ingresa tu teléfono"
                    />
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="politicas"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="politicas" className="ml-2 text-sm text-gray-600">
                      Acepto las políticas de privacidad y términos de uso
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Calcular Tasación
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          )}

          {!successMessage && !isCalculating && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Ventajas de Nuestra Tasación
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-800">
                    Resultados Inmediatos
                  </h5>
                </div>
                <div className="text-center p-4">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-800">
                    Precisión Garantizada
                  </h5>
                </div>
                <div className="text-center p-4">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-800">
                    Asesoría Personalizada
                  </h5>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TasacionPage;