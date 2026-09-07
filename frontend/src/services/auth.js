import { apiRequest } from "./apiClient";

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

// --------------------------------------------------
// Generic API Request
// --------------------------------------------------

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    token,
    credentials = false,
  } = options;

  const headers = {};

  if (body) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers,
      credentials: credentials
        ? "include"
        : "same-origin",
      body: body
        ? JSON.stringify(body)
        : undefined,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Something went wrong."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}


// --------------------------------------------------
// Register
// --------------------------------------------------

export function registerUser({
  name,
  email,
  password,
}) {
  return request("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
    },
  });
}


// --------------------------------------------------
// Login
// --------------------------------------------------

export function loginUser({
  email,
  password,
}) {
  return request("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
    credentials: true,
  });
}


// --------------------------------------------------
// Current User
// --------------------------------------------------

export function getCurrentUser(
  token,
  { retryOnUnauthorized = true } = {}
) {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
    retryOnUnauthorized,
  });
}


// --------------------------------------------------
// Refresh Access Token
// --------------------------------------------------

export function refreshAccessToken() {
  return request("/auth/refresh", {
    method: "POST",
    credentials: true,
  });
}


// --------------------------------------------------
// Logout
// --------------------------------------------------

export function logoutUser() {
  return request("/auth/logout", {
    method: "POST",
    credentials: true,
  });
}


// --------------------------------------------------
// Logout All Sessions
// --------------------------------------------------

export function logoutAllSessions(token) {
  return apiRequest("/auth/logout-all", {
    method: "POST",
    token,
  });
}


// --------------------------------------------------
// Resend Verification
// --------------------------------------------------

export function resendVerificationEmail(email) {
  return request(
    "/auth/resend-verification",
    {
      method: "POST",
      body: {
        email,
      },
    }
  );
}


// --------------------------------------------------
// Forgot Password
// --------------------------------------------------

export function forgotPassword(email) {
  return request(
    "/auth/forgot-password",
    {
      method: "POST",
      body: {
        email,
      },
    }
  );
}


// --------------------------------------------------
// Reset Password
// --------------------------------------------------

export function resetPassword(
  token,
  password
) {
  return request(
    `/auth/reset-password/${encodeURIComponent(
      token
    )}`,
    {
      method: "POST",
      body: {
        password,
      },
    }
  );
}


// --------------------------------------------------
// Change Password
// --------------------------------------------------

export function changePassword(
  token,
  currentPassword,
  newPassword
) {
  return apiRequest(
    "/auth/change-password",
    {
      method: "POST",
      token,
      body: {
        currentPassword,
        newPassword,
      },
    }
  );
}


// --------------------------------------------------
// Google OAuth
// --------------------------------------------------

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/auth/google`;
}
