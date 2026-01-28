import React, { useState } from "react";
import * as API from "../services/apiService";
import "./Auth.css";

/**
 * Login Component
 * Allows existing users to authenticate
 */
function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError("Please enter username and password");
        return;
      }

      // Attempt login
      const response = await API.login(username, password);
      
      // Success - call parent handler
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🧘 Wellness Guide</h2>
        <h3>Login to Your Account</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button
            type="button"
            className="btn btn-link"
            onClick={onSwitchToSignup}
            disabled={isLoading}
          >
            Sign Up Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
