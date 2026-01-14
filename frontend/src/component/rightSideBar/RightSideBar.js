import React from 'react';
import { TipsCarousel } from '../tipBoxBook/tipsCarousel';
import { Calendar } from '../Calendar/Calendar';
import { UpgradePro } from '../upgradeToPro/upgradeToPro';
import { useUser } from '../../context/UserContext';

const StreakIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
);
const XPIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
        <path d="m13 2-3 14h3l-3 6 3-10h-3l3-10z"/>
    </svg>
);

const StatusBar = ({ streakCount, xpCount }) => (
    <div className="flex items-center justify-end gap-x-6 p-2 h-[52px]">
        {/* ... (LanguageIcon) ... */}
        <div className="flex items-center gap-x-1.5 font-bold text-slate-500 text-lg">
            <XPIcon className="h-7 w-7"/>
            <span>{xpCount === null ? '...' : xpCount}</span>
        </div>
        <div className="flex items-center gap-x-1.5 font-bold text-orange-400 text-lg">
            <StreakIcon className="h-7 w-7" />
            <span>{streakCount === null ? '...' : streakCount}</span>
        </div>
    </div>
);

export const RightSidebar = () => {
    // 1. Get stats directly from the context
    const { stats } = useUser(); // ⬅️ THIS IS IT!

    // 2. All the old useState and useEffect logic is removed.

    return (
        <aside className="hidden lg:flex flex-col h-full w-[340px] fixed right-0 top-0 p-4 border-l-2 bg-slate-100/50 space-y-4">
            {/* 3. Pass the context stats to StatusBar */}
            <StatusBar streakCount={stats.streakCount} xpCount={stats.xpCount} />
            <UpgradePro />
            <Calendar />
            <TipsCarousel />
        </aside>
    );
};