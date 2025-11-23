// API Configuration
// En desarrollo: usa localhost
// En producción: usa la variable de entorno REACT_APP_API_URL

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/API`
  : 'http://localhost:5228/API';

const API_STATIC_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:5228';

export { API_BASE_URL, API_STATIC_URL }