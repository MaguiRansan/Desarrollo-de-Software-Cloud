import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL, API_STATIC_URL } from '../../config/apiConfig';
import { useUser } from '../../Context/UserContext';
import logo from "../../logo/logo.png";
import { ArrowLeft } from 'lucide-react';

const Perfil = () => {
  const { user, logout, setUser } = useUser();
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString(); } catch { return String(d); }
  };

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/Usuario/Perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status && response.data.value) {
          const freshUser = response.data.value;
          sessionStorage.setItem('userData', JSON.stringify(freshUser));
          if (setUser) setUser(freshUser);
        }
      } catch (error) {
        console.error('Error al sincronizar perfil:', error);
      }
    };
    fetchLatestProfile();
  }, [setUser]);

  const cargarFotoExistente = useCallback(async (userData = user) => {
    if (!userData?.fotoRuta) return;

    try {
      const fullPhotoUrl = userData.fotoRuta.startsWith('http')
        ? userData.fotoRuta
        : `${API_STATIC_URL}${userData.fotoRuta.startsWith('/') ? '' : '/'}${userData.fotoRuta}`;

      const timestamp = Date.now();
      const photoWithTimestamp = `${fullPhotoUrl}${fullPhotoUrl.includes('?') ? '&' : '?'}v=${timestamp}`;

      setPhotoUrl(photoWithTimestamp);
      return fullPhotoUrl;
    } catch (error) {
      console.error('Error al cargar la foto existente:', error);
      return null;
    }
  }, [user?.correo, user?.fotoRuta]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserData = sessionStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);

          if (setUser) {
            setUser(userData);
          }

          if (userData.fotoRuta) {
            await cargarFotoExistente(userData);
          }
        } else if (user?.correo) {
          await cargarFotoExistente();
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    };

    loadUserData();
  }, [user?.correo, setUser, cargarFotoExistente]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato de archivo no soportado. Usa JPG, PNG, GIF o WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    const reader = new FileReader();

    reader.onloadstart = () => {
      setIsUpdating(true);
      setError('');
    };

    reader.onloadend = () => {
      setPhoto(reader.result);
      setIsUpdating(false);
    };

    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta con otra imagen.');
      setIsUpdating(false);
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      setError('No se pudo procesar la imagen');
      setIsUpdating(false);
    }
  };

  const handleDeletePhoto = () => {
    setPhoto(null);
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();

    if (!photo) {
      setError('No se ha seleccionado ninguna imagen');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión nuevamente.');
        setIsUpdating(false);
        navigate('/iniciarsesion');
        return;
      }

      const formData = new FormData();

      try {
        if (photo instanceof File) {
          formData.append('fotoPerfil', photo);
        } else if (typeof photo === 'string' && photo.startsWith('data:')) {
          const blob = dataURItoBlob(photo);
          formData.append('fotoPerfil', blob, 'profile.jpg');
        }

        const url = `${API_BASE_URL}/Usuario/SubirFotoPerfil`;
        console.log('Enviando solicitud a:', url);
        console.log('Datos del formulario:', {
          hasFile: formData.has('fotoPerfil'),
          size: formData.get('fotoPerfil')?.size || 'N/A',
          type: formData.get('fotoPerfil')?.type || 'N/A'
        });

        const response = await axios.post(
          url,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 30000
          }
        );

        console.log('Respuesta del servidor:', response.data);

        if (response.data && response.data.status) {
          const newPhotoUrl = response.data.fotoUrl || (response.data.user && response.data.user.fotoRuta) || response.data.value?.fotoRuta;

          if (newPhotoUrl) {
            const fullPhotoUrl = newPhotoUrl.startsWith('http')
              ? newPhotoUrl
              : `${API_STATIC_URL}${newPhotoUrl.startsWith('/') ? '' : '/'}${newPhotoUrl}`;

            const timestamp = Date.now();
            const photoWithTimestamp = `${fullPhotoUrl}${fullPhotoUrl.includes('?') ? '&' : '?'}v=${timestamp}`;

            setPhotoUrl(photoWithTimestamp);

            if (setUser) {
              const updatedUser = {
                ...user,
                fotoRuta: fullPhotoUrl
              };
              setUser(updatedUser);

              sessionStorage.setItem('userData', JSON.stringify(updatedUser));
            }
          }

          setPhoto(null);
          setMensaje('Foto de perfil actualizada correctamente');
          setTimeout(() => setMensaje(''), 5000);
        } else {
          const errorMessage = response.data?.message || 'No se pudo actualizar la foto. Por favor, inténtalo de nuevo.';
          setError(errorMessage);
          console.error('Error en la respuesta del servidor:', response.data);
        }
      } catch (uploadError) {
        console.error('Error al subir la foto:', uploadError);

        let errorMessage = 'Error al subir la foto. Por favor, inténtalo de nuevo.';

        if (uploadError.response) {
          const { status, data } = uploadError.response;

          if (status === 401) {
            errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';

          } else if (status === 400) {
            errorMessage = data?.message || 'Datos de la imagen no válidos.';
          } else if (status === 413) {
            errorMessage = 'La imagen es demasiado grande. El tamaño máximo permitido es de 5MB.';
          } else if (status >= 500) {
            errorMessage = 'Error en el servidor. Por favor, inténtalo más tarde.';
          }
        } else if (uploadError.request) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (uploadError.code === 'ECONNABORTED') {
          errorMessage = 'La solicitud está tardando demasiado. Por favor, verifica tu conexión e inténtalo de nuevo.';
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al actualizar la foto:', error);
      setError(error.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setIsUpdating(false);
    }
  };

  const dataURItoBlob = (dataURI) => {
    if (!dataURI || typeof dataURI !== 'string' || !dataURI.includes(',')) {
      throw new Error('Formato de dataURI no válido');
    }

    try {
      const byteString = atob(dataURI.split(',')[1]);

      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error('Error al convertir data URI a Blob:', error);
      throw new Error('No se pudo procesar la imagen');
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 1: return "bg-indigo-600";
      case 2: return "bg-emerald-600";
      case 3: return "bg-violet-600";
      default: return "bg-slate-600";
    }
  };

  const getRoleText = (rol) => {
    switch (rol) {
      case 1: return "Propietario";
      case 2: return "Inquilino";
      case 3: return "Administrador";
      default: return "No especificado";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-md py-6 sticky top-0 z-50">
        <div className="max-w-full w-full px-20 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Logo"
                className="h-14 md:h-24 w-auto"
                onClick={() => navigate(-1)}
              />
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-2.5 text-sm font-medium text-white hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 hover:shadow-md bg-red-600"
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-medium mt-5 ml-10"
      >
        <ArrowLeft className="w-6 h-6" />
        <span>Volver</span>
      </button>


      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-slate-800">¿Seguro que quieres cerrar sesión?</h3>
            <div className="mt-4 flex justify-between gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="relative h-48 bg-slate-200">
                <div className="absolute -bottom-16 left-8 p-1.5 bg-white rounded-2xl shadow-lg">
                  <div className="relative group">
                    <img
                      src={photo || photoUrl || "ruta/a/imagen/por/defecto.jpg"}
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer p-2 bg-white bg-opacity-75 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">{`${user.nombre || ''} ${user.apellido || ''}`.trim()}</h2>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className={`inline-flex px-4 py-1.5 rounded-lg text-sm font-medium text-white ${getRoleBadgeColor(user.idrol)}`}>
                    {getRoleText(user.idrol)}
                  </span>
                  {user.idnivel && (
                    <span className="inline-flex px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600">
                      Nivel {user.idnivel}
                    </span>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-slate-500 mb-1">Correo</div>
                    <div className="font-medium break-all">{user.correo || '-'}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-slate-500 mb-1">Teléfono</div>
                    <div className="font-medium">{user.telefono || '-'}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-slate-500 mb-1">Rol</div>
                    <div className="font-medium">{getRoleText(user.idrol)}{user.rol ? ` (${user.rol})` : ''}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-slate-500 mb-1">Último acceso</div>
                    <div className="font-medium">{formatDate(user.ultimoAcceso)}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center sm:col-span-1">
                    <div className="text-slate-500 mb-1">Creado</div>
                    <div className="font-medium">{formatDate(user.fechaCreacion)}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center sm:col-span-1">
                    <div className="text-slate-500 mb-1">Actualizado</div>
                    <div className="font-medium">{formatDate(user.fechaActualizacion)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="flex flex-col gap-6 w-80">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

              <h3 className="text-xl font-semibold text-slate-800 mb-4">Foto de Perfil</h3>
              <div className="space-y-4">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                <button
                  onClick={() => document.getElementById('photo-upload').click()}
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
                >
                  Cambiar foto
                </button>

                {photo && (
                  <div className="space-y-3">
                    <button
                      onClick={handleUpdatePhoto}
                      disabled={isUpdating}
                      className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? 'Actualizando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={handleDeletePhoto}
                      disabled={isUpdating}
                      className="w-full px-6 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors border border-red-200 hover:border-red-300 disabled:opacity-50"
                    >
                      Cancelar selección
                    </button>
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Información de Perfil</h3>
              <button
                onClick={() => navigate("/editarperfil")}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {mensaje}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Perfil;