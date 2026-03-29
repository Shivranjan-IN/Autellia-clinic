export const getApiBaseUrl = (): string => {
  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl) {
    // Normalize: remove trailing /api if present
    return viteUrl.replace(/\/api\/?$/, '');
  }
  return import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://autellia-clinic.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

