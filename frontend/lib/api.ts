import axios from "axios";
import { authStorage } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Bearer token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a token expires/is invalid, redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post("/auth/login", { username, password });
    return res.data;
  },
};

export const matchApi = {
  getMatch: async (poNumber: string) => {
    const res = await apiClient.get(`/match/${poNumber}`);
    return res.data;
  },
  getSummary: async (poNumber: string) => {
    const res = await apiClient.get(`/summary/${poNumber}`);
    return res.data;
  },
};

export const documentsApi = {
  upload: async (file: File, documentType: "po" | "grn" | "invoice") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    const res = await apiClient.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  list: async (params?: { type?: string; poNumber?: string }) => {
    const res = await apiClient.get("/documents", { params });
    return res.data;
  },
  getFileUrl: (id: string) => `${API_BASE_URL}/documents/${id}/file`,
};

export const mastersApi = {
  list: async () => {
    const res = await apiClient.get("/masters/sku");
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/masters/sku", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/masters/sku/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/masters/sku/${id}`);
    return res.data;
  },
};
