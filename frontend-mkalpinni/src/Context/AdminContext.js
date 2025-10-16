import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaHome, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaPlus, FaSearch, FaTh, FaList, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTag, FaEdit, FaTrash, FaEye, FaCheck, FaMoneyBillWave, FaTimes, FaDownload, FaSave, FaUser, FaRuler, FaSun, FaCalendarAlt as FaCalendar } from "react-icons/fa";
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  propertyService, 
  clientService, 
  reservationService, 
  statsService 
} from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de AdminProvider');
  }
  return context;
};

const initialState = {
  properties: [],
  clients: [],
  reservations: [],
  payments: [],
  contacts: [],
  stats: {
    propiedadesDisponibles: 0,
    propiedadesOcupadas: 0,
    propietarios: 0,
    inquilinos: 0,
    contratosActivos: 0,
    pagosPendientes: 0,
    ingresosMensuales: 0
  },
  
  loading: {
    properties: false,
    clients: false,
    reservations: false,
    payments: false,
    contacts: false,
    stats: false,
  },
  
  errors: {
    properties: null,
    clients: null,
    reservations: null,
    payments: null,
    contacts: null,
    stats: null,
  },
  
  notifications: [],
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  
  SET_PROPERTIES: 'SET_PROPERTIES',
  ADD_PROPERTY: 'ADD_PROPERTY',
  UPDATE_PROPERTY: 'UPDATE_PROPERTY',
  DELETE_PROPERTY: 'DELETE_PROPERTY',
  
  SET_CLIENTS: 'SET_CLIENTS',
  ADD_CLIENT: 'ADD_CLIENT',
  UPDATE_CLIENT: 'UPDATE_CLIENT',
  DELETE_CLIENT: 'DELETE_CLIENT',
  
  SET_RESERVATIONS: 'SET_RESERVATIONS',
  ADD_RESERVATION: 'ADD_RESERVATION',
  UPDATE_RESERVATION: 'UPDATE_RESERVATION',
  DELETE_RESERVATION: 'DELETE_RESERVATION',
  
  SET_PAYMENTS: 'SET_PAYMENTS',
  ADD_PAYMENT: 'ADD_PAYMENT',
  UPDATE_PAYMENT: 'UPDATE_PAYMENT',
  DELETE_PAYMENT: 'DELETE_PAYMENT',
  
  SET_CONTACTS: 'SET_CONTACTS',
  ADD_CONTACT: 'ADD_CONTACT',
  DELETE_CONTACT: 'DELETE_CONTACT',
  
  SET_STATS: 'SET_STATS',
  
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

const adminReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.value }
      };
      
    case ACTIONS.SET_PROPERTIES:
      return { ...state, properties: action.payload };
    case ACTIONS.ADD_PROPERTY:
      return { ...state, properties: [...state.properties, action.payload] };
    case ACTIONS.UPDATE_PROPERTY:
      return {
        ...state,
        properties: state.properties.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case ACTIONS.DELETE_PROPERTY:
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload)
      };
      
    case ACTIONS.SET_CLIENTS:
      return { ...state, clients: action.payload };
    case ACTIONS.ADD_CLIENT:
      return { ...state, clients: [...state.clients, action.payload] };
    case ACTIONS.UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    case ACTIONS.DELETE_CLIENT:
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.payload)
      };
      
    case ACTIONS.SET_RESERVATIONS:
      return { ...state, reservations: action.payload };
    case ACTIONS.ADD_RESERVATION:
      return { ...state, reservations: [...state.reservations, action.payload] };
    case ACTIONS.UPDATE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.map(r => 
          r.id === action.payload.id ? action.payload : r
        )
      };
    case ACTIONS.DELETE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.filter(r => r.id !== action.payload)
      };
      
    case ACTIONS.SET_PAYMENTS:
      return { ...state, payments: action.payload };
    case ACTIONS.ADD_PAYMENT:
      return { ...state, payments: [...state.payments, action.payload] };
    case ACTIONS.UPDATE_PAYMENT:
      return {
        ...state,
        payments: state.payments.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case ACTIONS.DELETE_PAYMENT:
      return {
        ...state,
        payments: state.payments.filter(p => p.id !== action.payload)
      };
      
    case ACTIONS.SET_CONTACTS:
      return { ...state, contacts: action.payload };
    case ACTIONS.ADD_CONTACT:
      return { ...state, contacts: [...state.contacts, action.payload] };
    case ACTIONS.DELETE_CONTACT:
      return {
        ...state,
        contacts: state.contacts.filter(c => c.id !== action.payload)
      };
      
    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };
      
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    default:
      return state;
  }
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const handleError = useCallback((key, error) => {
    dispatch({ type: ACTIONS.SET_ERROR, key, value: error.message });
    dispatch({ type: ACTIONS.SET_LOADING, key, value: false });
    addNotification('error', `Error: ${error.message}`);
  }, [addNotification]);

  const addNotification = useCallback((type, message) => {
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: { type, message }
    });
    setTimeout(() => {
      dispatch({
        type: ACTIONS.REMOVE_NOTIFICATION,
        payload: Date.now()
      });
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const fetchProperties = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, key: 'properties', value: true });
    try {
      const response = await propertyService.getAll();
      dispatch({ type: ACTIONS.SET_PROPERTIES, payload: response.value || response });
      dispatch({ type: ACTIONS.SET_ERROR, key: 'properties', value: null });
    } catch (error) {
      handleError('properties', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, key: 'properties', value: false });
    }
  }, [handleError]);

  const createProperty = useCallback(async (propertyData) => {
    try {
      const response = await propertyService.create(propertyData);
      const newProperty = response.value || response;
      dispatch({ type: ACTIONS.ADD_PROPERTY, payload: newProperty });
      addNotification('success', 'Propiedad creada exitosamente');
      return newProperty;
    } catch (error) {
      handleError('properties', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const updateProperty = useCallback(async (id, propertyData) => {
    try {
      const response = await propertyService.update(id, propertyData);
      const updatedProperty = response.value || response;
      dispatch({ type: ACTIONS.UPDATE_PROPERTY, payload: updatedProperty });
      addNotification('success', 'Propiedad actualizada exitosamente');
      return updatedProperty;
    } catch (error) {
      handleError('properties', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const deleteProperty = useCallback(async (id) => {
    try {
      await propertyService.delete(id);
      dispatch({ type: ACTIONS.DELETE_PROPERTY, payload: id });
      addNotification('success', 'Propiedad eliminada exitosamente');
    } catch (error) {
      handleError('properties', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const fetchClients = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, key: 'clients', value: true });
    try {
      const response = await clientService.getAll();
      dispatch({ type: ACTIONS.SET_CLIENTS, payload: response.value || response });
      dispatch({ type: ACTIONS.SET_ERROR, key: 'clients', value: null });
    } catch (error) {
      handleError('clients', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, key: 'clients', value: false });
    }
  }, [handleError]);

  const createClient = useCallback(async (clientData) => {
    try {
      const response = await clientService.create(clientData);
      const newClient = response.value || response;
      dispatch({ type: ACTIONS.ADD_CLIENT, payload: newClient });
      addNotification('success', 'Cliente creado exitosamente');
      return newClient;
    } catch (error) {
      handleError('clients', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const updateClient = useCallback(async (id, clientData) => {
    try {
      const response = await clientService.update(id, clientData);
      const updatedClient = response.value || response;
      dispatch({ type: ACTIONS.UPDATE_CLIENT, payload: updatedClient });
      addNotification('success', 'Cliente actualizado exitosamente');
      return updatedClient;
    } catch (error) {
      handleError('clients', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const deleteClient = useCallback(async (id) => {
    try {
      await clientService.delete(id);
      dispatch({ type: ACTIONS.DELETE_CLIENT, payload: id });
      addNotification('success', 'Cliente eliminado exitosamente');
    } catch (error) {
      handleError('clients', error);
      throw error;
    }
  }, [handleError, addNotification]);

  const fetchPayments = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, key: 'payments', value: true });
    try {
      dispatch({ type: ACTIONS.SET_PAYMENTS, payload: [] });
      dispatch({ type: ACTIONS.SET_ERROR, key: 'payments', value: null });
    } catch (error) {
      handleError('payments', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, key: 'payments', value: false });
    }
  }, [handleError]);

  const fetchReservations = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, key: 'reservations', value: true });
    try {
      const response = await reservationService.getAll();
      dispatch({ type: ACTIONS.SET_RESERVATIONS, payload: response.value || response });
      dispatch({ type: ACTIONS.SET_ERROR, key: 'reservations', value: null });
    } catch (error) {
      handleError('reservations', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, key: 'reservations', value: false });
    }
  }, [handleError]);

  const fetchStats = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, key: 'stats', value: true });
    try {
      const response = await statsService.getDashboardStats();
      dispatch({ type: ACTIONS.SET_STATS, payload: response.value || response });
      dispatch({ type: ACTIONS.SET_ERROR, key: 'stats', value: null });
    } catch (error) {
      handleError('stats', error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, key: 'stats', value: false });
    }
  }, [handleError]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      fetchProperties(),
      fetchClients(),
      fetchPayments(),
      fetchReservations(),
    ]);
    await fetchStats();
  }, [fetchProperties, fetchClients, fetchPayments, fetchReservations, fetchStats]);

  const value = {
    ...state,
    
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    
    fetchPayments,
    
    fetchReservations,
    
    fetchStats,
    
    loadAllData,
    addNotification,
    removeNotification,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
