import React, { useState, useEffect } from 'react';
import './Settings.css';
import API from '../../services/apiService';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    daily_reminder_enabled: true,
    sound_enabled: true,
    dark_mode: false,
    daily_reminder_time: '08:00',
    preferred_difficulty: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getUserSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await API.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default?')) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const data = await API.resetSettings();
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">⚙️ Settings</h1>
        <p className="settings-subtitle">Customize your wellness experience</p>
      </div>

      {error && (
        <div className="settings-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="settings-success">
          <span className="success-icon">✅</span>
          <p>Settings saved successfully!</p>
        </div>
      )}

      <div className="settings-content">
        {/* Notifications Section */}
        <div className="settings-section">
          <h2 className="section-title">🔔 Notifications</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Enable Notifications</h3>
                <p className="setting-description">Receive app notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={() => handleToggle('notifications_enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Daily Reminder</h3>
                <p className="setting-description">Get reminded to practice daily</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.daily_reminder_enabled}
                  onChange={() => handleToggle('daily_reminder_enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.daily_reminder_enabled && (
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-label">Reminder Time</h3>
                  <p className="setting-description">Choose your preferred reminder time</p>
                </div>
                <input
                  type="time"
                  className="time-picker"
                  value={settings.daily_reminder_time}
                  onChange={(e) => handleChange('daily_reminder_time', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <h2 className="section-title">🎨 Appearance</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Dark Mode</h3>
                <p className="setting-description">Switch to dark theme</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.dark_mode}
                  onChange={() => handleToggle('dark_mode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Sound Section */}
        <div className="settings-section">
          <h2 className="section-title">🔊 Sound</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Sound Effects</h3>
                <p className="setting-description">Enable sound effects and alerts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.sound_enabled}
                  onChange={() => handleToggle('sound_enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Practice Section */}
        <div className="settings-section">
          <h2 className="section-title">🧘 Practice Preferences</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3 className="setting-label">Preferred Difficulty</h3>
                <p className="setting-description">Your default practice level</p>
              </div>
              <select
                className="difficulty-select"
                value={settings.preferred_difficulty}
                onChange={(e) => handleChange('preferred_difficulty', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Save Settings
              </>
            )}
          </button>
          <button
            className="btn-reset"
            onClick={handleReset}
            disabled={saving}
          >
            <span className="btn-icon">🔄</span>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
