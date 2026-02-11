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

export const profileAPI = {
    getProfile: () => api.get('/profile/'),
    updateProfile: (data) => api.put('/profile/', data),
    uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updatePassword: (data) => api.put('/profile/password', data),
    updateNotifications: (data) => api.put('/profile/notifications', data),
};

export const usersAPI = {
    getList: (params) => api.get('/users/list', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    createUser: (data) => api.post('/users/create', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    changeStatus: (id, status) => api.post(`/users/${id}/status`, { status }),
    updatePassword: (id, password) => api.put(`/users/${id}/password`, { password }),
    getUserStats: (id) => api.get(`/users/${id}/stats`),
    getUserSessions: (id, params) => api.get(`/users/${id}/sessions`, { params }),
    getUserTransactions: (id, params) => api.get(`/users/${id}/transactions`, { params }),
    getAll: () => api.get('/users/all'),
};

export const packagesAPI = {
    getList: (params) => api.get('/packages/list', { params }),
    getPackage: (id) => api.get(`/packages/${id}`),
    createPackage: (data) => api.post('/packages/create', data),
    updatePackage: (id, data) => api.put(`/packages/${id}`, data),
    deletePackage: (id) => api.delete(`/packages/${id}`),
    toggleStatus: (id) => api.post(`/packages/${id}/toggle-status`),
    getPackageStats: (id) => api.get(`/packages/${id}/stats`),
    getAll: () => api.get('/packages/all'),
};

export const devicesAPI = {
    getList: (params) => api.get('/devices/list', { params }),
    getDevice: (id) => api.get(`/devices/${id}`),
    createDevice: (data) => api.post('/devices/create', data),
    updateDevice: (id, data) => api.put(`/devices/${id}`, data),
    deleteDevice: (id) => api.delete(`/devices/${id}`),
    testConnection: (id) => api.post(`/devices/${id}/test-connection`),
    getDeviceStats: (id) => api.get(`/devices/${id}/stats`),
    syncUsers: (id) => api.post(`/devices/${id}/sync-users`),
    toggleStatus: (id) => api.post(`/devices/${id}/toggle-status`),
    getAll: () => api.get('/devices/all'),
};

export const transactionsAPI = {
    getList: (params) => api.get('/transactions/list', { params }),
    getTransaction: (id) => api.get(`/transactions/${id}`),
    createTransaction: (data) => api.post('/transactions/create', data),
    updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
    getStats: (params) => api.get('/transactions/stats', { params }),
    getPaymentMethods: () => api.get('/transactions/payment-methods'),
    getUserTransactions: (userId, params) => api.get(`/transactions/user/${userId}`, { params }),
};

export const nasClientsAPI = {
    getList: (params) => api.get('/radius/nas-clients', { params }),
    getClient: (id) => api.get(`/radius/nas-clients/${id}`),
    createClient: (data) => api.post('/radius/nas-clients', data),
    updateClient: (id, data) => api.put(`/radius/nas-clients/${id}`, data),
    deleteClient: (id) => api.delete(`/radius/nas-clients/${id}`),
    toggleStatus: (id) => api.post(`/radius/nas-clients/${id}/toggle-status`),
    getActiveClients: () => api.get('/radius/nas-clients-active'),
};

export const radiusAPI = {
    // RADIUS Server Status
    getStatus: () => api.get('/radius/status'),
    getServerInfo: () => api.get('/radius/server-info'),
    
    // NAS Clients
    getNasClients: () => api.get('/radius/nas-clients'),
    addNasClient: (data) => api.post('/radius/nas-clients', data),
    updateNasClient: (id, data) => api.put(`/radius/nas-clients/${id}`, data),
    deleteNasClient: (id) => api.delete(`/radius/nas-clients/${id}`),
    
    // Active Sessions
    getActiveSessions: () => api.get('/radius/sessions/active'),
    getSessionHistory: (userId) => api.get(`/radius/sessions/history/${userId}`),
    disconnectSession: (sessionId) => api.post(`/radius/sessions/disconnect/${sessionId}`),
    
    // User Accounting
    getUserAccounting: (userId) => api.get(`/radius/accounting/${userId}`),
    getAllAccounting: (params) => api.get('/radius/accounting', { params }),
    
    // CoA Operations
    changeSpeed: (data) => api.post('/coa/change-speed', data),
    disconnect: (data) => api.post('/coa/disconnect', data),
    updateQuota: (data) => api.post('/coa/update-quota', data),
    applyFup: (data) => api.post('/coa/apply-fup', data),
    
    // NAS Operations
    rebootNas: (nasId) => api.post(`/radius/nas/${nasId}/reboot`),
    testNas: (nasId) => api.post(`/radius/nas/${nasId}/test`),
};

export default api;
