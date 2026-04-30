import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Projects
export const getProjects = () => api.get('/api/projects');
export const createProject = (data) => api.post('/api/projects', data);
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
export const addMember = (projectId, userId) => api.post(`/api/projects/${projectId}/members/${userId}`);

// Tasks
export const getAllTasks = () => api.get('/api/tasks');
export const getMyTasks = () => api.get('/api/tasks/my');
export const getOverdueTasks = () => api.get('/api/tasks/overdue');
export const getTasksByProject = (projectId) => api.get(`/api/tasks/project/${projectId}`);
export const createTask = (data) => api.post('/api/tasks', data);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.patch(`/api/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

// Users
export const getMe = () => api.get('/api/users/me');
export const getAllUsers = () => api.get('/api/users');
