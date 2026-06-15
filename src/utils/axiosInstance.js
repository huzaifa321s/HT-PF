import axios from "axios";

let loaderCallbacks = null;

// Set loader functions from context
export const setLoaderCallbacks = (showLoader, hideLoader) => {
  loaderCallbacks = { showLoader, hideLoader };
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Show Loader
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.skipLoader && loaderCallbacks?.showLoader) {
      loaderCallbacks.showLoader();
    }
    let token = null;
    if (typeof window !== "undefined") {
      try {
        token = sessionStorage.getItem("token");
      } catch (e) {
        console.warn("sessionStorage access failed in axiosInstance request interceptor:", e);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return Promise.reject(error);
  }
);

// Response Interceptor - Hide Loader
axiosInstance.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoader && loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipLoader && loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;