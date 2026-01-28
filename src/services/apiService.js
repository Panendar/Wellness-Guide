/**
 * API Service - Handles all backend API calls
 * Includes authentication, routines, and progress tracking
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * User signup
 */
export async function signup(email, username, fullName, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username,
      full_name: fullName,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Signup failed");
  }

  return response.json();
}

/**
 * User login
 */
export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await response.json();
  // Save token to localStorage
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

/**
 * Get current user profile
 */
export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    const error = await response.json();
    throw new Error(error.detail || "Failed to get profile");
  }

  return response.json();
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return localStorage.getItem("token") !== null;
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// ============================================================================
// ROUTINE FUNCTIONS
// ============================================================================

/**
 * Create a new routine
 */
export async function createRoutine(title, goal, yogasanaIds, duration, description) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/routines/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      goal,
      description,
      yogasana_ids: JSON.stringify(yogasanaIds),
      duration_minutes: duration,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create routine");
  }

  return response.json();
}

/**
 * Get all user routines
 */
export async function getRoutines(skip = 0, limit = 100) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/routines/?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch routines");
  }

  return response.json();
}

/**
 * Get specific routine
 */
export async function getRoutine(routineId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch routine");
  }

  return response.json();
}

/**
 * Update routine
 */
export async function updateRoutine(routineId, updates) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update routine");
  }

  return response.json();
}

/**
 * Delete routine
 */
export async function deleteRoutine(routineId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.status === 204 && !response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete routine");
  }

  return true;
}

/**
 * Activate a routine
 */
export async function activateRoutine(routineId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/routines/${routineId}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to activate routine");
  }

  return response.json();
}

// ============================================================================
// PROGRESS FUNCTIONS
// ============================================================================

/**
 * Log practice progress
 */
export async function logProgress(
  yogasanaId,
  yogasanaName,
  completionTime,
  isCompleted,
  routineId = null,
  notes = null
) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/progress/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      routine_id: routineId,
      yogasana_id: yogasanaId,
      yogasana_name: yogasanaName,
      completion_time: completionTime,
      is_completed: isCompleted,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to log progress");
  }

  return response.json();
}

/**
 * Get progress history
 */
export async function getProgressHistory(skip = 0, limit = 100, days = 30) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/progress/history?skip=${skip}&limit=${limit}&days=${days}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch progress history");
  }

  return response.json();
}

/**
 * Get progress statistics
 */
export async function getProgressStats() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/progress/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch statistics");
  }

  return response.json();
}

/**
 * Get progress for specific routine
 */
export async function getRoutineProgress(routineId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/progress/routine/${routineId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch routine progress");
  }

  return response.json();
}

/**
 * Get progress for specific yoga pose
 */
export async function getYogasanaProgress(yogasanaId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/progress/yogasana/${yogasanaId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch progress");
  }

  return response.json();
}

/**
 * Update progress
 */
export async function updateProgress(progressId, isCompleted, notes = null) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/progress/${progressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      is_completed: isCompleted,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update progress");
  }

  return response.json();
}

/**
 * Delete progress record
 */
export async function deleteProgress(progressId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/progress/${progressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.status === 204 && !response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete progress");
  }

  return true;
}
