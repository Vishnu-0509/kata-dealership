import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 for expired or invalid sessions on protected routes
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: { id: string; email: string; role: string } }>(
      '/auth/login',
      { email, password }
    ),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  exhaustAudioUrl?: string | null;
  year?: number | null;
  bhp?: number | null;
  zeroToSixty?: number | null;
  topSpeed?: number | null;
  mileage?: string | null;
  fuelCapacity?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  seating?: number | null;
  engine?: string | null;
  curbWeight?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export const vehicleApi = {
  getAll: () => apiClient.get<Vehicle[]>('/vehicles'),
  search: (filters: VehicleFilters) =>
    apiClient.get<Vehicle[]>('/vehicles/search', { params: filters }),
  create: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Vehicle>('/vehicles', data),
  update: (id: string, data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) =>
    apiClient.put<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/vehicles/${id}`),
  purchase: (id: string) => apiClient.post<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}/purchase`),
  restock: (id: string, quantity: number) =>
    apiClient.post<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}/restock`, { quantity }),
};
