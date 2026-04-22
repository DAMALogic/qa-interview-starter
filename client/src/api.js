// Thin API client — all calls go through Vite's proxy to the Express server

const BASE = '/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { 'x-auth-token': token } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = () =>
  request('/auth/logout', { method: 'POST' });

export const getMe = () => request('/auth/me');

// Tasks
export const getTasks = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/tasks${qs ? `?${qs}` : ''}`);
};

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: 'DELETE' });

// User Profile
export const getProfile = () => request('/users/profile');

export const updateProfile = (data) =>
  request('/users/profile', { method: 'PUT', body: JSON.stringify(data) });

export const updatePassword = (data) =>
  request('/users/profile/password', { method: 'PUT', body: JSON.stringify(data) });
