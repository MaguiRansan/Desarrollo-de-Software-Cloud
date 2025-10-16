// Handlers Service - Frontend integration with backend handlers configuration
import api from './services/api';

// Handler types and their descriptions
export const HANDLER_TYPES = {
  create_new_release: {
    name: 'Crear Nueva Release',
    description: 'Automatiza la creación de nuevas versiones del proyecto',
    category: 'Release Management'
  },
  mergeable: {
    name: 'Control de Merge',
    description: 'Valida si los PRs cumplen con las reglas de merge',
    category: 'Merge & Branch'
  },
  cleanup_release: {
    name: 'Limpieza de Releases',
    description: 'Limpia ramas de release después de la publicación',
    category: 'Release Management'
  },
  is_semantic: {
    name: 'Validación Semántica',
    description: 'Verifica que los commits siguen semantic versioning',
    category: 'Quality & Validation'
  },
  notify_and_clean_released: {
    name: 'Notificación y Limpieza',
    description: 'Notifica y limpia releases publicados',
    category: 'Release Management'
  },
  notify_merge_to_release: {
    name: 'Notificación de Merge',
    description: 'Notifica merges hacia ramas de release',
    category: 'Merge & Branch'
  },
  level_with_master: {
    name: 'Nivelar con Master',
    description: 'Mantiene ramas sincronizadas con master',
    category: 'Merge & Branch'
  },
  complete_new_pr: {
    name: 'Completar Nuevo PR',
    description: 'Completa la configuración de nuevos PRs',
    category: 'Quality & Validation'
  },
  completition_metrics: {
    name: 'Métricas de Completitud',
    description: 'Mide el progreso y completitud del proyecto',
    category: 'Monitoring & Metrics'
  },
  assigner: {
    name: 'Asignador',
    description: 'Asigna automáticamente tareas a miembros del equipo',
    category: 'Team Management'
  }
};

// Get handlers configuration from backend
export const getHandlersConfig = async () => {
  try {
    const response = await api.get('/config/handlers');
    return response.data;
  } catch (error) {
    console.error('Error fetching handlers config:', error);
    throw error;
  }
};

// Get active handlers only
export const getActiveHandlers = async () => {
  try {
    const config = await getHandlersConfig();
    return Object.entries(config.handlers)
      .filter(([_, handler]) => handler.active)
      .map(([key, handler]) => ({
        key,
        ...handler,
        ...HANDLER_TYPES[key]
      }));
  } catch (error) {
    console.error('Error fetching active handlers:', error);
    throw error;
  }
};

// Get handlers by category
export const getHandlersByCategory = async () => {
  try {
    const activeHandlers = await getActiveHandlers();
    return activeHandlers.reduce((acc, handler) => {
      if (!acc[handler.category]) {
        acc[handler.category] = [];
      }
      acc[handler.category].push(handler);
      return acc;
    }, {});
  } catch (error) {
    console.error('Error grouping handlers by category:', error);
    throw error;
  }
};

// Check if a specific handler is active
export const isHandlerActive = async (handlerKey) => {
  try {
    const activeHandlers = await getActiveHandlers();
    return activeHandlers.some(handler => handler.key === handlerKey);
  } catch (error) {
    console.error('Error checking handler status:', error);
    return false;
  }
};

// Get handler status for UI display
export const getHandlerStatusDisplay = (handler) => {
  return {
    status: handler.active ? 'Activo' : 'Inactivo',
    statusColor: handler.active ? 'success' : 'secondary',
    badge: handler.version ? `v${handler.version}` : 'Sin versión'
  };
};

// Export default object with all functions
const handlersService = {
  HANDLER_TYPES,
  getHandlersConfig,
  getActiveHandlers,
  getHandlersByCategory,
  isHandlerActive,
  getHandlerStatusDisplay
};

export default handlersService;
