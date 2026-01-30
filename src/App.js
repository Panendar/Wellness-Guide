import React, { useState, useEffect } from "react";
import "./App.css";
import { getAllYogasanas } from "./services/yogasanaService";
import * as API from "./services/apiService";
import ModeSelector from "./components/shared/ModeSelector";
import PracticeSession from "./components/Practice/PracticeSession";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";

// Configure mode imports
import GoalInput from "./components/Configure/GoalInput";
import RecommendationList from "./components/Configure/RecommendationList";
import RoutineForm from "./components/Configure/RoutineForm";

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"

  // App state
  const [mode, setMode] = useState("configure");
  const [recommendations, setRecommendations] = useState([]);
  const [selectedYogasanas, setSelectedYogasanas] = useState([]);

  // Check authentication on mount
  useEffect(() => {
    if (API.isAuthenticated()) {
      const user = API.getStoredUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
    }

    // Load yogasanas
    const data = getAllYogasanas();
    console.log("Yogasanas loaded:", data);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthMode("login");
  };

  const handleSignupSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthMode("login");
  };

  const handleLogout = () => {
    API.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMode("configure");
    setRecommendations([]);
    setSelectedYogasanas([]);
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    return (
      <>
        {authMode === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setAuthMode("signup")}
          />
        ) : (
          <Signup
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </>
    );
  }

  // Main app (authenticated)
  return (
    <div className="app">
      {/* Header with user info and logout */}
      <div className="app-header">
        <div className="app-title">
          <h1>🧘 Wellness Guide</h1>
        </div>
        <div className="user-section">
          <span className="user-info">Welcome, {currentUser?.full_name || currentUser?.username}!</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <ModeSelector currentMode={mode} onModeChange={setMode} />

      {/* PRACTICE MODE */}
      {mode === "practice" && <PracticeSession yogasanas={selectedYogasanas} />}

      {/* CONFIGURE MODE */}
      {mode === "configure" && (
        <>
          {/* 4. Goal input */}
          <GoalInput onRecommendations={setRecommendations} />

          {/* 5–6. Recommendations */}
          {recommendations.length > 0 && (
            <RecommendationList
              recommendedYogasanas={recommendations}
              onSelectionChange={setSelectedYogasanas}
            />
          )}

          {/* 7–8. Routine form */}
          {selectedYogasanas.length > 0 && (
            <RoutineForm selectedYogasanas={selectedYogasanas} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
