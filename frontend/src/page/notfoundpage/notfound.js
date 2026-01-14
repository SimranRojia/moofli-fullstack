import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../component/buttons/button'; // Assuming Button is in this path

// --- A simple, theme-matching SVG icon ---
const SadBookIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        <path d="M9 10h.01"/>
        <path d="M15 10h.01"/>
        <path d="M10 16s.5-1 2-1 2 1 2 1"/>
    </svg>
);


function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
        <div className="max-w-md">
            <SadBookIcon className="w-24 h-24 text-slate-300 mx-auto mb-6"/>
            <h1 className="text-6xl font-extrabold text-slate-800 font-['Fredoka_One',_cursive]">
                404
            </h1>
            <h2 className="mt-4 text-2xl font-bold text-slate-700">
                Oops! Page Not Found.
            </h2>
            <p className="mt-4 text-slate-500">
                It looks like the page you were looking for doesn't exist or has been moved. Don't worry, let's get you back on track!
            </p>
            <div className="mt-8">
                <Link to="/homepage">
                    <Button variant="secondary" rounded className="px-6">
                        Go to My Diary
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}

export default NotFoundPage;
