// API Client to replace Supabase - connects to backend API
// This provides a similar interface to Supabase but uses HTTP requests

const _rawSupabaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_BASE_URL = _rawSupabaseUrl.endsWith('/api') ? _rawSupabaseUrl : `${_rawSupabaseUrl}/api`;

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface AuthResponse {
  data: {
    user: AuthUser | null;
  };
  error: any;
}

class SupabaseAuth {
  async getUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: { user: null }, error: null };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { data: { user: null }, error: 'Failed to get user' };
      }

      const userData = await response.json();
      return {
        data: {
          user: {
            id: userData.data.user_id,
            email: userData.data.email,
            user_metadata: {
              full_name: userData.data.full_name,
              role: userData.data.role,
            },
          },
        },
        error: null,
      };
    } catch (error) {
      console.error('Auth getUser error:', error);
      return { data: { user: null }, error };
    }
  }
}

class SupabaseFrom {
  constructor(private table: string) {}

  async select(_columns: string = '*') {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/${this.table}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data: data.data || data, error: null };
    } catch (error) {
      console.error(`Error fetching ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async insert(data: any) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/${this.table}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result.data || result, error: null };
    } catch (error) {
      console.error(`Error inserting into ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async update(updates: any) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/${this.table}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result.data || result, error: null };
    } catch (error) {
      console.error(`Error updating ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async delete() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/${this.table}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { error: null };
    } catch (error) {
      console.error(`Error deleting from ${this.table}:`, error);
      return { error };
    }
  }

  eq(column: string, value: any) {
    // For simplicity, we'll handle filtering in the backend
    // This is a basic implementation - you might want to enhance this
    this.table = `${this.table}?${column}=${value}`;
    return this;
  }

  single() {
    // This would need backend support for single record fetching
    return this;
  }

  order(_column: string, _options: { ascending: boolean }) {
    // For simplicity, we'll assume backend handles ordering
    return this;
  }
}

class SupabaseClient {
  auth: SupabaseAuth;

  constructor() {
    this.auth = new SupabaseAuth();
  }

  from(table: string): SupabaseFrom {
    return new SupabaseFrom(table);
  }
}

export const supabase = new SupabaseClient();
