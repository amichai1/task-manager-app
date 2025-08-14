//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//const API_BASE_URL = 'http://localhost:5000/api';
console.log('🔥 STARTING TO LOAD API.JS');
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// הוסף בדיקת דיבוג
console.log('Environment variables:', process.env);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);

class ApiService {
    //constructor() {
     //   this.token = JSON.parse(localStorage.getItem('taskManagerUser'))?.token || null;
    //}
    constructor() {
        // בדיקה בטוחה אם localStorage זמין
        this.token = null;
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const userData = localStorage.getItem('taskManagerUser');
                this.token = userData ? JSON.parse(userData)?.token || null : null;
            } catch (error) {
                console.warn('Failed to parse user data from localStorage:', error);
                this.token = null;
            }
        }
    }
    // Set authentication token
    setToken(token) {
        this.token = token;
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('taskManagerUser');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async register(userData) {
        const response = await this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        if (response.success) {
            this.setToken(response.data.token);
            localStorage.setItem('taskManagerUser', JSON.stringify(response.data));
        }
        
        return response;
    }

    async login(credentials) {
        const response = await this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        
        if (response.success) {
            this.setToken(response.data.token);
            localStorage.setItem('taskManagerUser', JSON.stringify(response.data));
        }
        
        return response;
    }

    async getUserProfile() {
        return await this.request('/users/profile');
    }

    // Task methods
    async getTasks(params = {}) {
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
        
        return await this.request(endpoint);
    }

    async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    async updateTask(taskId, updates) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    async getTaskStats() {
        return await this.request('/tasks/stats');
    }

    // Utility methods
    logout() {
        this.removeToken();
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('taskManagerUser');
        return userStr ? JSON.parse(userStr) : null;
    }
}
console.log('✅ API.JS LOADED SUCCESSFULLY');
// Create singleton instance
const apiService = new ApiService();
export default apiService;
