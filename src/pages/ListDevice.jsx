// src/pages/ListDevice.jsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LogoutDevice from "../components/LogoutDevice";
import { useNavigate } from "react-router-dom";
import "./ListDevice.css";

const ListDevice = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Try both token keys
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      console.log("Fetching sessions with token:", token ? "Present" : "Missing");

      const res = await fetch(
        "https://matted-ascent-specimen.ngrok-free.dev/auth/sessions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("Sessions response:", data);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch sessions");
      }

      const sessionsData = data.data || data || [];
      setSessions(sessionsData);
      
      if (sessionsData.length === 0) {
        setMessage("No active sessions found");
      } else {
        setMessage(`Found ${sessionsData.length} active session(s)`);
      }
    } catch (err) {
      console.error("Fetch sessions error:", err);
      toast.error(err.message || "Error fetching sessions");
      setMessage("Failed to load sessions. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Logout from all other devices
  const handleLogoutAllOthers = async () => {
    const confirm = window.confirm("Logout from all other devices? You will stay logged in on this device.");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      const res = await fetch(
        "https://matted-ascent-specimen.ngrok-free.dev/auth/sessions",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to logout other devices");
      }

      toast.success(data?.message || "Logged out from all other devices");
      fetchSessions(); // Refresh the list
    } catch (err) {
      console.error("Logout others error:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // Logout from ALL devices (including current)
  const handleLogoutAll = async () => {
    const confirm = window.confirm("⚠️ WARNING: This will logout ALL devices including this one. You will need to login again. Continue?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      const res = await fetch(
        "https://matted-ascent-specimen.ngrok-free.dev/auth/sessions/all",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to logout all devices");
      }

      toast.success(data?.message || "Logged out from all devices");
      
      // Clear local storage and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Logout all error:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="device-container">
        
      </div>
    );
  }

  return (
    <div className="device-container">
      <div className="device-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>🔐 Your Active Devices</h1>
        <p>Manage where you're currently logged in</p>

        {message && (
          <div className={`alert ${sessions.length > 0 ? "alert-success" : "alert-info"}`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-logout-others" onClick={handleLogoutAllOthers}>
            🚪 Logout from other devices
          </button>
          <button className="btn-logout-all" onClick={handleLogoutAll}>
            ⚠️ Logout from ALL devices
          </button>
        </div>

        {/* Sessions List */}
        <div className="sessions-list">
          <h3>Active Sessions ({sessions.length})</h3>

          {sessions.length === 0 ? (
            <div className="no-sessions">
              <p>📭 No active sessions found</p>
              <small>You are only logged in on this device</small>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className={`session-item ${session.isCurrent ? "current" : ""}`}>
                <div className="session-icon">
                  {session.isCurrent ? "🟢" : "📱"}
                </div>
                <div className="session-info">
                  <div className="session-device">
                    <strong>
                      {session.deviceInfo || session.device || session.userAgent || "Unknown Device"}
                    </strong>
                    {session.isCurrent && <span className="current-badge">Current Device</span>}
                  </div>
                  <div className="session-details">
                    <span>📧 {session.email || "Unknown"}</span>
                    <span>🕐 Logged in: {formatDate(session.loginTime || session.createdAt)}</span>
                    <span>📍 IP: {session.ipAddress || session.ip || "Unknown"}</span>
                  </div>
                </div>
                {!session.isCurrent && (
                  <LogoutDevice sessionId={session.id} onSuccess={fetchSessions} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="info-box">
          <p><strong>💡 Note:</strong> "Current Device" is the device you're using right now. You cannot logout from the current device here - use the main Logout button for that.</p>
        </div>
      </div>
    </div>
  );
};

export default ListDevice;