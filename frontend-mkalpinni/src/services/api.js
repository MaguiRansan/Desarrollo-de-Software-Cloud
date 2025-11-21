import { API_BASE_URL } from '../config/apiConfig';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(url, options = {}) {
    const token = sessionStorage.getItem('authToken');

    const config = {
      headers: {
        ...(options.headers || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      ...options,
    };

    if (config.body && !(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';

      if (typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
      }
    }
    
    try {
      const response = await fetch(`${this.baseURL}${url}`, config);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error Details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  }

  get(url, options = {}) {
    return this.request(url, { method: 'GET', ...options });
  }

  post(url, data, options = {}) {
    return this.request(url, { method: 'POST', body: data, ...options });
  }

  put(url, data, options = {}) {
    return this.request(url, { method: 'PUT', body: data, ...options });
  }

  delete(url, options = {}) {
    return this.request(url, { method: 'DELETE', ...options });
  }
}

export const api = new ApiService();

const mapPropertyData = (prop) => ({
  _id: prop._id,
  id: prop._id,
  idPropiedad: prop._id,
  
  titulo: prop.titulo,
  title: prop.titulo,
  descripcion: prop.descripcion,
  description: prop.descripcion,
  
  direccion: prop.direccion,
  address: prop.direccion,
  barrio: prop.barrio,
  neighborhood: prop.barrio,
  localidad: prop.localidad,
  locality: prop.localidad,
  provincia: prop.provincia,
  province: prop.provincia,
  ubicacion: prop.ubicacion,
  
  latitud: prop.latitud,
  longitud: prop.longitud,
  coordenadas: {
    lat: prop.latitud || -34.603,
    lng: prop.longitud || -58.381
  },
  
  tipoPropiedad: prop.tipoPropiedad,
  tipo: prop.tipoPropiedad,
  type: prop.tipoPropiedad,
  transaccionTipo: prop.transaccionTipo,
  operationType: prop.transaccionTipo?.toLowerCase(),
  
  precio: prop.precio,
  price: prop.precio,
  currency: 'USD',
  
  habitaciones: prop.habitaciones,
  bedrooms: prop.habitaciones,
  banos: prop.banos,
  bathrooms: prop.banos,
  superficieM2: prop.superficieM2,
  superficie: prop.superficieM2,
  squareMeters: prop.superficieM2,
  terrenoM2: prop.terrenoM2,
  landSquare: prop.terrenoM2,
  landSquareMeters: prop.terrenoM2,

  estado: prop.estado,
  status: prop.estado?.toLowerCase(),
  disponible: prop.estado === 'Disponible',
  
  locador: prop.locador,
  lessor: prop.locador,
  locatario: prop.locatario,
  lessee: prop.locatario,
  propietario: prop.propietario,
  owner: prop.propietario,

  imagenes: prop.imagenes || [],
  images: prop.imagenes || [],
  
  fechaCreacion: prop.fechaCreacion,
  
  esAlquilerTemporario: prop.esAlquilerTemporario,
  precioPorNoche: prop.precioPorNoche,
  precioPorSemana: prop.precioPorSemana,
  precioPorMes: prop.precioPorMes,
  capacidadPersonas: prop.capacidadPersonas,
  capacidadHuespedes: prop.capacidadPersonas,
  servicios: prop.servicios || [],
  services: prop.servicios || [],
  reglasPropiedad: prop.reglasPropiedad || [],
  horarioCheckIn: prop.horarioCheckIn,
  
  favorito: prop.favorito || false,
  
  features: prop.servicios || [],
  allowsPets: prop.permitemascotas || false,
  parkingSpots: prop.estacionamientos || 0
});

export const propertyService = {
  getAll: async () => {
    const response = await api.get('/Propiedad/Buscar');
    if (response.status && response.value) {
      response.value = response.value.map(mapPropertyData);
    }
    return response;
  },
  
  getById: async (id) => {
    const response = await api.get(`/Propiedad/Obtener/${id}`);
    if (response.status && response.value) {
      response.value = mapPropertyData(response.value);
    }
    return response;
  },
  
  search: async (filters) => {
    const queryParams = new URLSearchParams();
    
    if (filters.transaccionTipo) queryParams.append('transaccionTipo', filters.transaccionTipo);
    if (filters.tipoPropiedad) queryParams.append('tipoPropiedad', filters.tipoPropiedad);
    if (filters.barrio) queryParams.append('barrio', filters.barrio);
    if (filters.ubicacion) queryParams.append('ubicacion', filters.ubicacion);
    if (filters.precioMin) queryParams.append('precioMin', filters.precioMin);
    if (filters.precioMax) queryParams.append('precioMax', filters.precioMax);
    if (filters.habitacionesMin) queryParams.append('habitacionesMin', filters.habitacionesMin);
    if (filters.banosMin) queryParams.append('banosMin', filters.banosMin);
    if (filters.superficieMin) queryParams.append('superficieMin', filters.superficieMin);
    if (filters.superficieMax) queryParams.append('superficieMax', filters.superficieMax);
    if (filters.estado) queryParams.append('estado', filters.estado);
    if (filters.esAlquilerTemporario !== undefined) queryParams.append('esAlquilerTemporario', filters.esAlquilerTemporario);
    
    const response = await api.get(`/Propiedad/Buscar?${queryParams.toString()}`);
    if (response.status && response.value) {
      response.value = response.value.map(mapPropertyData);
    }
    return response;
  },
  
  create: (property) => api.post('/Propiedad/Crear', property),
  
  update: (id, property) => api.put(`/Propiedad/Actualizar/${id}`, property),
  
  delete: (id) => api.delete(`/Propiedad/Eliminar/${id}`),
  
  getByType: async (type) => {
    return await propertyService.search({ transaccionTipo: type });
  },
  
  getForSale: async () => {
    return await propertyService.search({ transaccionTipo: 'Venta' });
  },
  
  getForRent: async () => {
    return await propertyService.search({ transaccionTipo: 'Alquiler' });
  },
  
  getForTemporaryRent: async () => {
    return await propertyService.search({ 
      transaccionTipo: 'Alquiler',
      esAlquilerTemporario: true 
    });
  },

  uploadImages: async (id, files = []) => {
    if (!id) throw new Error('Property id is required for image upload');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('imagenes', file);
    });

    return await api.post(`/Propiedad/SubirImagenes/${id}`, formData);
  },

  deleteImage: async (propertyId, imageId) => {
    if (!propertyId || !imageId) {
      throw new Error('Property id and image id are required to delete an image');
    }
    return await api.delete(`/Propiedad/EliminarImagen/${propertyId}/${imageId}`);
  },

  createWithImages: async (propertyData, imageFiles = []) => {
    const createResp = await api.post('/Propiedad/Crear', propertyData);
    if (createResp.status && createResp.value && imageFiles.length > 0) {
      const propId = createResp.value._id || createResp.value.id;
      if (propId) {
        await api.post(`/Propiedad/SubirImagenes/${propId}`, (() => {
          const fd = new FormData();
          imageFiles.forEach(f => fd.append('imagenes', f));
          return fd;
        })());
      }
    }
    return createResp;
  }
};

export const reservationService = {
  getAll: () => api.get('/Reserva/Obtener'),
  getById: (id) => api.get(`/Reserva/Obtener/${id}`),
  create: (reservation) => api.post('/Reserva/Crear', reservation),
  update: (id, reservation) => api.put(`/Reserva/Actualizar/${id}`, reservation),
  delete: (id) => api.delete(`/Reserva/Eliminar/${id}`),
  getByProperty: (propertyId) => api.get(`/Reserva/Obtener/Propiedad/${propertyId}`),
};

export const contactService = {
  getAll: () => api.get('/Contacto/Obtener'),
  getById: (id) => api.get(`/Contacto/Obtener/${id}`),
  create: (contact) => api.post('/Contacto/Crear', contact),
  update: (id, contact) => api.put(`/Contacto/Actualizar/${id}`, contact),
  delete: (id) => api.delete(`/Contacto/Eliminar/${id}`),
};

export const tasacionService = {
  getAll: () => api.get('/Tasacion/Obtener'),
  getById: (id) => api.get(`/Tasacion/Obtener/${id}`),
  create: (tasacion) => api.post('/Tasacion/Crear', tasacion),
  delete: (id) => api.delete(`/Tasacion/Eliminar/${id}`),
};

export const statsService = {
  getDashboardStats: async () => {
    try {
      const propertiesResponse = await propertyService.getAll();

      const properties = propertiesResponse.value || [];

      return {
        status: true,
        value: {
          totalPropiedades: properties.length,
          propiedadesDisponibles: properties.filter(p => p.estado === 'Disponible' || p.disponible).length,
          propiedadesOcupadas: properties.filter(p => p.estado === 'Ocupado' || !p.disponible).length,
          propiedadesPorVenta: properties.filter(p => p.transaccionTipo === 'Venta').length,
          propiedadesPorAlquiler: properties.filter(p => p.transaccionTipo === 'Alquiler').length,
          propiedadesTemporario: properties.filter(p => p.esAlquilerTemporario).length,
          
          tasaOcupacion: properties.length > 0 ? 
            Math.round((properties.filter(p => p.estado === 'Ocupado' || !p.disponible).length / properties.length) * 100) : 0,
          
          ingresosMensuales: 0,
          contratosActivos: 0,
          pagosPendientes: 0
        }
      };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      throw error;
    }
  }
};