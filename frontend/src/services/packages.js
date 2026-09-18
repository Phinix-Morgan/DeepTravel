const RAW_API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

/**
 * Fetch all tour packages.
 *
 * Optional filters:
 *   getTourPackages()
 *   getTourPackages({ status: "active" })
 *   getTourPackages({ destination: destinationId })
 */
export async function getTourPackages({
  destination,
  status,
} = {}) {
  const params =
    new URLSearchParams();

  if (destination) {
    params.set(
      "destination",
      destination
    );
  }

  if (status) {
    params.set(
      "status",
      status
    );
  }

  const queryString =
    params.toString();

  const response = await fetch(
    `${API_BASE_URL}/packages${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch tour packages.";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/**
 * Fetch one tour package by ID.
 */
export async function getTourPackageById(
  packageId
) {
  if (!packageId) {
    throw new Error(
      "Tour package ID is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/packages/${encodeURIComponent(
      packageId
    )}`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch tour package.";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/**
 * Fetch active packages belonging
 * to one destination.
 */
export async function getPackagesByDestination(
  destinationId
) {
  if (!destinationId) {
    throw new Error(
      "Destination ID is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/packages/destination/${encodeURIComponent(
      destinationId
    )}`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch destination packages.";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/**
 * Fetch available future departures
 * for one tour package.
 *
 * GET /api/departures/package/:packageId
 */
export async function getDeparturesByPackage(
  packageId
) {
  if (!packageId) {
    throw new Error(
      "Tour package ID is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/departures/package/${encodeURIComponent(
      packageId
    )}`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch available departures.";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/**
 * Fetch one departure by ID.
 *
 * GET /api/departures/:id
 */
export async function getDepartureById(
  departureId
) {
  if (!departureId) {
    throw new Error(
      "Departure ID is required."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/departures/${encodeURIComponent(
      departureId
    )}`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch departure.";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}