import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, apiUtils } from "../services/api";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    city: "",
    state: "",
    country: "",
    organization: "",
    profilePhoto: "",
  });

  useEffect(() => {
    // Check if user is authenticated
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
        setProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
          dob: userData.dob || "",
          city: userData.city || "",
          state: userData.state || "",
          country: userData.country || "",
          organization: userData.organization || "",
          profilePhoto: userData.profilePhoto || "",
        });
        
        // Store in localStorage for backup
        localStorage.setItem("userData", JSON.stringify(userData));
      } else if (response.statusCode === 401) {
        apiUtils.clearAuth();
        navigate("/login");
      } else {
        console.error("Failed to load profile:", response.message);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  if (loading) {
    return (
      <div className="profile-container">
        
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>

        <div className="profile-header">
          <div className="profile-photo-wrapper">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt="Profile" className="profile-photo-large" />
            ) : (
              <div className="profile-photo-placeholder">
                {profile.firstName && profile.lastName ? (
                  <span>{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</span>
                ) : (
                  <span>👤</span>
                )}
              </div>
            )}
          </div>
          
          <div className="profile-name-section">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="profile-email">{profile.email}</p>
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="info-card">
            <div className="info-icon">📱</div>
            <div className="info-details">
              <label>Mobile Number</label>
              <p>{profile.mobile || "Not provided"}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🎂</div>
            <div className="info-details">
              <label>Date of Birth</label>
              <p>{profile.dob || "Not provided"}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-details">
              <label>Location</label>
              <p>
                {profile.city || profile.state || profile.country ? (
                  <>
                    {profile.city && <span>{profile.city}</span>}
                    {profile.city && profile.state && <span>, </span>}
                    {profile.state && <span>{profile.state}</span>}
                    {(profile.city || profile.state) && profile.country && <span>, </span>}
                    {profile.country && <span>{profile.country}</span>}
                  </>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🏢</div>
            <div className="info-details">
              <label>Organization</label>
              <p>{profile.organization || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="edit-button-container">
          <button className="btn-edit" onClick={handleEditProfile}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;