// src/components/LogoutDevice.jsx
import { useState } from "react";
import { toast } from "sonner";

const LogoutDevice = ({ sessionId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogoutDevice = async () => {
    if (!sessionId) {
      toast.error("Invalid session ID");
      return;
    }

    setLoading(true);

    try {
      // Try both token keys
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(
        `https://matted-ascent-specimen.ngrok-free.dev/auth/sessions/${sessionId}`,
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
        throw new Error(data?.message || "Failed to logout device");
      }

      toast.success(data?.message || "Device logged out successfully");
      
      // Refresh the list after logout
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error("LOGOUT DEVICE ERROR:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogoutDevice}
      disabled={loading}
      className="btn-logout-device"
      style={{
        padding: "6px 12px",
        background: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "13px",
      }}
    >
      {loading ? "Logging out..." : "Logout Device"}
    </button>
  );
};

export default LogoutDevice;