import { labAPI } from './api';

export interface LabOrder {
    lab_order_id: string;
    patient_id: string;
    doctor_id?: number | null;
    test_name: string;
    priority: string;
    order_date: string;
    price?: number | null;
    status: string;
    notes?: string | null;
    patient?: {
        full_name: string;
        email?: string;
        phone?: string;
        age?: number;
        gender?: string;
    };
    doctor?: {
        full_name: string;
    };
}

export const labService = {
    async getLabOrders(params?: any) {
        try {
            const response = await labAPI.getAll(params);
            return response.data.data as LabOrder[];
        } catch (error) {
            console.error('Error fetching lab orders:', error);
            throw error;
        }
    },

    async getLabOrderById(id: string) {
        try {
            const response = await labAPI.getById(id);
            return response.data.data as LabOrder;
        } catch (error) {
            console.error('Error fetching lab order details:', error);
            throw error;
        }
    },

    async createLabOrder(data: any) {
        try {
            const response = await labAPI.create(data);
            return response.data.data as LabOrder;
        } catch (error) {
            console.error('Error creating lab order:', error);
            throw error;
        }
    },

    async updateLabOrder(id: string, data: any) {
        try {
            const response = await labAPI.update(id, data);
            return response.data;
        } catch (error) {
            console.error('Error updating lab order:', error);
            throw error;
        }
    },

    async deleteLabOrder(id: string) {
        try {
            const response = await labAPI.delete(id);
            return response.data;
        } catch (error) {
            console.error('Error deleting lab order:', error);
            throw error;
        }
    },
    
    async getTestTypes() {
        try {
            const response = await labAPI.getTestTypes();
            return response.data.data;
        } catch (error) {
            console.error('Error fetching test types:', error);
            throw error;
        }
    }
};
