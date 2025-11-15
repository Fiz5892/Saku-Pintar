import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for serverless environments
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("VITE_DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: true,
});

export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// API Client untuk frontend
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance dengan default config
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_expires");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Export API client sebagai 'neon' untuk konsistensi dengan Supabase
export const neon = {
  auth: {
    signUp: async (email: string, password: string, fullName: string) => {
      return apiClient.post("/auth/signup", {
        email,
        password,
        full_name: fullName,
      });
    },
    signIn: async (email: string, password: string) => {
      return apiClient.post("/auth/signin", { email, password });
    },
    signOut: async () => {
      return apiClient.post("/auth/signout");
    },
    verify: async () => {
      return apiClient.get("/auth/verify");
    },
    getUser: async () => {
      return apiClient.get("/auth/me");
    },
  },
  transactions: {
    getAll: async (filters?: any) => {
      return apiClient.get("/transactions", { params: filters });
    },
    getById: async (id: string) => {
      return apiClient.get(`/transactions/${id}`);
    },
    create: async (data: any) => {
      return apiClient.post("/transactions", data);
    },
    update: async (id: string, data: any) => {
      return apiClient.put(`/transactions/${id}`, data);
    },
    delete: async (id: string) => {
      return apiClient.delete(`/transactions/${id}`);
    },
    getSummary: async (filters?: any) => {
      return apiClient.get("/transactions/summary/stats", { params: filters });
    },
    getByCategory: async (filters?: any) => {
      return apiClient.get("/transactions/summary/categories", {
        params: filters,
      });
    },
  },
  insights: {
    generate: async (data: any) => {
      return apiClient.post("/insights/generate", data);
    },
  },
};