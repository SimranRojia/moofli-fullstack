import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../component/buttons/button'; // Adjust path if needed

// --- A theme-matching icon for "work in progress" ---
const ToolsIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7l-5.1 5.1c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L11 12"/>
        <path d="m18 11 2.1-2.1c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0L14 7"/>
        <path d="m14 7-2.1 2.1"/>
        <path d="m7 7-2.1 2.1"/>
        <path d="m18 11-2.1 2.1"/>
        <path d="m7 12 5-5"/>
        <path d="m17 17-5-5"/>
    </svg>
);


function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
        <div className="max-w-md">
            <ToolsIcon className="w-24 h-24 text-slate-300 mx-auto mb-6"/>
            <h1 className="text-4xl font-extrabold text-slate-800 font-['Fredoka_One',_cursive]">
                Coming Soon!
            </h1>
            <p className="mt-4 text-slate-500">
                Our team is working hard to bring you this exciting new feature. Please check back later!
            </p>
            <div className="mt-8">
                <Link to="/homepage">
                    <Button variant="secondary" rounded className="px-6">
                        Back to My Diary
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}

export default ComingSoonPage;
