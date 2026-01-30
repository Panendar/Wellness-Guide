/**
 * Form Validation Utility
 * Provides validation functions for all user inputs
 */

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    hasUppercase: true,
    hasNumber: true,
    hasSpecialChar: true,
    message: 'Password must be at least 8 characters with uppercase, number, and special character'
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-20 characters (letters, numbers, underscore, hyphen only)'
  },
  fullName: {
    minLength: 2,
    maxLength: 100,
    message: 'Name must be 2-100 characters'
  },
  duration: {
    min: 1,
    max: 480, // 8 hours
    message: 'Duration must be between 1 and 480 minutes'
  },
  sessionNotes: {
    maxLength: 500,
    message: 'Notes must be under 500 characters'
  },
  time: {
    pattern: /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/,
    message: 'Please enter a valid time in HH:MM format'
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message;
  }
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  
  const errors = [];
  
  if (password.length < VALIDATION_RULES.password.minLength) {
    errors.push(`at least ${VALIDATION_RULES.password.minLength} characters`);
  }
  
  if (VALIDATION_RULES.password.hasUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  
  if (VALIDATION_RULES.password.hasNumber && !/\d/.test(password)) {
    errors.push('one number');
  }
  
  if (VALIDATION_RULES.password.hasSpecialChar && !/[!@#$%^&*]/.test(password)) {
    errors.push('one special character (!@#$%^&*)');
  }
  
  if (errors.length > 0) {
    return `Password must contain: ${errors.join(', ')}`;
  }
  
  return null;
};

/**
 * Validate username format
 */
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < VALIDATION_RULES.username.minLength) {
    return `Username must be at least ${VALIDATION_RULES.username.minLength} characters`;
  }
  if (username.length > VALIDATION_RULES.username.maxLength) {
    return `Username must be at most ${VALIDATION_RULES.username.maxLength} characters`;
  }
  if (!VALIDATION_RULES.username.pattern.test(username)) {
    return VALIDATION_RULES.username.message;
  }
  return null;
};

/**
 * Validate full name
 */
export const validateFullName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < VALIDATION_RULES.fullName.minLength) {
    return `Name must be at least ${VALIDATION_RULES.fullName.minLength} characters`;
  }
  if (name.length > VALIDATION_RULES.fullName.maxLength) {
    return `Name must be at most ${VALIDATION_RULES.fullName.maxLength} characters`;
  }
  return null;
};

/**
 * Validate session duration
 */
export const validateDuration = (duration) => {
  const num = parseInt(duration, 10);
  if (isNaN(num) || num === '') return 'Duration is required';
  if (num < VALIDATION_RULES.duration.min) {
    return `Duration must be at least ${VALIDATION_RULES.duration.min} minute`;
  }
  if (num > VALIDATION_RULES.duration.max) {
    return `Duration cannot exceed ${VALIDATION_RULES.duration.max} minutes`;
  }
  return null;
};

/**
 * Validate session notes
 */
export const validateNotes = (notes) => {
  if (notes && notes.length > VALIDATION_RULES.sessionNotes.maxLength) {
    return VALIDATION_RULES.sessionNotes.message;
  }
  return null;
};

/**
 * Validate time format (HH:MM)
 */
export const validateTime = (time) => {
  if (!time) return 'Time is required';
  if (!VALIDATION_RULES.time.pattern.test(time)) {
    return VALIDATION_RULES.time.message;
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum value
 */
export const validateMin = (value, min, fieldName) => {
  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

/**
 * Validate maximum value
 */
export const validateMax = (value, max, fieldName) => {
  if (value > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  return null;
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Both dates are required';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return 'Start date must be before end date';
  }
  
  return null;
};

/**
 * Validate array is not empty
 */
export const validateArray = (array, fieldName) => {
  if (!Array.isArray(array) || array.length === 0) {
    return `Please select at least one ${fieldName}`;
  }
  return null;
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email or username is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

/**
 * Validate signup form
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!VALIDATION_RULES.email.pattern.test(formData.email)) {
    errors.email = VALIDATION_RULES.email.message;
  }
  
  if (!formData.username) {
    errors.username = 'Username is required';
  } else {
    const usernameError = validateUsername(formData.username);
    if (usernameError) errors.username = usernameError;
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!formData.full_name) {
    errors.full_name = 'Full name is required';
  } else {
    const nameError = validateFullName(formData.full_name);
    if (nameError) errors.full_name = nameError;
  }
  
  return errors;
};

/**
 * Validate session logging form
 */
export const validateSessionForm = (formData) => {
  const errors = {};
  
  if (!formData.duration_minutes) {
    errors.duration_minutes = 'Duration is required';
  } else {
    const durationError = validateDuration(formData.duration_minutes);
    if (durationError) errors.duration_minutes = durationError;
  }
  
  if (!formData.yogasanas || formData.yogasanas.length === 0) {
    errors.yogasanas = 'Please select at least one yogasana';
  }
  
  if (formData.notes) {
    const notesError = validateNotes(formData.notes);
    if (notesError) errors.notes = notesError;
  }
  
  return errors;
};

/**
 * Validate profile update form
 */
export const validateProfileForm = (formData) => {
  const errors = {};
  
  if (formData.email) {
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
  }
  
  if (formData.full_name) {
    const nameError = validateFullName(formData.full_name);
    if (nameError) errors.full_name = nameError;
  }
  
  if (formData.bio && formData.bio.length > 500) {
    errors.bio = 'Bio must be under 500 characters';
  }
  
  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Clear specific error
 */
export const clearError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Set error for field
 */
export const setError = (errors, fieldName, message) => {
  return {
    ...errors,
    [fieldName]: message
  };
};
