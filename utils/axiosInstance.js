import axios from "axios";

let loaderCallbacks = null;

// Set loader functions from context
export const setLoaderCallbacks = (showLoader, hideLoader) => {
  loaderCallbacks = { showLoader, hideLoader };
};

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Show Loader
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ Skip loader if flag is set
    if (!config.skipLoader && loaderCallbacks?.showLoader) {
      loaderCallbacks.showLoader();
    }

    // Add token
    const token = sessionStorage.getItem("token");
    console.log('token', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Hide loader on error
    if (loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return Promise.reject(error);
  }
);

// Response Interceptor - Hide Loader
axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ Only hide if loader was shown
    if (!response.config.skipLoader && loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return response;
  },
  (error) => {
    // ✅ Only hide if loader was shown
    if (!error.config?.skipLoader && loaderCallbacks?.hideLoader) {
      loaderCallbacks.hideLoader();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;