import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const StreakIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 
      2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export const MobileNavbar = () => {
  const { stats } = useUser();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b p-3 
      flex items-center justify-between shadow-sm">

      {/* Left — Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Moofli Logo" className="h-10 w-10 object-contain" />
        <h1 className="text-2xl font-extrabold text-green-700 tracking-wide font-['Fredoka_One',_cursive]">
          Moofli
        </h1>
      </Link>

      {/* Right — Streak */}
      <div className="flex items-center gap-1 font-bold text-orange-500 text-lg">
        <StreakIcon className="h-6 w-6" />
        <span>{stats?.streakCount ?? "..."}</span>
      </div>
    </div>
  );
};
