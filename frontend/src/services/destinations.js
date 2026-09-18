const RAW_API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

export async function getDestinations(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/destinations${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch destinations."
    );
  }

  return response.json();
}

export async function getDestinationById(id) {
  const response = await fetch(
    `${API_BASE_URL}/destinations/${id}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch destination."
    );
  }

  return response.json();
}