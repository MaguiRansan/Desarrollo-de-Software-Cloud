import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import { propertyService, clientService, contactService, tasacionService } from './api';

class UnifiedDataService {
  constructor() {
    this.cache = {
      properties: null,
      clients: null,
      contacts: null,
      lastUpdate: null
    };
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  isCacheValid() {
    return this.cache.lastUpdate && 
           (Date.now() - this.cache.lastUpdate) < this.cacheTimeout;
  }

  
  async getAllProperties() {
    if (this.isCacheValid() && this.cache.properties) {
      return { status: true, value: this.cache.properties };
    }

    try {
      const response = await propertyService.getAll();
      if (response.status && response.value) {
        this.cache.properties = response.value;
        this.cache.lastUpdate = Date.now();
      }
      return response;
    } catch (error) {
      console.error('Error obteniendo propiedades:', error);
      throw error;
    }
  }

  async searchProperties(filters = {}) {
    try {
      return await propertyService.search(filters);
    } catch (error) {
      console.error('Error buscando propiedades:', error);
      throw error;
    }
  }

  async getPropertyById(id) {
    try {
      return await propertyService.getById(id);
    } catch (error) {
      console.error(`Error obteniendo propiedad ${id}:`, error);
      throw error;
    }
  }

  async getPropertiesForSale() {
    return this.searchProperties({ transaccionTipo: 'Venta' });
  }

  async getPropertiesForRent() {
    return this.searchProperties({ transaccionTipo: 'Alquiler' });
  }

  async getPropertiesForTemporaryRent() {
    return this.searchProperties({ 
      transaccionTipo: 'Alquiler',
      esAlquilerTemporario: true 
    });
  }

  
  async getAllClients() {
    try {
      return await clientService.getAll();
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  async searchClients(filters = {}) {
    try {
      return await clientService.search(filters);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await clientService.create(clientData);
      this.cache.clients = null;
      return response;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }

  
  async createContact(contactData) {
    try {
      return await contactService.create(contactData);
    } catch (error) {
      console.error('Error creando contacto:', error);
      throw error;
    }
  }

  async getAllContacts() {
    try {
      return await contactService.getAll();
    } catch (error) {
      console.error('Error obteniendo contactos:', error);
      throw error;
    }
  }

  
  async createTasacion(tasacionData) {
    try {
      return await tasacionService.create(tasacionData);
    } catch (error) {
      console.error('Error creando tasación:', error);
      throw error;
    }
  }

  
  invalidateCache() {
    this.cache = {
      properties: null,
      clients: null,
      contacts: null,
      lastUpdate: null
    };
  }

  getQuickStats() {
    if (!this.cache.properties) {
      return null;
    }

    const properties = this.cache.properties;
    return {
      totalProperties: properties.length,
      availableProperties: properties.filter(p => p.estado === 'Disponible').length,
      propertiesForSale: properties.filter(p => p.transaccionTipo === 'Venta').length,
      propertiesForRent: properties.filter(p => p.transaccionTipo === 'Alquiler').length,
      temporaryRentProperties: properties.filter(p => p.esAlquilerTemporario).length
    };
  }
}

export const unifiedDataService = new UnifiedDataService();

export const usePublicProperties = () => {
  return {
    getAllProperties: () => unifiedDataService.getAllProperties(),
    searchProperties: (filters) => unifiedDataService.searchProperties(filters),
    getPropertyById: (id) => unifiedDataService.getPropertyById(id),
    getPropertiesForSale: () => unifiedDataService.getPropertiesForSale(),
    getPropertiesForRent: () => unifiedDataService.getPropertiesForRent(),
    getPropertiesForTemporaryRent: () => unifiedDataService.getPropertiesForTemporaryRent()
  };
};

export const usePublicContacts = () => {
  return {
    createContact: (contactData) => unifiedDataService.createContact(contactData),
    createTasacion: (tasacionData) => unifiedDataService.createTasacion(tasacionData)
  };
};

export default unifiedDataService;
