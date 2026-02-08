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

// ============================================================================
// STATS & SESSION LOGS FUNCTIONS
// ============================================================================

/**
 * Get user statistics
 */
export async function getUserStats() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/users/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch user stats");
  }

  return response.json();
}

/**
 * Log a completed practice session
 */
export async function logSession(durationMinutes, yogasanasPracticed, routineId = null, notes = null) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/session-logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      routine_id: routineId,
      duration_minutes: durationMinutes,
      yogasanas_practiced: yogasanasPracticed,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to log session");
  }

  return response.json();
}

/**
 * Get session history
 */
export async function getSessionLogs(limit = 50, offset = 0, startDate = null, endDate = null) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  let url = `${API_BASE_URL}/session-logs?limit=${limit}&offset=${offset}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch session logs");
  }

  return response.json();
}

/**
 * Get session statistics for a period
 */
export async function getSessionStats(period = "week") {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/session-logs/stats?period=${period}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch session stats");
  }

  return response.json();
}

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

/**
 * Get user's favorite yogasanas
 */
export async function getFavorites(limit = 100, offset = 0) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/favorites?limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch favorites");
  }

  return response.json();
}

/**
 * Add yogasana to favorites
 */
export async function addFavorite(yogasanaId, yogasanaName) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      yogasana_id: yogasanaId,
      yogasana_name: yogasanaName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to add favorite");
  }

  return response.json();
}

/**
 * Remove yogasana from favorites
 */
export async function removeFavorite(yogasanaId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/favorites/${yogasanaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 204 && !response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to remove favorite");
  }

  return true;
}

/**
 * Check if yogasana is favorited
 */
export async function checkFavorite(yogasanaId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/favorites/check/${yogasanaId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to check favorite");
  }

  return response.json();
}

// ============================================================================
// ACHIEVEMENTS FUNCTIONS
// ============================================================================

/**
 * Get all available achievements
 */
export async function getAchievements() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/achievements`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch achievements");
  }

  return response.json();
}

/**
 * Get user's earned achievements
 */
export async function getUserAchievements() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/user-achievements`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch user achievements");
  }

  return response.json();
}

/**
 * Check for newly unlocked achievements
 */
export async function checkNewAchievements() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/achievements/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to check achievements");
  }

  return response.json();
}

/**
 * Get achievement progress
 */
export async function getAchievementProgress() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/achievements/progress`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch achievement progress");
  }

  return response.json();
}

// ============================================================================
// YOGASANA SEARCH & FILTER FUNCTIONS
// ============================================================================

/**
 * Get all yogasanas
 */
export async function getAllYogasanas() {
  const response = await fetch(`${API_BASE_URL}/yogasanas/all`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch yogasanas");
  }

  return response.json();
}

/**
 * Search yogasanas by query
 */
export async function searchYogasanas(query, limit = 50) {
  const response = await fetch(`${API_BASE_URL}/yogasanas/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to search yogasanas");
  }

  return response.json();
}

/**
 * Filter yogasanas by criteria
 */
export async function filterYogasanas(difficulty = null, duration = null, bodyFocus = null, limit = 50) {
  let url = `${API_BASE_URL}/yogasanas/filter?limit=${limit}`;
  if (difficulty) url += `&difficulty=${difficulty}`;
  if (duration) url += `&duration=${duration}`;
  if (bodyFocus) url += `&body_focus=${encodeURIComponent(bodyFocus)}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to filter yogasanas");
  }

  return response.json();
}

/**
 * Get yogasanas by difficulty level
 */
export async function getYogasanasByDifficulty(difficulty) {
  const response = await fetch(`${API_BASE_URL}/yogasanas/by-difficulty?difficulty=${difficulty}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch yogasanas by difficulty");
  }

  return response.json();
}

// ============================================================================
// USER SETTINGS FUNCTIONS
// ============================================================================

/**
 * Get user settings
 */
export async function getUserSettings() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/user/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch settings");
  }

  return response.json();
}

/**
 * Update user settings
 */
export async function updateSettings(settings) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/user/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update settings");
  }

  return response.json();
}

/**
 * Reset user settings to defaults
 */
export async function resetSettings() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/user/settings/reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to reset settings");
  }

  return response.json();
}

// ============================================================================
// DAILY CHALLENGE FUNCTIONS
// ============================================================================

/**
 * Get today's daily challenge
 */
export async function getDailyChallenge() {
  const token = localStorage.getItem("token");

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/daily-challenge`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch daily challenge");
  }

  return response.json();
}

/**
 * Get user's progress on today's challenge
 */
export async function getUserChallengeProgress() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/daily-challenge/user-progress`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch challenge progress");
  }

  return response.json();
}

/**
 * Complete today's daily challenge
 */
export async function completeDailyChallenge(challengeId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/daily-challenge/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      challenge_id: challengeId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to complete challenge");
  }

  return response.json();
}

/**
 * Get challenge completion history
 */
export async function getChallengeHistory(limit = 50, offset = 0) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/challenges/history?limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch challenge history");
  }

  return response.json();
}

/**
 * Get challenge leaderboard
 */
export async function getChallengeLeaderboard(limit = 10) {
  const token = localStorage.getItem("token");

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/challenges/leaderboard?limit=${limit}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch leaderboard");
  }

  return response.json();
}

// ============================================================================
// DEFAULT EXPORT - All API functions as an object
// ============================================================================

const API = {
  // Authentication
  signup,
  login,
  logout,
  isAuthenticated,
  getStoredUser,
  
  // User Profile
  getProfile,
  
  // Routines
  createRoutine,
  getRoutines,
  getRoutine,
  updateRoutine,
  deleteRoutine,
  activateRoutine,
  
  // Progress
  logProgress,
  getProgressHistory,
  getProgressStats,
  updateProgress,
  deleteProgress,
  
  // Session Logging
  logSession,
  getSessionLogs,
  getSessionStats,
  
  // Yogasanas
  getAllYogasanas,
  searchYogasanas,
  filterYogasanas,
  getYogasanasByDifficulty,
  getYogasanaProgress,
  getRoutineProgress,
  
  // Favorites
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
  
  // User Stats
  getUserStats,
  
  // Achievements
  getAchievements,
  getUserAchievements,
  checkNewAchievements,
  getAchievementProgress,
  
  // Settings
  getUserSettings,
  updateSettings,
  resetSettings,
  
  // Daily Challenges
  getDailyChallenge,
  completeDailyChallenge,
  getUserChallengeProgress,
  getChallengeHistory,
  getChallengeLeaderboard,
};

export default API;
