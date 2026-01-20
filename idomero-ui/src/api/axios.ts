import axios from "axios";
import { Global_ip } from "../global_ip";

export const api = axios.create({
  baseURL: "http://" + Global_ip() + ":8000/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
