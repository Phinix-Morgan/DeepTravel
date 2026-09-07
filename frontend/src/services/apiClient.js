const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_BASE_URL = `${RAW_API_URL
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "")}/api`;

let refreshHandler = null;
let refreshPromise = null;
let accessToken = null;

/**
 * Keep the request client synchronized with AuthContext immediately, rather
 * than waiting for React to re-render consumers that may still hold an older
 * token in a closure.
 */
export function setAuthAccessToken(token) {
  accessToken = token || null;
}

/**
 * AuthContext registers its refreshSession function here.
 *
 * This keeps the API client independent from React/AuthContext
 * and avoids a circular dependency.
 */
export function registerAuthRefreshHandler(handler) {
  refreshHandler = handler;

  return () => {
    if (refreshHandler === handler) {
      refreshHandler = null;
    }
  };
}

/**
 * Refresh the access token.
 *
 * If several requests receive 401 at the same time, they all
 * wait for the same refresh request instead of creating multiple
 * refresh requests.
 */
async function refreshTokenOnce() {
  if (!refreshHandler) {
    throw new Error("Authentication refresh handler is not registered.");
  }

  if (!refreshPromise) {
    refreshPromise = Promise.resolve()
      .then(() => refreshHandler())
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Shared API request helper.
 *
 * On a 401:
 *   1. Refresh the access token using the HttpOnly cookie.
 *   2. Retry the original request exactly once with the new token.
 */
export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    token,
    credentials = "include",
    retryOnUnauthorized = true,
  } = {}
) {
  const makeRequest = async (requestToken) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials,
      headers: {
        ...(body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(requestToken
          ? { Authorization: `Bearer ${requestToken}` }
          : {}),
      },
      body: body
        ? JSON.stringify(body)
        : undefined,
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    return {
      response,
      data,
    };
  };

  // Prefer the token owned by AuthContext when it has been updated since this
  // call was created. This prevents a stale component closure from sending an
  // expired token immediately after a successful refresh.
  let currentToken = accessToken || token;

  let { response, data } =
    await makeRequest(currentToken);

  // --------------------------------------------------
  // Access token expired / invalid
  // --------------------------------------------------

  if (
    response.status === 401 &&
    retryOnUnauthorized
  ) {
    try {
      const refreshed =
        await refreshTokenOnce();

      if (!refreshed?.token) {
        throw new Error(
          "Token refresh did not return a new access token."
        );
      }

      currentToken = refreshed.token;

      // Retry the original request once.
      ({
        response,
        data,
      } = await makeRequest(currentToken));
    } catch (refreshError) {
      const error = new Error(
        refreshError?.message ||
          data?.message ||
          "Authentication failed."
      );

      error.status = 401;
      error.data = data;
      throw error;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Something went wrong."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
