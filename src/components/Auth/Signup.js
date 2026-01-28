import React, { useState } from "react";
import * as API from "../services/apiService";
import "./Auth.css";

/**
 * Signup Component
 * Allows new users to create an account
 */
function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Attempt signup
      await API.signup(
        formData.email,
        formData.username,
        formData.fullName,
        formData.password
      );

      // If signup successful, login automatically
      const loginResponse = await API.login(formData.username, formData.password);
      onSignupSuccess(loginResponse.user);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🧘 Wellness Guide</h2>
        <h3>Create Your Account</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button
            type="button"
            className="btn btn-link"
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
