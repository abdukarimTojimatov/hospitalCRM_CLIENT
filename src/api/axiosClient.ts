// src/api/axiosClient.ts
import axios from "axios";
import { getToken, removeToken } from "../utils/token";
import { useAuthStore } from "../store/useAuthStore";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api", // Adjust the baseURL as needed
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access, e.g., token expired
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
