// src/services/api.js
const DEFAULT_API_BASE_URL = "https://matted-ascent-specimen.ngrok-free.dev";

export const API_BASE_URL =
  (typeof window !== "undefined" ? window.localStorage.getItem("API_BASE_URL") : null) ||
  import.meta.env.VITE_API_BASE_URL ||
  DEFAULT_API_BASE_URL;

// ============ HELPER FUNCTIONS ============

const getAuthHeaders = (includeContentType = true, isFormData = false) => {
  const token = localStorage.getItem("accessToken");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  headers["ngrok-skip-browser-warning"] = "true";

  if (!isFormData && includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    return {
      success: false,
      statusCode: response.status,
      message: `Invalid JSON response: ${e.message}`,
      data: null,
    };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("userEmail");
    }
    
    return {
      success: false,
      statusCode: response.status,
      message: data.message || data.error || `Error ${response.status}`,
      data: data.data || null,
    };
  }

  return {
    success: true,
    statusCode: response.status,
    message: data.message || "Success",
    data: data.data || data,
  };
};

const handleError = (error) => {
  let friendlyMessage = error.message;
  
  if (error.message === "Failed to fetch") {
    friendlyMessage = "Cannot connect to server. Please check if backend is running.";
  }
  
  return {
    success: false,
    statusCode: 0,
    message: friendlyMessage,
    data: null,
  };
};

// ============ AUTHENTICATION ENDPOINTS ============

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await handleResponse(response);
      
      if (result.success && result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("isLoggedIn", "true");
        if (result.data.user) {
          localStorage.setItem("userData", JSON.stringify(result.data.user));
          localStorage.setItem("userEmail", result.data.user.email || email);
        } else if (result.data.email) {
          localStorage.setItem("userEmail", result.data.email);
        }
      }
      
      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  loginWithOTP: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const result = await handleResponse(response);
      
      if (result.success && result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        if (result.data.user) {
          localStorage.setItem("userData", JSON.stringify(result.data.user));
        }
      }
      
      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const result = await handleResponse(response);
      apiUtils.clearAuth();
      return result;
    } catch (error) {
      apiUtils.clearAuth();
      return handleError(error);
    }
  },
};

// ============ ADMIN AUTHENTICATION ENDPOINTS ============

export const adminAuthAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/internal/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await handleResponse(response);

      if (result.success) {
        const authToken =
          result.data?.accessToken || result.data?.token || null;
        if (authToken) {
          localStorage.setItem("accessToken", authToken);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("userEmail", result.data?.user?.email || email);
          if (result.data?.refreshToken) {
            localStorage.setItem("refreshToken", result.data.refreshToken);
          }
          if (result.data?.user) {
            localStorage.setItem("userData", JSON.stringify(result.data.user));
          }
        }
      }

      return result;
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============ ADMIN REPORTS & ORDER MANAGEMENT ENDPOINTS ============

export const adminAPI = {
  getOrdersReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/orders`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getRevenueReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/revenue`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getCoursesReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/courses`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getUsersReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/users`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  refundOrder: async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}/refund`,
        {
          method: "POST",
          headers: getAuthHeaders(true, false),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============ USER ENDPOINTS ============

export const userAPI = {
  getProfile: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get profile error:", error);
      return handleError(error);
    }
  },

  updateProfile: async (profileData) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: getAuthHeaders(true, false),
        body: JSON.stringify(profileData),
      });
      
      const result = await handleResponse(response);
      
      if (result.success) {
        const currentUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const updatedUserData = { ...currentUserData, ...profileData };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      }
      
      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      return handleError(error);
    }
  },

  uploadProfilePhoto: async (file) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
        method: "POST",
        headers: getAuthHeaders(false, true),
        body: formData,
      });
      
      const result = await handleResponse(response);
      
      if (result.success && result.data?.photoUrl) {
        const currentUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        currentUserData.profilePhoto = result.data.photoUrl;
        localStorage.setItem("userData", JSON.stringify(currentUserData));
      }
      
      return result;
    } catch (error) {
      console.error("Upload photo error:", error);
      return handleError(error);
    }
  },

  deleteProfilePhoto: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
        method: "DELETE",
        headers: getAuthHeaders(true, false),
      });
      
      const result = await handleResponse(response);
      
      if (result.success) {
        const currentUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        delete currentUserData.profilePhoto;
        localStorage.setItem("userData", JSON.stringify(currentUserData));
      }
      
      return result;
    } catch (error) {
      console.error("Delete photo error:", error);
      return handleError(error);
    }
  },
};

// ============ OTP ENDPOINTS ============

export const otpAPI = {
  requestOTP: async (email, type = "login") => {
    try {
      const endpoint = type === "login" 
        ? `${API_BASE_URL}/auth/login/otp/request`
        : `${API_BASE_URL}/auth/register/otp/request`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  verifyOTP: async (email, otp, type = "login") => {
    try {
      const endpoint = type === "login"
        ? `${API_BASE_URL}/auth/login/otp/verify`
        : `${API_BASE_URL}/auth/register/otp/verify`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  resendOTP: async (email, type = "login") => {
    try {
      const endpoint = type === "login"
        ? `${API_BASE_URL}/auth/login/otp/resend`
        : `${API_BASE_URL}/auth/register/otp/resend`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============ REGISTRATION ENDPOINTS ============

export const registerAPI = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============ SESSION/DEVICE MANAGEMENT ENDPOINTS ============

export const sessionAPI = {
  // Get all active sessions (devices) for the current user
  getAllSessions: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get sessions error:", error);
      return handleError(error);
    }
  },

  // Get a specific session by ID
  getSessionById: async (sessionId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions/${sessionId}`, {
        method: "GET",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get session error:", error);
      return handleError(error);
    }
  },

  // Terminate (logout) a specific session by ID
  terminateSession: async (sessionId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions/${sessionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Terminate session error:", error);
      return handleError(error);
    }
  },

  // Terminate all other sessions except the current one
  terminateAllOtherSessions: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No authentication token found. Please login again.",
        data: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
        method: "DELETE",
        headers: getAuthHeaders(true, false),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Terminate all sessions error:", error);
      return handleError(error);
    }
  },
};

// ============ UTILITY FUNCTIONS ============

export const apiUtils = {
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return !!token && isLoggedIn;
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tempUserData");
    localStorage.removeItem("userProfiles");
  },

  getAuthToken: () => {
    return localStorage.getItem("accessToken");
  },

  setAuthToken: (token) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("isLoggedIn", "true");
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getDiagnosticInfo: () => {
    return {
      apiBaseUrl: API_BASE_URL,
      hasToken: !!localStorage.getItem("accessToken"),
      isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
      userEmail: localStorage.getItem("userEmail"),
      tokenPreview: localStorage.getItem("accessToken") 
        ? `${localStorage.getItem("accessToken").substring(0, 20)}...` 
        : null,
    };
  },
};

// Default export for convenience
export default {
  API_BASE_URL,
  authAPI,
  adminAuthAPI,
  adminAPI,
  userAPI,
  otpAPI,
  registerAPI,
  sessionAPI,
  apiUtils,
};