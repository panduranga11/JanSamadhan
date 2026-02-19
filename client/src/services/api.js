const API_BASE_URL = 'http://localhost:5000/api'; // Mock URL

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

export const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
       method: 'GET',
       headers: headers()
    });
    return handleResponse(response);
  },
  post: async (url, body) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  put: async (url, body) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: headers()
    });
    return handleResponse(response);
  }
};
