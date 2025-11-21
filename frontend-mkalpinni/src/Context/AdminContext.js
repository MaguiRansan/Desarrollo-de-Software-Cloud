import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  propertyService, 
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
  reservations: [],
  stats: {
    propiedadesDisponibles: 0,
    propiedadesOcupadas: 0,
    contratosActivos: 0,
    ingresosMensuales: 0
  },
  
  loading: {
    properties: false,
    reservations: false,
    stats: false,
  },
  
  errors: {
    properties: null,
    reservations: null,
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
  
  SET_RESERVATIONS: 'SET_RESERVATIONS',
  ADD_RESERVATION: 'ADD_RESERVATION',
  UPDATE_RESERVATION: 'UPDATE_RESERVATION',
  DELETE_RESERVATION: 'DELETE_RESERVATION',
  
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

  const handleError = useCallback((key, error) => {
    dispatch({ type: ACTIONS.SET_ERROR, key, value: error.message });
    dispatch({ type: ACTIONS.SET_LOADING, key, value: false });
    addNotification('error', `Error: ${error.message}`);
  }, [addNotification]);

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
      fetchReservations(),
    ]);
    await fetchStats();
  }, [fetchProperties, fetchReservations, fetchStats]);

  const value = {
    ...state,
    
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    
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
