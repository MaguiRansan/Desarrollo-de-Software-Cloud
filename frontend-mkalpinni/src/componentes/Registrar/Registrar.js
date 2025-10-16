import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from '../../config/apiConfig';
import logo from "../../logo/logo.png";

export const Registrar = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    tipoUsuario: "",
    dni: "",
  });

  const [errors, setErrors] = useState({
    tipoUsuario: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    telefono: ""
  });

  const [existingEmails, setExistingEmails] = useState([]);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const generateToken = () => crypto.randomUUID();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const tiposUsuario = [
    { id: 1, descripcion: "Propietario" },
    { id: 2, descripcion: "Inquilino" },
    { id: 3, descripcion: "Administrador" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Usuario/ListaUsuarios`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        const usersArray = Array.isArray(data) ? data : data.users || [data];
        const emails = usersArray.map(user => user.email);
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleLogoClick = () => navigate("/home");

  const validateEmail = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "El correo es obligatorio" }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Formato de correo inválido" }));
      return false;
    }

    setIsCheckingEmail(true);
    try {
      if (existingEmails.includes(formData.email)) {
        setErrors(prev => ({ ...prev, email: "Este correo ya está registrado" }));
        setIsCheckingEmail(false);
        return false;
      }
      setErrors(prev => ({ ...prev, email: "" }));
      setIsCheckingEmail(false);
      return true;
    } catch (error) {
      console.error("Error al verificar correo:", error);
      setIsCheckingEmail(false);
      return false;
    }
  };

  const validateStep = async () => {
    let newErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.tipoUsuario) {
          newErrors.tipoUsuario = "Debes seleccionar un tipo de usuario";
          isValid = false;
        }
        break;
      case 2:
        if (!formData.nombre) {
          newErrors.nombre = "El nombre es obligatorio";
          isValid = false;
        }
        if (!formData.apellido) {
          newErrors.apellido = "El apellido es obligatorio";
          isValid = false;
        }
        if (!formData.dni) {
          newErrors.dni = "El DNI es obligatorio";
          isValid = false;
        } else if (!/^\d{8}[a-zA-Z]?$/.test(formData.dni)) {
          newErrors.dni = "DNI inválido";
          isValid = false;
        }
        if (!formData.telefono) {
          newErrors.telefono = "El teléfono es obligatorio";
          isValid = false;
        } else if (!/^\d{9}$/.test(formData.telefono)) {
          newErrors.telefono = "Teléfono inválido (9 dígitos)";
          isValid = false;
        }
        break;
      case 3:
        const emailValid = await validateEmail();
        if (!emailValid) isValid = false;
        break;
      case 4:
        if (!formData.password) {
          newErrors.password = "La contraseña es obligatoria";
          isValid = false;
        } else if (formData.password.length < 6) {
          newErrors.password = "La contraseña debe tener al menos 6 caracteres";
          isValid = false;
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Las contraseñas no coinciden";
          isValid = false;
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = async () => {
    if (await validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateStep()) {
      setLoading(true);
      try {
        const tipoUsuarioSeleccionado = tiposUsuario.find(
          tipo => tipo.descripcion === formData.tipoUsuario
        );
  
        const usuarioData = {
          id: 0,
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          dni: formData.dni,
          tipoUsuario: tipoUsuarioSeleccionado?.id || 0,
          fechaRegistro: new Date().toISOString().split('T')[0],
          tokenRecuperacion: generateToken(),
          activo: true
        };
   
  
        const response = await fetch(`${API_BASE_URL}/Usuario/Registrar`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(usuarioData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error en el registro: ${response.status}`);
        }

        alert("Registro exitoso");
        navigate("/login");
        
      } catch (error) {
        console.error("Error:", error);
        alert("Error en el registro: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto text-center pt-[100px] h-screen box-border bg-grey-800">
      <header className="w-full flex items-center justify-between p-4 bg-white-800 text-white box-shadow-md fixed top-0 left-0 z-10">
        <img
          src={logo}
          alt="Logo"
          className="h-24 cursor-pointer rm-4"
          onClick={handleLogoClick}
        />
      </header>

      <div className="mt-10 text-center">
        <div className="w-full h-[12px] bg-[#e0e0e0] rounded-full overflow-hidden mt-5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-width duration-300 ease-in-out rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <main className="p-4">
        {step === 1 && (
          <div>
            <h1 className="text-[36px] text-blue-800 mb-10 font-semibold">
              Tipo de usuario
            </h1>
            <label className="block text-left text-[20px]" htmlFor="tipoUsuario">
              *Seleccione su perfil
              <select
                id="tipoUsuario"
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
              >
                <option value="">Selecciona una opción</option>
                {tiposUsuario.map((tipo) => (
                  <option key={tipo.id} value={tipo.descripcion}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
            </label>
            {errors.tipoUsuario && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.tipoUsuario}
              </span>
            )}
            <div className="flex justify-between mt-6">
              <button
                className="h-[48px] bg-[#f0f0f0] text-[#666] border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleBack}
                disabled={step === 1}
              >
                Volver
              </button>
              <button
                className="h-[48px] bg-blue-600 text-white border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-[36px] text-blue-800 mb-10 font-semibold">
              Información personal
            </h1>
            <label className="block text-left text-[20px]" htmlFor="nombre">
              *Nombre
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                placeholder="Escribe tu nombre"
              />
            </label>
            {errors.nombre && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.nombre}
              </span>
            )}

            <label className="block text-left text-[20px] mt-4" htmlFor="apellido">
              *Apellido
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                placeholder="Escribe tu apellido"
              />
            </label>
            {errors.apellido && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.apellido}
              </span>
            )}

            <label className="block text-left text-[20px] mt-4" htmlFor="dni">
              *DNI/NIE
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                placeholder="Escribe tu DNI/NIE"
              />
            </label>
            {errors.dni && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.dni}
              </span>
            )}

            <label className="block text-left text-[20px] mt-4" htmlFor="telefono">
              *Teléfono
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                placeholder="Escribe tu teléfono"
              />
            </label>
            {errors.telefono && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.telefono}
              </span>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="h-[48px] bg-[#f0f0f0] text-[#666] border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="h-[48px] bg-blue-600 text-white border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-[36px] text-blue-800 mb-10 font-semibold">
              Datos de acceso
            </h1>
            <label className="block text-left text-[20px]" htmlFor="email">
              *Correo electrónico
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={validateEmail}
                className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                placeholder="Escribe tu correo"
              />
            </label>
            {isCheckingEmail && (
              <span className="text-blue-500 text-[15px] mt-1 block">
                Verificando correo...
              </span>
            )}
            {errors.email && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.email}
              </span>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="h-[48px] bg-[#f0f0f0] text-[#666] border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="h-[48px] bg-blue-600 text-white border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleNext}
                disabled={isCheckingEmail || !!errors.email}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-[36px] text-blue-800 mb-10 font-semibold">
              Contraseña
            </h1>
            <div className="relative">
              <label className="block text-left text-[20px]" htmlFor="password">
                *Contraseña
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                    placeholder="Escribe tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>
            </div>
            {errors.password && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.password}
              </span>
            )}

            <div className="relative mt-4">
              <label className="block text-left text-[20px]" htmlFor="confirmPassword">
                *Confirmar contraseña
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-[60px] p-4 border border-[#e0e0e0] rounded-md text-[15px] w-full mt-[5%] box-border"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-[15px] mt-1 block">
                {errors.confirmPassword}
              </span>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="h-[48px] bg-[#f0f0f0] text-[#666] border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleBack}
              >
                Volver
              </button>
              <button
                className="h-[48px] bg-blue-600 text-white border-none rounded-md text-[16px] font-medium cursor-pointer transition-all duration-200 w-[48%]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};