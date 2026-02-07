import axios from "axios";
const BASE_URL = "http://localhost:3500";

export default axios.create({
  baseURL: BASE_URL,
}); //You are creating a custom Axios instance

// This is a custom Axios instance

// Used for protected requests only

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
}); //You are creating a custom Axios instance
