const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Keep the status message when the response has no JSON body.
    }

    throw new Error(message);
  }

  return response.json();
}
