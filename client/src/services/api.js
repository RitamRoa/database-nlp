const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async processQuery(query, userId) {
    return this.request('/query', {
      method: 'POST',
      body: JSON.stringify({ query, userId }),
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async getClientsForUser(userId) {
    return this.request(`/clients/${userId}`);
  }

  async testGemini() {
    return this.request('/test-gemini');
  }

  async checkHealth() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export default apiService;
