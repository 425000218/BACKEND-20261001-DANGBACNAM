import axios from 'axios';

// Lấy URL Backend từ biến môi trường Vite (mặc định http://localhost:5000 nếu chưa set)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
