import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add request interceptor for file uploads
api.interceptors.request.use(
  (config) => {
    // For FormData, let axios set Content-Type automatically with boundary
    if (config.data instanceof FormData) {
      console.log('=== API Interceptor: FormData detected ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers["Content-Type"];
      console.log('Content-Type header removed, browser will set multipart/form-data with boundary');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.error('=== API Error ===');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    return Promise.reject(error);
  }
);

export default api;