import React, { useEffect } from 'react';
import { useAdmin } from '../Context/AdminContext';

export const useAdminData = (dataType = 'all', autoFetch = true) => {
  const {
    properties,
    reservations,
    stats,
    loading,
    errors,
    
    fetchProperties,
    fetchReservations,
    fetchStats,
    loadAllData,
  } = useAdmin();

  useEffect(() => {
    if (autoFetch) {
      switch (dataType) {
        case 'properties':
          fetchProperties();
          break;
        case 'reservations':
          fetchReservations();
          break;
        case 'stats':
          fetchStats();
          break;
        case 'all':
        default:
          loadAllData();
          break;
      }
    }
  }, [dataType, autoFetch, fetchProperties, fetchReservations, fetchStats, loadAllData]);

  const getPropertiesByType = (type) => {
    return properties.filter(p => p.operationType === type || p.tipo === type);
  };

  const getReservationsByProperty = (propertyId) => {
    return reservations.filter(r => r.propertyId === propertyId || r.propiedadId === propertyId);
  };

  const isLoading = loading[dataType] || false;
  const error = errors[dataType] || null;
  
  const hasData = () => {
    switch (dataType) {
      case 'properties':
        return properties.length > 0;
      case 'reservations':
        return reservations.length > 0;
      case 'all':
      default:
        return properties.length > 0;
    }
  };

  return {
    properties,
    reservations,
    stats,
    isLoading,
    error,
    hasData: hasData(),
    getPropertiesByType,
    getReservationsByProperty,
    refresh: {
      properties: fetchProperties,
      reservations: fetchReservations,
      stats: fetchStats,
      all: loadAllData,
    }
  };
};

export const useProperties = () => {
  const { 
    properties, 
    loading, 
    errors,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchProperties 
  } = useAdmin();

  return {
    properties,
    isLoading: loading.properties,
    error: errors.properties,
    createProperty,
    updateProperty,
    deleteProperty,
    refreshProperties: fetchProperties,
    
    availableProperties: properties.filter(p => p.disponible || p.status === 'disponible'),
    occupiedProperties: properties.filter(p => !p.disponible || p.status === 'ocupado'),
    propertiesForSale: properties.filter(p => p.operationType === 'venta'),
    propertiesForRent: properties.filter(p => p.operationType === 'alquiler'),
  };
};

export const useStats = () => {
  const { stats, loading, errors, fetchStats } = useAdmin();

  return {
    stats,
    isLoading: loading.stats,
    error: errors.stats,
    refreshStats: fetchStats,
  };
};