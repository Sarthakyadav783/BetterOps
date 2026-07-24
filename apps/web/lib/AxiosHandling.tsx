import axios, { AxiosInstance } from "axios";
import { API_URL } from "./config";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem("authorization");
    if (jwt) {
      config.headers.Authorization = `${jwt}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authorization");
      localStorage.removeItem("user");

      setTimeout(() => {
        alert("Session expired. Please login again.");
        window.location.href = "/";
      }, 0);
    }

    return Promise.reject(error);
  }
);