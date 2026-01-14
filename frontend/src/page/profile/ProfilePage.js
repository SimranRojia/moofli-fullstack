import React, { useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Sidebar } from "../../component/sideBar/sideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useUser } from "../../context/UserContext";
import { BottomNav } from "../../component/Navbar/BottomNav";
import { Link } from "react-router-dom";

const defaultAvatar = "/default-avatar.png";

export default function ProfilePage() {
  const { user, setUser } = useUser();

  const [username, setUsername] = useState(user?.username || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture);

  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");

  const token = localStorage.getItem("token");

  // ------------------------
  // FORM STATE TRACKERS
  // ------------------------
  const isProfileDirty = useMemo(() => {
    return (
      username.trim() !== (user?.username || "").trim() ||
      profilePicture !== user?.profilePicture
    );
  }, [username, profilePicture, user]);

  const canChangePassword =
    currentPassword.length > 0 && newPassword.length >= 6;

  // ------------------------
  // UPDATE USERNAME
  // ------------------------
  const updateProfile = async () => {
    if (!isProfileDirty) return;

    try {
      toast.loading("Updating profile...");
      const res = await axios.put(
        `${API_BASE_URL}/api/profile/update`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.dismiss();
      toast.success("Profile updated!");
    } catch {
      toast.dismiss();
      toast.error("Error updating profile");
    }
  };

  // ------------------------
  // UPDATE PASSWORD
  // ------------------------
  const updatePassword = async () => {
    if (!canChangePassword) return;

    try {
      toast.loading("Updating password...");

      const res = await axios.put(
        `${API_BASE_URL}/api/profile/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.dismiss();
      toast.success(res.data.message);
      setCurrent("");
      setNew("");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  // ------------------------
  // UPDATE PROFILE PICTURE
  // ------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.loading("Uploading image...");

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
    });

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      await axios.put(
        `${API_BASE_URL}/api/profile/update-picture`,
        { imageUrl: base64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfilePicture(base64);

      const updated = { ...user, profilePicture: base64 };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      toast.dismiss();
      toast.success("Profile picture updated!");
    };

    reader.readAsDataURL(compressed);
  };

  // ------------------------
  // LOGOUT
  // ------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    window.location.href = "/login";
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar (Desktop Only) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileNavbar />
      <BottomNav />

      <main className="lg:pl-[256px] p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-lg mt-6 bg-white p-8 rounded-2xl shadow-lg border">

          {/* Title */}
          <h1 className="text-4xl font-['Fredoka_One'] text-center text-slate-800 mb-6">
            My Profile
          </h1>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <label className="cursor-pointer">
              <img
                src={profilePicture || defaultAvatar}
                className="w-32 h-32 rounded-full border object-cover shadow"
                alt="Profile"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            <p className="text-sm text-slate-500 mt-2">
              Tap to update profile picture
            </p>
          </div>

          {/* Username */}
          <div className="mb-8">
            <label className="block mb-2 font-semibold">Username</label>

            <input
              className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button
              onClick={updateProfile}
              disabled={!isProfileDirty}
              className={`mt-3 px-5 py-2 rounded-xl font-semibold shadow w-full
                ${
                  isProfileDirty
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Save Changes
            </button>
          </div>

          {/* Password */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Change Password</h2>

            <input
              type="password"
              placeholder="Current Password"
              className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl mb-3"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl mb-3"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
            />

            <button
              onClick={updatePassword}
              disabled={!canChangePassword}
              className={`px-5 py-2 rounded-xl font-semibold shadow w-full
                ${
                  canChangePassword
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Change Password
            </button>
          </div>
          <div className="flex justify-end mt-1">
  <Link
    to="/forgot-password"
    className="text-sm text-blue-600 hover:underline font-semibold"
  >
    Forgot Password?
  </Link>
</div>


          <hr className="my-6" />

          {/* Mobile Only: Admin + Logout */}
          <div className="flex flex-col gap-3 lg:hidden mt-6">
            {user?.isAdmin && (
              <button
                className="w-full bg-purple-600 text-white py-2 rounded-xl shadow font-semibold hover:bg-purple-700"
                onClick={() => (window.location.href = "/admin")}
              >
                Go to Admin Panel
              </button>
            )}
            {user?.isAdmin && (
              <button
                className="w-full bg-purple-600 text-white py-2 rounded-xl shadow font-semibold hover:bg-purple-700"
                onClick={() => (window.location.href = "/storyCreation")}
              >
                Go to Story Create
              </button>
            )}
            {user?.isAdmin && (
              <button
                className="w-full bg-purple-600 text-white py-2 rounded-xl shadow font-semibold hover:bg-purple-700"
                onClick={() => (window.location.href = "/diary-history")}
              >
                Go to dairy Pro
              </button>
            )}

            <button
              className="w-full bg-red-500 text-white py-2 rounded-xl shadow font-semibold hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
