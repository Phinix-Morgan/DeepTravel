import { apiRequest } from "./apiClient";

const request = (endpoint, options = {}) =>
  apiRequest(endpoint, options);

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
