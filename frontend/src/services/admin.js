import { apiRequest } from "./apiClient";

const query = (params = {}) => {
  const q = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== "" &&
        value !== undefined &&
        value !== null
    )
  );

  const value = q.toString();

  return value ? `?${value}` : "";
};

const request = (
  endpoint,
  { method = "GET", body, token } = {}
) =>
  apiRequest(`/admin${endpoint}`, {
    method,
    body,
    token,
  });

export const getAdminDashboard = (token) =>
  request("/dashboard", { token });

export const getAdminDestinations = (
  params,
  token
) =>
  request(
    `/destinations${query(params)}`,
    { token }
  );

export const getAdminDestination = (
  id,
  token
) =>
  request(
    `/destinations/${encodeURIComponent(id)}`,
    { token }
  );

export const createAdminDestination = (
  body,
  token
) =>
  request("/destinations", {
    method: "POST",
    body,
    token,
  });

export const updateAdminDestination = (
  id,
  body,
  token
) =>
  request(
    `/destinations/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body,
      token,
    }
  );

export const deleteAdminDestination = (
  id,
  token
) =>
  request(
    `/destinations/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );

export const getAdminPackages = (
  params,
  token
) =>
  request(
    `/packages${query(params)}`,
    { token }
  );

export const getAdminPackage = (
  id,
  token
) =>
  request(
    `/packages/${encodeURIComponent(id)}`,
    { token }
  );

export const createAdminPackage = (
  body,
  token
) =>
  request("/packages", {
    method: "POST",
    body,
    token,
  });

export const updateAdminPackage = (
  id,
  body,
  token
) =>
  request(
    `/packages/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body,
      token,
    }
  );

export const deleteAdminPackage = (
  id,
  token
) =>
  request(
    `/packages/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );

export const getAdminDepartures = (
  params,
  token
) =>
  request(
    `/departures${query(params)}`,
    { token }
  );

export const getAdminDeparture = (
  id,
  token
) =>
  request(
    `/departures/${encodeURIComponent(id)}`,
    { token }
  );

export const createAdminDeparture = (
  body,
  token
) =>
  request("/departures", {
    method: "POST",
    body,
    token,
  });

export const updateAdminDeparture = (
  id,
  body,
  token
) =>
  request(
    `/departures/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body,
      token,
    }
  );

export const deleteAdminDeparture = (
  id,
  token
) =>
  request(
    `/departures/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );

export const getAdminBookings = (
  params,
  token
) =>
  request(
    `/bookings${query(params)}`,
    { token }
  );

export const getAdminBooking = (
  id,
  token
) =>
  request(
    `/bookings/${encodeURIComponent(id)}`,
    { token }
  );

export const updateAdminBookingStatus = (
  id,
  status,
  token
) =>
  request(
    `/bookings/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: { status },
      token,
    }
  );

export const getAdminPayments = (
  params,
  token
) =>
  request(
    `/payments${query(params)}`,
    { token }
  );

export const getAdminPayment = (
  id,
  token
) =>
  request(
    `/payments/${encodeURIComponent(id)}`,
    { token }
  );

export const getAdminUsers = (
  params,
  token
) =>
  request(
    `/users${query(params)}`,
    { token }
  );

export const getAdminUser = (
  id,
  token
) =>
  request(
    `/users/${encodeURIComponent(id)}`,
    { token }
  );

export const updateAdminUserRole = (
  id,
  role,
  token
) =>
  request(
    `/users/${encodeURIComponent(id)}/role`,
    {
      method: "PATCH",
      body: { role },
      token,
    }
  );

export const getAdminCustomTrips = (
  token
) =>
  request("/custom-trips", { token });

export const getAdminCustomTrip = (
  id,
  token
) =>
  request(
    `/custom-trips/${encodeURIComponent(id)}`,
    { token }
  );

export const updateAdminCustomTripStatus = (
  id,
  status,
  token
) =>
  request(
    `/custom-trips/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: { status },
      token,
    }
  );

export const updateAdminCustomTripQuote = (
  id,
  body,
  token
) =>
  request(
    `/custom-trips/${encodeURIComponent(id)}/quote`,
    {
      method: "PATCH",
      body,
      token,
    }
  );
