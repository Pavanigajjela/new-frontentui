import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, apiUtils } from "../services/api";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [originalProfile, setOriginalProfile] = useState({});
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    dob: "",
    city: "",
    state: "",
    country: "",
    organization: "",
    profilePhoto: "",
  });

  useEffect(() => {
    if (!apiUtils.isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();

      if (response.success && response.data) {
        const userData = response.data;
        const profileData = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          mobile: userData.mobile || "",
          dob: userData.dob || "",
          city: userData.city || "",
          state: userData.state || "",
          country: userData.country || "",
          organization: userData.organization || "",
          profilePhoto: userData.profilePhoto || "",
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        
        if (userData.profilePhoto) {
          setPhotoPreview(userData.profilePhoto);
        }
      } else if (response.statusCode === 401) {
        apiUtils.clearAuth();
        navigate("/login");
      } else {
        setMessage({ text: response.message || "Failed to load profile", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Failed to load profile. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: "", type: "" });
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
    setShowPhotoOptions(false);
  };

  // Handle photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: "Please select a valid image file (JPEG, PNG, GIF, WEBP)", type: "error" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB", type: "error" });
      return;
    }

    // Show preview immediately with compression
    const reader = new FileReader();
    reader.onload = (event) => {
      // Create image element to check dimensions
      const img = new Image();
      img.onload = () => {
        // If image is too large, compress it
        if (img.width > 1024 || img.height > 1024) {
          compressImage(event.target.result, (compressed) => {
            setPhotoPreview(compressed);
          });
        } else {
          setPhotoPreview(event.target.result);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    try {
      setPhotoLoading(true);
      const response = await userAPI.uploadProfilePhoto(file);

      if (response.success) {
        setMessage({ text: "Profile photo updated successfully!", type: "success" });
        if (response.data?.photoUrl) {
          setProfile(prev => ({ ...prev, profilePhoto: response.data.photoUrl }));
        }
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: response.message || "Failed to upload photo", type: "error" });
        // Revert preview on error
        if (profile.profilePhoto) {
          setPhotoPreview(profile.profilePhoto);
        } else {
          setPhotoPreview(null);
        }
      }
    } catch (error) {
      setMessage({ text: "Error uploading photo. Please try again", type: "error" });
      if (profile.profilePhoto) {
        setPhotoPreview(profile.profilePhoto);
      } else {
        setPhotoPreview(null);
      }
    } finally {
      setPhotoLoading(false);
    }
  };

  // Compress image function
  const compressImage = (dataUrl, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxSize = 800;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  };

  // Remove/Reset photo
  const removePhoto = async () => {
    try {
      setPhotoLoading(true);
      // Call API to remove photo if you have this endpoint
      // const response = await userAPI.removeProfilePhoto();
      
      // For now, just clear locally
      setPhotoPreview(null);
      setProfile(prev => ({ ...prev, profilePhoto: "" }));
      setMessage({ text: "Profile photo removed", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      setShowPhotoOptions(false);
    } catch (error) {
      setMessage({ text: "Error removing photo", type: "error" });
    } finally {
      setPhotoLoading(false);
    }
  };

  // View full size photo
  const viewFullPhoto = () => {
    if (photoPreview) {
      window.open(photoPreview, '_blank');
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    // Validation
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setMessage({ text: "First and last name are required", type: "error" });
      return;
    }

    // Mobile validation (if provided)
    if (profile.mobile && !/^[0-9]{10}$/.test(profile.mobile)) {
      setMessage({ text: "Mobile number must be exactly 10 digits", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      // Only send fields that have changed
      const updateData = {};
      if (profile.firstName !== originalProfile.firstName) {
        updateData.firstName = profile.firstName.trim();
      }
      if (profile.lastName !== originalProfile.lastName) {
        updateData.lastName = profile.lastName.trim();
      }
      if (profile.mobile !== originalProfile.mobile) {
        updateData.mobile = profile.mobile;
      }
      if (profile.dob !== originalProfile.dob) {
        updateData.dob = profile.dob;
      }
      if (profile.city !== originalProfile.city) {
        updateData.city = profile.city;
      }
      if (profile.state !== originalProfile.state) {
        updateData.state = profile.state;
      }
      if (profile.country !== originalProfile.country) {
        updateData.country = profile.country;
      }
      if (profile.organization !== originalProfile.organization) {
        updateData.organization = profile.organization;
      }

      // If nothing changed
      if (Object.keys(updateData).length === 0) {
        setMessage({ text: "No changes to update", type: "info" });
        setTimeout(() => navigate("/profile"), 1500);
        return;
      }

      const response = await userAPI.updateProfile(updateData);

      if (response.success) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else if (response.statusCode === 409) {
        setMessage({ 
          text: "This mobile number is already registered with another account.", 
          type: "error" 
        });
      } else if (response.statusCode === 401) {
        apiUtils.clearAuth();
        navigate("/login");
      } else {
        setMessage({ text: response.message || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error updating profile. Please try again", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Get initials for placeholder
  const getInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return "👤";
  };

  if (loading && !profile.firstName) {
    return (
      <div className="edit-profile-container">
        
       
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-profile-header">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            ← Back to Profile
          </button>
          <h1>Edit Profile</h1>
          <p>Update your personal information and profile picture</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <span className="alert-icon">
              {message.type === 'success' ? '✓' : message.type === 'error' ? '✗' : 'ℹ'}
            </span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveChanges} className="edit-profile-form">
          {/* Professional Profile Photo Section */}
          <div className="photo-section">
            <div className="photo-editor-container">
              <div 
                className="photo-wrapper"
                onMouseEnter={() => setShowPhotoOptions(true)}
                onMouseLeave={() => setShowPhotoOptions(false)}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="profile-photo" />
                ) : (
                  <div className="photo-placeholder">
                    <span className="initials">{getInitials()}</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className={`photo-overlay ${showPhotoOptions ? 'active' : ''}`}>
                  
                  {photoPreview && (
                    <>
                      <button 
                        type="button" 
                        className="overlay-btn"
                        onClick={viewFullPhoto}
                      >
                        👁️
                      </button>
                      <button 
                        type="button" 
                        className="overlay-btn remove"
                        onClick={removePhoto}
                        disabled={photoLoading}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>

                {/* Loading Overlay */}
                {photoLoading && (
                  <div className="photo-loading-overlay">
                    
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photoLoading}
                style={{ display: 'none' }}
              />

              <div className="photo-actions">
                <button 
                  type="button" 
                  className="upload-btn"
                  onClick={triggerFileUpload}
                  disabled={photoLoading}
                >
                   Upload New Photo
                </button>
                <p className="photo-guidelines">
                  Recommended: Square JPG, PNG or GIF, at least 300x300px. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="form-sections">
            {/* Personal Information */}
            <div className="form-section">
              <h3>
                <span className="section-icon">👤</span>
                Personal Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                  />
                  <small className="field-hint">Enter only 10 digits (e.g., 9876543210)</small>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3>
                <span className="section-icon">📍</span>
                Address Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-section">
              <h3>
                <span className="section-icon">🏢</span>
                Professional Information
              </h3>
              <div className="form-group">
                <label>Organization/Company</label>
                <input
                  type="text"
                  name="organization"
                  value={profile.organization}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate("/profile")}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading || photoLoading}>
              {loading ? (
                <>
                  <span className=""></span>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;