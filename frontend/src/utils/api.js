import axios from 'axios';

// Correct for React (CRA)
const BASE_URL =
  process.env.REACT_APP_API_URL || 'https://team-task-manger-dm9c.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  signup: (data) => API.post('api/auth/signup', data),
  login: (data) => API.post('api/auth/login', data),
  getMe: () => API.get('api/auth/me'),
};

// --- Users ---
export const userAPI = {
  getAll: () => API.get('api/users'),
  getById: (id) => API.get(`api/users/${id}`),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  delete: (id) => API.delete(`/users/${id}`),
};

// --- Projects ---
export const projectAPI = {
  create: (data) => API.post('api/projects', data),
  getAll: () => API.get('api/projects'),
  getById: (id) => API.get(`api/projects/${id}`),
  update: (id, data) => API.put(`api/projects/${id}`, data),
  delete: (id) => API.delete(`api/projects/${id}`),
};

// --- Tasks ---
export const taskAPI = {
  create: (data) => API.post('api/tasks', data),
  getAll: (params) => API.get('api/tasks', { params }),
  getById: (id) => API.get(`api/tasks/${id}`),
  update: (id, data) => API.put(`api/tasks/${id}`, data),
  delete: (id) => API.delete(`api/tasks/${id}`),
};

// --- Dashboard ---
export const dashboardAPI = {
  getStats: () => API.get('api/dashboard'),
};

export default API;
