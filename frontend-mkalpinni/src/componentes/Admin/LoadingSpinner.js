import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const PageLoader = ({ message = "Cargando..." }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

export const CardLoader = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
    <div className="text-red-600 text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

export const useAsyncState = (initialData = null) => {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Ha ocurrido un error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return { data, loading, error, execute, reset };
};

export default LoadingSpinner;