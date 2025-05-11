
const BASE_URL = 'http://localhost:5000/api';

// User API
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);
  return response.json();
};

export const getUserById = async (id) => {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  return response.json();
};

export const createUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const updateUserPassword = async (id, passwordData) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData),
  });
  return response.json();
};

// Leave API
// Fetch leave requests for a specific user
export const getLeaves = async () => {
  const response = await fetch(`${BASE_URL}/leaves`);
  return response.json();
};

export const getLeavesByUsername = async (username) => {
  const response = await fetch(`${BASE_URL}/leaves?username=${username}`);
  return response.json();
};

export const createLeave = async (leaveData) => {
  const response = await fetch(`${BASE_URL}/leaves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData),
  });
  return response.json();
};

export const updateLeave = async (id, leaveData) => {
  const response = await fetch(`${BASE_URL}/leaves/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData),
  });
  return response.json();
};

export const deleteLeave = async (id) => {
  const response = await fetch(`${BASE_URL}/leaves/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const withdrawLeave = async (id) => {
  const response = await fetch(`${BASE_URL}/leaves/withdraw/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to withdraw leave');
  }

  return response.json();
};

// Admin API
// Admin API
export const getAdmin = async (username, password) => {
  const response = await fetch(`${BASE_URL}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('Backend error:', errorData);
    throw new Error(errorData.error || 'Failed to authenticate admin');
  }

  return response.json();
};

export const updateAdminPassword = async (passwordData) => {
  const response = await fetch(`${BASE_URL}/admin`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw new Error('Failed to update admin password');
  }

  return response.json();
};