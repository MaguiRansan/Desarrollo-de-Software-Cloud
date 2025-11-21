import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import logo from "../../logo/logo.png";
import { useUser } from "../../Context/UserContext";
import { API_BASE_URL } from '../../config/apiConfig';
import axios from "axios";

export const EditarPerfil = ({ onUpdate }) => {
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const [mensajeActualizado, setMensajeActualizado] = useState("");
    const [errors, setErrors] = useState({ nombre: '', apellido: '', telefono: '', email: '' });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const validateField = (name, value) => {
        const inputValue = typeof value === 'string' ? value.trim() : value;
        let error = '';

        switch (name) {
            case 'nombre':
            case 'apellido':
                if (!inputValue) {
                    error = 'Este campo es requerido.';
                } else if (!/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(inputValue)) {
                    error = 'Debe contener solo letras, espacios, tildes, apóstrofes y guiones. Entre 2 y 50 caracteres.';
                }
                break;
            case 'telefono':
                if (inputValue) {
                    const digitsOnly = inputValue.replace(/[^0-9]/g, '');
                    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                        error = 'El teléfono debe tener entre 7 y 15 dígitos.';
                    } else if (!/^[+\s\-()0-9]+$/.test(inputValue)) {
                        error = 'Solo se permiten números, espacios, +, (, ), y -.';
                    }
                }
                break;
            case 'email':
                if (!inputValue) {
                    error = 'El email es requerido.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
                    error = 'Formato de email inválido.';
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const cargarPerfil = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await axios.get(
                `${API_BASE_URL}/Usuario/Perfil`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data || !response.data.value) throw new Error("No se encontraron datos del perfil.");
            const perfilData = response.data.value;
            setNombre(perfilData.nombre || "");
            setApellido(perfilData.apellido || "");
            setEmail(perfilData.correo || "");
            setTelefono(perfilData.telefono || "");
            setErrors({ nombre: '', apellido: '', telefono: '', email: '' });
        } catch (error) {
            if (error.response) {
                alert(`Error ${error.response.status}: ${error.response.data.message || "No se pudieron cargar los datos del perfil."}`);
            } else {
                alert(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPerfil();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'nombre':
                setNombre(value);
                break;
            case 'apellido':
                setApellido(value);
                break;
            case 'telefono':
                setTelefono(value);
                break;
            case 'email':
                setEmail(value);
                break;
            default:
                break;
        }
        validateField(name, value);
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        const isNombreValid = validateField('nombre', nombre);
        const isApellidoValid = validateField('apellido', apellido);
        const isTelefonoValid = validateField('telefono', telefono);
        const isEmailValid = validateField('email', email);
        if (!isNombreValid || !isApellidoValid || !isEmailValid || !isTelefonoValid) {
            return;
        }
        try {
            setLoading(true);
            const token = sessionStorage.getItem('authToken');
            const updatePayload = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono?.trim() || undefined
            };
            const response = await axios.put(
                `${API_BASE_URL}/Usuario/Actualizar`,
                updatePayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.status) {
                const updatedUser = response.data.value;
                sessionStorage.setItem("userData", JSON.stringify(updatedUser));
                if (setUser) {
                    setUser(updatedUser);
                }
                if (typeof onUpdate === 'function') {
                    try { onUpdate(updatedUser); } catch { }
                }
                setMensajeActualizado("Perfil actualizado con éxito.");
                setTimeout(() => {
                    navigate('/perfil', { replace: true });
                }, 800);
            } else {
                alert("No se pudo actualizar el perfil.");
            }
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            if (error.response) {
                alert(`Error ${error.response.status}: ${error.response.data.message || "No se pudo actualizar el perfil."}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        navigate(-1, { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-white border-b border-slate-200 p-6 text-center relative flex flex-col items-center">
                    <img src={logo} alt="Logo" className="w-40 h-auto object-contain mb-2" />
                    <h3 className="text-2xl font-semibold text-slate-800 tracking-wide">Editar Perfil</h3>
                </div>

                {mensajeActualizado && (
                    <div className="bg-gray-700 text-white text-center p-4 animate-pulse">
                        {mensajeActualizado}
                    </div>
                )}

                {loading ? (
                    <p>Cargando datos...</p>
                ) : (

                    <form onSubmit={handleActualizar} className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input value={nombre} onChange={handleInputChange} name="nombre"
                                    type="text" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.nombre ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                <input value={apellido} onChange={handleInputChange} name="apellido"
                                    type="text" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.apellido ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                                {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                            <input value={email} onChange={handleInputChange} name="email" disabled
                                type="email" className={`w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input value={telefono} onChange={handleInputChange} name="telefono"
                                type="text" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.telefono ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'}`} />
                            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="submit" className="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
                                Actualizar Perfil
                            </button>
                            <button type="button" onClick={handleCancelar}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarPerfil;