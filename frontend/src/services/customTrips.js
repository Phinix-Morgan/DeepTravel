const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

async function request(endpoint, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Preserve a useful fallback error below when a response has no JSON body.
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function createCustomTripRequest(payload, token) {
  return request("/custom-trips", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getMyCustomTripRequests(token) {
  return request("/custom-trips/my", { token });
}

export function getCustomTripRequestById(requestId, token) {
  if (!requestId) throw new Error("Custom trip request ID is required.");
  return request(`/custom-trips/${encodeURIComponent(requestId)}`, { token });
}

export function acceptCustomTripQuote(requestId, departure, token) {
  if (!requestId) throw new Error("Custom trip request ID is required.");
  if (!departure) throw new Error("Please select an available departure.");
  return request(`/custom-trips/${encodeURIComponent(requestId)}/accept`, {
    method: "PATCH",
    body: { departure },
    token,
  });
}
