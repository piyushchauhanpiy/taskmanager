import axios from 'axios';
import appConfig from '../config/appConfig';

export const api = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export const projectAPI = {
  getMyProjects: () => api.get('/project/my-projects'),
  getAdminProjects: () => api.get('/project/admin-projects'),
  createProject: (projectData) => api.post('/project/create', projectData),
  addMember: (memberData) => api.post('/project/add-member', memberData),
};

export const taskAPI = {
  getMyTasks: () => api.get('/task/my-tasks'),
  getTasksByProject: (projectId) => api.get(`/task/project/${projectId}`),
  createTask: (taskData) => api.post('/task/create', taskData),
  updateStatus: (statusData) => api.put('/task/update-status', statusData),
  getTasksCreatedByMe: () => api.get('/task/created-by-me'),
};

export const userAPI = {
  getUserById: (userId) => api.get(`/user/${userId}`),
  getUsersByIds: (userIds) => api.get('/user/batch', { params: { userIds } }),
  getCurrentUser: () => api.get('/user/me'),
};

export default api;
