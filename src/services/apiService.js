// API Service for RADIUS and Session Management

const API_URL = 'http://localhost:8000/api';

export const RadiusService = {
  // Authenticate user
  async authenticate(username, password) {
    try {
      const response = await fetch(`${API_URL}/radius/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Logout user
  async logout(sessionId) {
    try {
      const response = await fetch(`${API_URL}/radius/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Network error' };
    }
  },
};

export const SessionService = {
  // Get all active sessions
  async getActiveSessions(username = null) {
    try {
      const url = username 
        ? `${API_URL}/sessions?username=${username}`
        : `${API_URL}/sessions`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Get sessions error:', error);
      return { success: false, data: [] };
    }
  },

  // Get session statistics
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/sessions/stats`);
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      return { success: false, data: {} };
    }
  },

  // Get specific session details
  async getSession(sessionId) {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, data: null };
    }
  },

  // Disconnect user session
  async disconnect(sessionId, reason = 'Admin-Disconnect') {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('Disconnect error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Get bandwidth usage
  async getBandwidthUsage(username) {
    try {
      const response = await fetch(`${API_URL}/bandwidth/usage?username=${username}`);
      return await response.json();
    } catch (error) {
      console.error('Get bandwidth error:', error);
      return { success: false, data: null };
    }
  },

  // Check user quota
  async checkQuota(username, packageId = null) {
    try {
      const url = packageId
        ? `${API_URL}/bandwidth/quota/${username}?package=${packageId}`
        : `${API_URL}/bandwidth/quota/${username}`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Check quota error:', error);
      return { success: false, data: null };
    }
  },

  // Get user's sessions
  async getUserSessions(username) {
    try {
      const response = await fetch(`${API_URL}/users/${username}/sessions`);
      return await response.json();
    } catch (error) {
      console.error('Get user sessions error:', error);
      return { success: false, data: [] };
    }
  },

  // Disconnect all user sessions
  async disconnectAll(username) {
    try {
      const response = await fetch(`${API_URL}/users/${username}/disconnect-all`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Disconnect all error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Record accounting start
  async accountingStart(data) {
    try {
      const response = await fetch(`${API_URL}/accounting/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Accounting start error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Record interim accounting
  async accountingInterim(data) {
    try {
      const response = await fetch(`${API_URL}/accounting/interim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Accounting interim error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Record accounting stop
  async accountingStop(data) {
    try {
      const response = await fetch(`${API_URL}/accounting/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Accounting stop error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Get session reports
  async getSessionReport(period = 'today') {
    try {
      const response = await fetch(`${API_URL}/reports/sessions?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('Get session report error:', error);
      return { success: false, data: {} };
    }
  },

  // Get bandwidth report
  async getBandwidthReport(period = 'today') {
    try {
      const response = await fetch(`${API_URL}/reports/bandwidth?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error('Get bandwidth report error:', error);
      return { success: false, data: {} };
    }
  },
};
