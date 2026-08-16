// Shared profile photo storage so the navbar/profile menu stay in sync
// with the photo picked at registration or updated from the profile page.
import { useEffect, useState } from "react";

export const PROFILE_PHOTO_EVENT = "profilePhotoUpdated";
const PHOTO_KEY = "profilePhoto";

const readUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "{}");
  } catch {
    return {};
  }
};

export const getProfilePhoto = () => {
  const userData = readUserData();
  return userData.profilePhoto || localStorage.getItem(PHOTO_KEY) || "";
};

export const setProfilePhoto = (photo) => {
  const userData = readUserData();

  if (photo) {
    localStorage.setItem(PHOTO_KEY, photo);
    userData.profilePhoto = photo;
  } else {
    localStorage.removeItem(PHOTO_KEY);
    delete userData.profilePhoto;
  }

  localStorage.setItem("userData", JSON.stringify(userData));
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_EVENT, { detail: photo || "" }));
};

export const clearProfilePhoto = () => {
  localStorage.removeItem(PHOTO_KEY);
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_EVENT, { detail: "" }));
};

// Reads an image file and resizes it so it fits comfortably in localStorage.
export const readImageAsDataUrl = (file, maxSize = 512) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load the selected image"));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

export const useProfilePhoto = () => {
  const [photo, setPhoto] = useState(getProfilePhoto);

  useEffect(() => {
    const sync = () => setPhoto(getProfilePhoto());
    const handleStorage = (e) => {
      if (e.key === PHOTO_KEY || e.key === "userData" || e.key === null) sync();
    };

    window.addEventListener(PROFILE_PHOTO_EVENT, sync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(PROFILE_PHOTO_EVENT, sync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return photo;
};
