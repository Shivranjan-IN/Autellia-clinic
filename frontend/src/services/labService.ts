import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lab';

const getAuthToken = () => localStorage.getItem('token');

const labService = {
    getDashboardStats: async () => {
        const response = await axios.get(`${API_URL}/dashboard-stats`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getBookings: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params: filters
        });
        return response.data;
    },

    getInventory: async () => {
        const response = await axios.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    saveInventory: async (data: any) => {
        const response = await axios.post(`${API_URL}/inventory`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getStaff: async () => {
        const response = await axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getClinicConnections: async () => {
        const response = await axios.get(`${API_URL}/connections`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    updateBookingStatus: async (orderId: string, status: string, notes?: string) => {
        const response = await axios.put(`${API_URL}/${orderId}`, { status, notes }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    }
};

export default labService;
