// src/utils/validation.js
// Field length constraints based on database schema
export const FIELD_CONSTRAINTS = {
  firstName: { max: 100, label: "First Name" },
  lastName: { max: 100, label: "Last Name" },
  email: { max: 255, label: "Email" },
  password: { max: 255, label: "Password" },
  mobile: { max: 20, label: "Mobile" },
  countryCode: { max: 10, label: "Country Code" },
  city: { max: 100, label: "City" },
  state: { max: 100, label: "State" },
  country: { max: 100, label: "Country" },
  organization: { max: 150, label: "Organization" },
  skills: { max: 255, label: "Skills" },
  fieldOfStudy: { max: 150, label: "Field of Study" },
  highestQualification: { max: 100, label: "Highest Qualification" },
  preferredLanguage: { max: 50, label: "Preferred Language" },
  dob: { max: 10, label: "Date of Birth" },
  profilePhoto: { max: 500, label: "Profile Photo URL" }, // Not base64!
};

/**
 * Validate field length
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateFieldLength = (fieldName, value) => {
  if (!value) return { isValid: true, error: "" };

  const constraint = FIELD_CONSTRAINTS[fieldName];
  if (!constraint) return { isValid: true, error: "" };

  if (value.length > constraint.max) {
    return {
      isValid: false,
      error: `${constraint.label} must not exceed ${constraint.max} characters (${value.length} / ${constraint.max})`,
    };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate entire form
 * @param {object} formData - Form data object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateFormLengths = (formData) => {
  const errors = {};

  Object.keys(formData).forEach((fieldName) => {
    const value = formData[fieldName];
    
    // Skip file objects and null values
    if (value === null || value instanceof File) return;
    
    const validation = validateFieldLength(fieldName, String(value || ""));
    if (!validation.isValid) {
      errors[fieldName] = validation.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Truncate field to max length
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to truncate
 * @returns {string} - Truncated value
 */
export const truncateField = (fieldName, value) => {
  if (!value) return value;

  const constraint = FIELD_CONSTRAINTS[fieldName];
  if (!constraint) return value;

  if (value.length > constraint.max) {
    return value.substring(0, constraint.max);
  }

  return value;
};

/**
 * Sanitize form data before submission
 * @param {object} formData - Form data object
 * @returns {object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  const sanitized = { ...formData };

  Object.keys(sanitized).forEach((fieldName) => {
    const value = sanitized[fieldName];
    
    // Skip file objects and null values
    if (value === null || value instanceof File) return;
    
    // Truncate to max length
    sanitized[fieldName] = truncateField(fieldName, String(value || ""));
  });

  return sanitized;
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate mobile number (must be exactly 10 digits)
 * Note: This validates ONLY the mobile number without country code
 * @param {string} mobile - Mobile number to validate (without country code)
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateMobile = (mobile) => {
  if (!mobile) {
    return { isValid: false, error: "Mobile number is required" };
  }
  
  // Remove any non-digit characters (spaces, dashes, etc.)
  const cleanMobile = mobile.replace(/\D/g, "");
  
  // Check if empty after cleaning
  if (cleanMobile.length === 0) {
    return { isValid: false, error: "Mobile number must contain digits" };
  }
  
  // Mobile number must be exactly 10 digits for India
  if (cleanMobile.length !== 10) {
    return { 
      isValid: false, 
      error: `Mobile number must be exactly 10 digits (${cleanMobile.length} / 10)` 
    };
  }
  
  // Check if mobile starts with valid digit (6-9 for Indian mobile)
  if (!/^[6-9]/.test(cleanMobile)) {
    return { isValid: false, error: "Mobile number must start with 6, 7, 8, or 9" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Get complete mobile number with country code
 * @param {string} mobile - Mobile number
 * @param {string} countryCode - Country code (e.g., '+91')
 * @returns {string} - Complete mobile number with country code
 */
export const getCompleteMobileNumber = (mobile, countryCode = '+91') => {
  const cleanMobile = mobile.replace(/\D/g, "");
  return `${countryCode}${cleanMobile}`;
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {object} - { length, lowercase, uppercase, number, special }
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    };
  }
  
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
};

/**
 * Get password strength
 * @param {string} password - Password to check
 * @returns {object} - { score, text }
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: "Weak" };
  
  const checks = validatePassword(password);
  let score = Object.values(checks).filter(Boolean).length;

  let text = "";
  if (score <= 2) text = "Weak";
  else if (score <= 4) text = "Medium";
  else text = "Strong";

  return { score, text };
};

/**
 * Validate confirm password matches password
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirm password to check
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true, error: "" };
};

/**
 * Validate date of birth (user must be at least 13 years old)
 * @param {string} dob - Date of birth in DD-MM-YYYY format
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateDateOfBirth = (dob) => {
  if (!dob) {
    return { isValid: false, error: "Date of birth is required" };
  }
  
  // Parse DD-MM-YYYY format
  const parts = dob.split('-');
  if (parts.length !== 3) {
    return { isValid: false, error: "Use DD-MM-YYYY format" };
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  const birthDate = new Date(year, month, day);
  const today = new Date();
  
  // Check if date is valid
  if (birthDate.getDate() !== day || birthDate.getMonth() !== month || birthDate.getFullYear() !== year) {
    return { isValid: false, error: "Invalid date" };
  }
  
  // Check if birth date is in the future
  if (birthDate > today) {
    return { isValid: false, error: "Date of birth cannot be in the future" };
  }
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 13) {
    return { isValid: false, error: "You must be at least 13 years old" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Combined validation for registration form
 * @param {object} formData - Form data with email, mobile, password, confirmPassword, dob
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Validate email
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Enter a valid email address";
  }
  
  // Validate mobile (without country code)
  const mobileValidation = validateMobile(formData.mobile);
  if (!mobileValidation.isValid) {
    errors.mobile = mobileValidation.error;
  }
  
  // Validate password
  const passwordChecks = validatePassword(formData.password);
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!passwordChecks.length) {
    errors.password = "Password must be at least 8 characters";
  } else if (!passwordChecks.lowercase || !passwordChecks.uppercase || !passwordChecks.number || !passwordChecks.special) {
    errors.password = "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)";
  }
  
  // Validate password match
  const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (!passwordMatchValidation.isValid) {
    errors.confirmPassword = passwordMatchValidation.error;
  }
  
  // Validate date of birth
  const dobValidation = validateDateOfBirth(formData.dob);
  if (!dobValidation.isValid) {
    errors.dob = dobValidation.error;
  }
  
  // Validate field lengths
  const lengthValidation = validateFormLengths(formData);
  Object.assign(errors, lengthValidation.errors);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};