import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from "../../context/UserContext";

const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- Icon components ---
const LearnIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const LeaderboardIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>);
const QuestIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>);
const ShopIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>);
const LogoutIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
const SettingsIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);

// --- 1. ADDED ProfileIcon ---
const ProfileIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c0-3.333 2.667-6 6-6s6 2.667 6 6" />
    </svg>
);


// --- Reusable SidebarItem Component ---
const SidebarItem = ({ label, href, Icon, onClick }) => {
    // ... (no changes in this component)
    if (href) {
        return (
            <NavLink
                to={href}
                className={({ isActive }) => cn(
                    "flex items-center text-lg justify-start h-[52px] rounded-xl font-bold p-4 transition-colors",
                    isActive
                        ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" // Active state
                        : "text-slate-500 hover:bg-slate-100" // Inactive state
                )}
            >
                <Icon className="mr-5 h-8 w-8" />
                {label}
            </NavLink>
        );
    }
    return (
        <button
            onClick={onClick}
            className="flex items-center text-lg justify-start h-[52px] rounded-xl font-bold p-4 transition-colors text-slate-500 hover:bg-slate-100 w-full"
        >
            <Icon className="mr-5 h-8 w-8" />
            {label}
        </button>
    );
};

// --- Main Sidebar Component ---
export const Sidebar = ({ className }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        // ... (no changes in this function)
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        setMenuOpen(false);
        navigate("/login");
    };

    const sidebarItems = [
        { label: "My Diary", href: "/homepage", Icon: LearnIcon },
        { label: "Shared Diary", href: "/shareddiary", Icon: LeaderboardIcon },
        { label: "Dairy Capsule", href: "/record", Icon: LeaderboardIcon },
        { label: "Quest", href: "/quest", Icon: QuestIcon },
        { label: "Shop", href: "/shop", Icon: ShopIcon },
    ];

    if (user?.isAdmin) {
        sidebarItems.push({
            label: "Admin Panel",
            href: "/admin",
            Icon: SettingsIcon,
        });
        sidebarItems.push({
            label: "Story Pro",
            href: "/storyCreation",
            Icon: SettingsIcon,
        });
        sidebarItems.push({
            label: "Diary Para",
            href: "/diary-history",
            Icon: SettingsIcon,
        });
    }

    // --- 2. REMOVED UserButtonPlaceholder ---
    // (We will use ProfileIcon instead)

    return (
        <div className={cn(
            "flex flex-col h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2",
            className
        )}>
            <Link to="/" className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                {/* ... (no changes to logo) */}
                <img
                    src="/logo.png"
                    alt="Moofli Logo"
                    height={60}
                    width={60}
                    className="h-[60px] w-[60px] object-contain"
                />
                <h1 className="text-4xl font-extrabold text-green-700 tracking-wide font-['Fredoka_One',_cursive]">Moofli</h1>
            </Link>

            <div className="flex flex-col gap-y-2 flex-1">
                {sidebarItems.map((item) => (
                    <SidebarItem key={item.label} {...item} />
                ))}
            </div>

            {/* --- REBUILT PROFILE SECTION --- */}
            <div className="p-4 relative">
                {/* --- Popup Menu --- */}
                {menuOpen && (
                    <div
                        className="absolute bottom-16 left-4 w-[220px] bg-white rounded-xl shadow-xl overflow-hidden border z-50"
                        onMouseLeave={() => setMenuOpen(false)}
                    >
                        {/* ... (no changes to menu content) */}
                        {user && (
                            <div className="p-3 border-b">
                                <p className="font-bold text-slate-700 truncate">{user.username}</p>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                            </div>
                        )}
                        <div className="p-1">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                <ProfileIcon className="w-5 h-5" />
                                Profile
                            </Link>
                            <Link
                                to="/settings"
                                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                <SettingsIcon className="w-5 h-5" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-red-500 font-medium hover:bg-red-50"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                {/* --- 3. UPDATED Profile Picture Button --- */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-full"
                >
                    {user && user.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover" // Added object-cover
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        // Use ProfileIcon as the fallback
                        <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                            <ProfileIcon className="w-6 h-6" />
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};