const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function authorizedRequest(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.details || errorBody.message || 'Request failed');
    error.status = response.status;
    // Per field messages from validation, e.g. { name: 'Add a name.' }
    error.fields = errorBody.errors || null;
    throw error;
  }

  return response.json();
}

export { API_BASE_URL };
