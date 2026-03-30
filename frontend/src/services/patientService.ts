// Patient Service - API implementation for backend
// Uses HTTP requests to backend API

import { API_BASE_URL } from '../lib/apiConfig';

export interface Patient {
    patient_id: string;
    full_name: string;
    age?: number;
    gender?: string;
    blood_group?: string;
    abha_id?: string;
    phone?: string;
    address?: string;
    medical_history?: string;
    insurance_id?: string;
    date_of_birth?: string | Date; // Added for profile
    email?: string;
    profile_photo_url?: string;
    allergies?: string[] | null;
    chronicDiseases?: string[] | null;
    currentMedications?: string[] | null;
    prescriptions?: any[] | null;
}



class PatientService {
    // Helper to convert relative path to absolute URL
    public getFullUrl(path: string | undefined): string | undefined {
        if (!path) return undefined;
        if (path.startsWith('http')) return path; // Already absolute
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    private async getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getPatients(search: string = ''): Promise<Patient[]> {
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const response = await fetch(`${API_BASE_URL}/api/patients${query}`, {
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const patients = result.data?.patients || [];

            return patients.map((p: any) => ({
                ...p,
                profile_photo_url: this.getFullUrl(p.profile_photo_url)
            }));
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    }

    async getPatientById(id: string): Promise<Patient | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const patient = result.data;
            if (patient) {
                patient.profile_photo_url = this.getFullUrl(patient.profile_photo_url);
            }
            return patient || null;
        } catch (error) {
            console.error('Error fetching patient:', error);
            return null;
        }
    }

    async createPatient(patient: Patient): Promise<Patient> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(patient),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result.data;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    async getPatientProfile(): Promise<Patient | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/profile`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            const patient = result.data;
            if (patient) {
                patient.profile_photo_url = this.getFullUrl(patient.profile_photo_url);
            }
            return patient || null;
        } catch (error) {
            console.error('Error fetching patient profile:', error);
            return null;
        }
    }

    async updatePatientProfile(updates: Partial<Patient>): Promise<Patient | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/profile`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            const patient = result.data;
            if (patient) {
                patient.profile_photo_url = this.getFullUrl(patient.profile_photo_url);
            }
            return patient || null;
        } catch (error) {
            console.error('Error updating patient profile:', error);
            return null;
        }
    }

    async getDashboardStats(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/dashboard/stats`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    }

    async getMyAppointments(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments/my-appointments`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching my appointments:', error);
            return [];
        }
    }

    async getMyPrescriptions(patientId?: string): Promise<any[]> {
        try {
            // Use the /my endpoint which extracts patient from auth token
            const response = await fetch(`${API_BASE_URL}/api/prescriptions/my`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching my prescriptions:', error);
            return [];
        }
    }

    async getMyLabOrders(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/lab/my-orders`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching my lab orders:', error);
            return [];
        }
    }

    downloadPrescriptionUrl(prescriptionId: string): string {
        return `${API_BASE_URL}/api/prescriptions/${prescriptionId}/download`;
    }

    async downloadWithAuth(url: string, filename: string): Promise<void> {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    async updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            return false;
        }
    }

    async rescheduleAppointment(appointmentId: string, date: string, time: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/appointments/reschedule`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    appointment_date: date,
                    appointment_time: time
                })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            return false;
        }
    }

    async getUpcomingAppointments(patientId?: string): Promise<any[]> {
        try {
            let url;
            if (patientId) {
                // Param-based (if component passes patientId)
                url = `${API_BASE_URL}/api/appointments/upcoming/${patientId}`;
            } else {
                // Session-based (recommended)
                url = `${API_BASE_URL}/api/appointments/my-upcoming-appointments`;
            }
            
            console.log('📅 Fetching upcoming from:', url); // Debug log
            
            const response = await fetch(url, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) {
                console.error('Upcoming appointments failed:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data || result.appointments || [];
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            return [];
        }
    }


    async getMyDocuments(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/documents`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching my documents:', error);
            return [];
        }
    }

    async explainReport(content: string, language: string = 'English'): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/ai/explain-report`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ report_content: content, language }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data.explanation;
        } catch (error) {
            console.error('Error explaining report:', error);
            return 'Failed to generate explanation.';
        }
    }

    async explainPrescription(content: string, language: string = 'English'): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/ai/explain-prescription`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ prescription_content: content, language }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data.explanation;
        } catch (error) {
            console.error('Error explaining prescription:', error);
            return 'Failed to generate explanation.';
        }
    }

    async deletePatient(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting patient:', error);
            return false;
        }
    }

    async uploadProfilePhoto(file: File): Promise<Patient | null> {
        try {
            const formData = new FormData();
            formData.append('profile_photo', file);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/patients/profile/photo`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const patient = result.data;
            if (patient) {
                patient.profile_photo_url = this.getFullUrl(patient.profile_photo_url);
            }
            return patient || null;
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            return null;
        }
    }

    async deleteDocument(id: number): Promise<boolean> {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }

    async uploadDocument(file: File, type: string = 'Other'): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('document_type', type);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }
}

export const patientService = new PatientService();

