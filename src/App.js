import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import { getAllYogasanas } from "./services/yogasanaService";
import * as API from "./services/apiService";
import ModeSelector from "./components/shared/ModeSelector";
import PracticeSession from "./components/Practice/PracticeSession";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import achievementTrigger from "./services/achievementTriggerService";

// Configure mode imports
import GoalInput from "./components/Configure/GoalInput";
import RecommendationList from "./components/Configure/RecommendationList";
import RoutineForm from "./components/Configure/RoutineForm";

// New components
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Achievements from "./components/Achievements/Achievements";
import Settings from "./components/Settings/Settings";
import DailyChallenge from "./components/Challenge/DailyChallenge";
import YogasanaSearch from "./components/Search/YogasanaSearch";
import PracticeHistory from "./components/History/PracticeHistory";
import Favorites from "./components/Favorites/Favorites";
import ProgressTracker from "./components/Analytics/ProgressTracker";
import Navigation from "./components/shared/Navigation";

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

    // Setup achievement notifications
    const handleAchievementUnlock = (achievements) => {
      achievements.forEach(achievement => {
        toast.success(
          `🎉 Achievement Unlocked: ${achievement.name}!`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      });
    };

    achievementTrigger.addListener(handleAchievementUnlock);

    return () => {
      achievementTrigger.removeListener(handleAchievementUnlock);
    };
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
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignup={() => setAuthMode("signup")}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <Signup
                onSignupSuccess={handleSignupSuccess}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            }
          />
          <Route
            path="*"
            element={
              authMode === "login" ? (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onSwitchToSignup={() => setAuthMode("signup")}
                />
              ) : (
                <Signup
                  onSignupSuccess={handleSignupSuccess}
                  onSwitchToLogin={() => setAuthMode("login")}
                />
              )
            }
          />
        </Routes>
      </Router>
    );
  }

  // Main app (authenticated)
  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <Navigation currentUser={currentUser} onLogout={handleLogout} />

        {/* Routes */}
        <Routes>
          {/* Dashboard - Default route */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Achievements */}
          <Route path="/achievements" element={<Achievements />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Daily Challenge */}
          <Route path="/challenge" element={<DailyChallenge />} />

          {/* Search & Filter */}
          <Route path="/search" element={<YogasanaSearch />} />

          {/* Practice History */}
          <Route path="/history" element={<PracticeHistory />} />

          {/* Favorites */}
          <Route path="/favorites" element={<Favorites />} />

          {/* Analytics */}
          <Route path="/analytics" element={<ProgressTracker />} />

          {/* Configure Mode - Legacy */}
          <Route
            path="/configure"
            element={
              <div className="configure-container">
                <ModeSelector currentMode={mode} onModeChange={setMode} />
                <GoalInput onRecommendations={setRecommendations} />
                {recommendations.length > 0 && (
                  <RecommendationList
                    recommendedYogasanas={recommendations}
                    onSelectionChange={setSelectedYogasanas}
                  />
                )}
                {selectedYogasanas.length > 0 && (
                  <RoutineForm selectedYogasanas={selectedYogasanas} />
                )}
              </div>
            }
          />

          {/* Practice Mode - Legacy */}
          <Route
            path="/practice"
            element={<PracticeSession yogasanas={selectedYogasanas} />}
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  );
}

export default App;
