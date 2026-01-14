// src/component/Navbar/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // <-- 1. Import useUser

const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- Icon components (assuming they are defined above) ---

const DiaryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const SharedIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const ShopIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const ProfileIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 20c0-3.333 2.667-6 6-6s6 2.667 6 6"/>
  </svg>
);
// --- End of Icon components ---


export const BottomNav = () => {
  const { user } = useUser(); // <-- 2. Get user from context

  // 3. Remove Profile from the static array
  const navItems = [
    { label: "Diary", href: "/homepage", Icon: DiaryIcon },
    { label: "Capsule", href: "/record", Icon: SharedIcon },
    { label: "Shared diary", href: "/shareddiary", Icon: ShopIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-40">
      {/* Map the first 3 items */}
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center text-sm font-medium",
              isActive ? "text-green-600" : "text-slate-500"
            )
          }
        >
          <item.Icon />
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}

      {/* 4. Add the Profile NavLink with conditional logic */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center text-sm font-medium",
            isActive ? "text-green-600" : "text-slate-500"
          )
        }
      >
        {/* Check if user exists and has a profilePicture */}
        {user && user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover" // Style to match icon size
            referrerPolicy="no-referrer"
          />
        ) : (
          <ProfileIcon /> // Fallback to default icon
        )}
        <span className="text-xs">Profile</span>
      </NavLink>
    </div>
  );
};