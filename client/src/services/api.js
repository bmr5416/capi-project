const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new ApiError('Network error: Unable to connect to server', 0);
  }

  // Check response status before parsing JSON
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }

  // Parse successful response
  try {
    return await response.json();
  } catch {
    throw new ApiError('Invalid response from server', response.status);
  }
}

// Client API
export const clientsApi = {
  list: () => request('/clients'),
  get: (id) => request(`/clients/${id}`),
  create: (data) => request('/clients', { method: 'POST', body: data }),
  update: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  addPlatform: (clientId, platform) =>
    request(`/clients/${clientId}/platforms`, { method: 'POST', body: { platform } }),
  removePlatform: (clientId, platform) =>
    request(`/clients/${clientId}/platforms/${platform}`, { method: 'DELETE' }),
};

// Progress API
export const progressApi = {
  getAll: (clientId) => request(`/progress/${clientId}`),
  getPlatform: (clientId, platform) => request(`/progress/${clientId}/${platform}`),
  completeStep: (clientId, platform, stepId, completedBy) =>
    request(`/progress/${clientId}/${platform}/${stepId}`, {
      method: 'POST',
      body: { completedBy },
    }),
  uncompleteStep: (clientId, platform, stepId) =>
    request(`/progress/${clientId}/${platform}/${stepId}`, { method: 'DELETE' }),
  getItemProgress: (clientId, platform, stepId) =>
    request(`/progress/${clientId}/${platform}/${stepId}/items`),
  completeItem: (clientId, platform, stepId, itemIndex, completedBy) =>
    request(`/progress/${clientId}/${platform}/${stepId}/items/${itemIndex}`, {
      method: 'POST',
      body: { completedBy },
    }),
  uncompleteItem: (clientId, platform, stepId, itemIndex) =>
    request(`/progress/${clientId}/${platform}/${stepId}/items/${itemIndex}`, {
      method: 'DELETE',
    }),
};

// Docs API
export const docsApi = {
  getStructure: () => request('/docs'),
  getDoc: (category, slug) => request(`/docs/${category}/${slug}`),
  getPlatformDoc: (platform, slug) => request(`/docs/platforms/${platform}/${slug}`),
  getChecklistContent: (stepId) => request(`/docs/content/${stepId}`),
};

// Notes API
export const notesApi = {
  get: (clientId, platform, stepId, itemIndex) => {
    const query =
      itemIndex !== undefined && itemIndex !== null ? `?itemIndex=${itemIndex}` : '';
    return request(`/notes/${clientId}/${platform}/${stepId}${query}`);
  },
  save: (clientId, platform, stepId, note, itemIndex, updatedBy) =>
    request(`/notes/${clientId}/${platform}/${stepId}`, {
      method: 'POST',
      body: { note, itemIndex, updatedBy },
    }),
  delete: (clientId, platform, stepId, itemIndex) => {
    const query =
      itemIndex !== undefined && itemIndex !== null ? `?itemIndex=${itemIndex}` : '';
    return request(`/notes/${clientId}/${platform}/${stepId}${query}`, {
      method: 'DELETE',
    });
  },
};
