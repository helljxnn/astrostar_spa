// API service for roles management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class RolesService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/roles`;
  }

  // Helper method for making API requests
  async makeRequest(endpoint = '', options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Get all roles with pagination and search
  async getAllRoles(params = {}) {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });

    return this.makeRequest(`?${queryParams}`);
  }

  // Get role by ID
  async getRoleById(id) {
    return this.makeRequest(`/${id}`);
  }

  // Create new role
  async createRole(roleData) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  }

  // Update role
  async updateRole(id, roleData) {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  }

  // Delete role
  async deleteRole(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE'
    });
  }

  // Check if role name is available
  async checkRoleNameAvailability(name, excludeId = null) {
    const queryParams = new URLSearchParams({
      name: name.toString()
    });
    
    if (excludeId) {
      queryParams.append('excludeId', excludeId.toString());
    }

    const url = `/check-name?${queryParams}`;
    console.log('🌐 Making request to:', `${this.baseURL}${url}`);
    
    const response = await this.makeRequest(url);
    console.log('📨 Service response:', response);
    
    return response;
  }
}

export default new RolesService();