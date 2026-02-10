import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || 'An error occurred';

            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Forbidden:', message);
                    break;
                case 404:
                    console.error('Not found:', message);
                    break;
                case 422:
                    console.error('Validation error:', error.response.data.errors);
                    break;
                case 500:
                    console.error('Server error:', message);
                    break;
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error: No response from server');
            console.error('Check if backend is running on:', api.defaults.baseURL);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// API endpoints
export const dashboardAPI = {
    // Admin Dashboard
    getAdminStats: () => api.get('/dashboard/admin/stats'),
    getOnlineHistory: () => api.get('/dashboard/admin/online-history'),
    getRevenueHistory: (days = 30) => api.get(`/dashboard/admin/revenue-history?days=${days}`),
    
    // FUP Dashboard
    getFupDashboard: () => api.get('/dashboard/fup'),
    
    // COA Dashboard
    getCoaDashboard: () => api.get('/dashboard/coa'),
    
    // User Dashboard
    getUserDashboard: (userId) => api.get(`/dashboard/user/${userId}`),
    getUserBandwidthHistory: (userId) => api.get(`/dashboard/user/${userId}/bandwidth-history`),
    getUserUsage: (userId, timeframe = 'daily') => api.get(`/dashboard/user/${userId}/usage?timeframe=${timeframe}`),
    
    // Package Analytics
    getPackageAnalytics: () => api.get('/dashboard/packages/analytics'),
};

export const fupAPI = {
    getUserUsage: (userId) => api.get(`/fup/usage/${userId}`),
    checkUserFup: (userId) => api.post(`/fup/check/${userId}`),
    checkAllUsers: () => api.post('/fup/check-all'),
    resetMonthly: () => api.post('/fup/reset-monthly'),
    getDashboard: () => api.get('/fup/dashboard'),
};

export const coaAPI = {
    changeSpeed: (data) => api.post('/coa/change-speed', data),
    disconnect: (data) => api.post('/coa/disconnect', data),
    updateQuota: (data) => api.post('/coa/update-quota', data),
    applyFup: (data) => api.post('/coa/apply-fup', data),
};

export const usersAPI = {
    getList: () => api.get('/users/list'),
    getUser: (id) => api.get(`/users/${id}`),
};

export const packagesAPI = {
    getList: () => api.get('/packages/list'),
};

export default api;
