import React, { useState, useRef } from 'react';
import './Signup.css';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../services/api';
import { 
  validateFieldLength, 
  sanitizeFormData, 
  validateEmail, 
  validateMobile, 
  validatePassword,
  getPasswordStrength 
} from "../utils/validation";
import { readImageAsDataUrl, setProfilePhoto, clearProfilePhoto } from "../utils/profilePhoto";

const Signup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [avatarColor] = useState("#667eea");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    dob: '',
    profilePhoto: null,
    city: '',
    state: '',
    country: '',
    countryCode: '+91',
    preferredLanguage: '',
    organization: '',
    skills: '',
    fieldOfStudy: '',
    highestQualification: ''
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
  const [showRequirements, setShowRequirements] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');

  // Get initials for avatar
  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    }
    if (formData.firstName) {
      return formData.firstName.charAt(0).toUpperCase();
    }
    return "";
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
    return strength;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const validation = validateFieldLength(name, value);
    if (!validation.isValid) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    } else {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      checkPasswordStrength(value);
      setShowRequirements(true);
    }
    
    if (name === 'mobile') {
      const mobileValidation = validateMobile(value);
      if (!mobileValidation.isValid && value) {
        setMobileError(mobileValidation.error);
      } else {
        setMobileError('');
      }
    }
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Please upload a valid image (JPEG, PNG, WEBP)', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File size should be less than 5MB', type: 'error' });
      return;
    }

    setPhotoLoading(true);
    setFormData(prev => ({ ...prev, profilePhoto: file }));

    try {
      setProfilePreview(await readImageAsDataUrl(file));
    } catch {
      setMessage({ text: 'Could not read the selected image. Please try another one.', type: 'error' });
    } finally {
      setPhotoLoading(false);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setProfilePreview(null);
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    clearProfilePhoto();
    setMessage({ text: 'Photo removed', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  // Validate form before submission
  const validateForm = () => {
    if (Object.keys(fieldErrors).length > 0) {
      setMessage({ text: 'Please fix field errors before submitting', type: 'error' });
      return false;
    }

    if (!formData.firstName.trim()) {
      setMessage({ text: 'First name is required', type: 'error' });
      return false;
    }
    if (!formData.lastName.trim()) {
      setMessage({ text: 'Last name is required', type: 'error' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ text: 'Email is required', type: 'error' });
      return false;
    }
    
    if (!validateEmail(formData.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return false;
    }
    
    if (!formData.password) {
      setMessage({ text: 'Password is required', type: 'error' });
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!Object.values(passwordValidation).every(Boolean)) {
      setMessage({ text: 'Please meet all password requirements', type: 'error' });
      return false;
    }

    if (!formData.confirmPassword) {
      setMessage({ text: 'Confirm Password is required', type: 'error' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return false;
    }
    
    if (!formData.mobile.trim()) {
      setMessage({ text: 'Mobile number is required', type: 'error' });
      return false;
    }

    const mobileValidation = validateMobile(formData.mobile);
    if (!mobileValidation.isValid) {
      setMessage({ text: mobileValidation.error, type: 'error' });
      return false;
    }
    
    if (!formData.dob) {
      setMessage({ text: 'Date of birth is required', type: 'error' });
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const submissionData = sanitizeFormData(formData);
      
      if (submissionData.profilePhoto instanceof File) {
        submissionData.profilePhoto = null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          text: data.message || 'Registration successful! OTP sent to your email.',
          type: 'success'
        });

        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("tempUserData", JSON.stringify(formData));
        
        if (profilePreview) {
          localStorage.setItem("pendingPhotoFile", "true");
          setProfilePhoto(profilePreview);
        }

        setTimeout(() => {
          navigate("/verify-otp", {
            state: { email: formData.email }
          });
        }, 1500);

      } else {
        setMessage({ text: data.message || 'Registration failed. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ text: 'Network error. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = validatePassword(formData.password);

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        {/* LEFT SIDE - REGISTRATION FORM */}
        <div className="signup-left">
          <h2>Create Account</h2>
          
          {/* Clean Profile Photo Section */}
          <div className="profile-upload-section">
            <label className="profile-label">Profile Photo</label>
            <div className="profile-picture-container">
              <div className="profile-upload-area">
                {profilePreview ? (
                  <div className="profile-image-wrapper">
                    <img src={profilePreview} alt="Profile" className="profile-image-preview" />
                    <div className="profile-overlay">
                      <button 
                        type="button"
                        className="overlay-btn"
                        onClick={() => fileInputRef.current.click()}
                      >
                        📷
                      </button>
                      <button 
                        type="button"
                        className="overlay-btn remove"
                        onClick={removePhoto}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="profile-upload-placeholder"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="avatar-circle" style={{ backgroundColor: avatarColor }}>
                      {getInitials() ? (
                        <span className="avatar-initials">{getInitials()}</span>
                      ) : (
                        <svg className="avatar-svg-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      )}
                    </div>
                    <p>Upload Photo</p>
                    <small>JPG, PNG (max 5MB)</small>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              
              {photoLoading && (
                <div className="photo-loading">
                  
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
              {formData.password && (
                <div className="password-strength-container">
                  <div 
                    className="password-strength-bar" 
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.score <= 2 ? '#f44336' : passwordStrength.score <= 4 ? '#ff9800' : '#4caf50'
                    }}
                  />
                  <span className="password-strength-text">{passwordStrength.text}</span>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {showRequirements && formData.password && (
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={passwordChecks.length ? 'valid' : 'invalid'}>✓ At least 8 characters</li>
                  <li className={passwordChecks.lowercase ? 'valid' : 'invalid'}>✓ One lowercase letter</li>
                  <li className={passwordChecks.uppercase ? 'valid' : 'invalid'}>✓ One uppercase letter</li>
                  <li className={passwordChecks.number ? 'valid' : 'invalid'}>✓ One number</li>
                  <li className={passwordChecks.special ? 'valid' : 'invalid'}>✓ One special character (@$!%*?&)</li>
                </ul>
              </div>
            )}

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className="password-match-error">Passwords do not match!</span>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <span className="password-match-success">✓ Passwords match!</span>
              )}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label>Mobile Number *</label>
              <div className="mobile-input-group">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="country-code-select"
                >
                  <option value="+91">+91 (India)</option>
                  <option value="+1">+1 (USA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+86">+86 (China)</option>
                </select>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  className={`mobile-input ${mobileError ? 'error' : ''}`}
                  required
                />
              </div>
              {mobileError && <span className="field-error">{mobileError}</span>}
              {formData.mobile && !mobileError && validateMobile(formData.mobile).isValid && (
                <span className="field-success">✓ Valid mobile number</span>
              )}
              <small className="field-hint">Enter only 10 digits (e.g., 9834258396)</small>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            {/* Optional Details Section */}
            <details className="optional-section" open={optionalOpen} onToggle={(e) => setOptionalOpen(e.target.open)}>
              <summary>Additional Details (Optional)</summary>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </div>

              <div className="form-group">
                <label>Preferred Language</label>
                <input
                  type="text"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  placeholder="e.g., English, Telugu"
                />
              </div>

              <div className="form-group">
                <label>Organization/Company</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="form-group">
                <label>Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Java, Python, React"
                />
              </div>

              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label>Highest Qualification</label>
                <input
                  type="text"
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>
            </details>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            {/* Message Display */}
            {message.text && (
              <div className={`msg ${message.type}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* RIGHT SIDE - PROMOTIONAL CARD */}
        <div className="signup-right">
          <div className="register-card">
            <h2>Welcome to Our Platform!</h2>
            <p>Join our community of learners and professionals. Get access to exclusive courses, resources, and networking opportunities.</p>
            <button onClick={() => navigate('/login')}>
              Already have an account? Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;