import axios from 'axios';
import { API_BASE_URL } from '../lib/apiConfig';

const API_URL = `${API_BASE_URL}/api/lab`;

const getAuthToken = () => localStorage.getItem('auth_token') || localStorage.getItem('token');

const labService = {
    getDashboardStats: async () => {
        const response = await axios.get(`${API_URL}/dashboard-stats`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    getBookings: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params: filters
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    getInventory: async () => {
        const response = await axios.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    saveInventory: async (data: any) => {
        const response = await axios.post(`${API_URL}/inventory`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    getStaff: async () => {
        const response = await axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    getClinicConnections: async () => {
        const response = await axios.get(`${API_URL}/connections`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    updateBookingStatus: async (orderId: string, status: string, notes?: string) => {
        const response = await axios.put(`${API_URL}/${orderId}`, { status, notes }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    },

    // My Lab Orders (used in patient dashboard)
    getMyOrders: async () => {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/api/lab/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data.data || [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
};

export default labService;

