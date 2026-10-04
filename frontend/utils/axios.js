import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_SERVER_URL,
  withCredentials: true,
});

export default api;
