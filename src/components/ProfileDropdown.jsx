import React, { useState } from "react";
import { FaUserAlt, FaSignOutAlt } from "react-icons/fa"; // Icons for profile and logout
import { useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login-page"); // Redirect to login page after logout
  };

  return (
    <div className="relative inline-block text-left ps-2">
      {/* Profile Icon */}
      <button
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-300 text-white hover:bg-yellow-600"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaUserAlt className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-30 shadow-lg bg-white focus:outline-none">
          <div className="py-1">
            {/* My Account Option */}
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
              onClick={() => navigate("/account")} // Link to account settings page
            >
              My Account
            </button>
            {/* Settings Option */}
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/settings")} // Link to settings page
            >
              Settings
            </button>
           
            {/* Logout Option */}
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-2 inline-block" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
