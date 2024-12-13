// src/api/axiosClient.ts
import axios from "axios";
import { getToken } from "../utils/token";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api", // Adjust the baseURL as needed
});

// Add a request interceptor to include the token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
