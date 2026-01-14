import React from 'react';

// A simple object to map mood strings to emoji icons for display.
const moodIcons = {
  happy: '😊',
  good: '😊',
  content: '😊',
  pleased: '😊',
  positive: '😊',
  great: '😊',
  sad: '😢',
  unhappy: '😢',
  down: '😢',
  anxious: '😢',
  worried: '😢',
  bad: '😢',
  angry: '😠',
  depressed: '😠',
  furious: '😠',
  miserable: '😠',
  neutral: '😐',
  okay: '😐',
  normal: '😐',
  fine: '😐',
  excited: '🤩',
  joyful: '🤩',
  ecstatic: '🤩',
  amazing: '🤩',
  wonderful: '🤩',
  calm: '😌',
};

const CardButton = ({ title, date, mood, isLoading }) => {
  // Renders a fallback or null to avoid a broken UI if essential props are missing.
  if (!title || !date) {
    console.error("CardButton is missing required props: title or date.");
    return null; 
  }

  return (
    <button
      className={`
        relative w-full text-left p-6 bg-white rounded-2xl 
        border border-gray-200/80 shadow-sm 
        hover:border-blue-300 hover:shadow-md 
        transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        ${isLoading ? 'animate-pulse' : ''}
      `}
      disabled={isLoading}
    >
      {/* Mood Icon - Displays after ML detection */}
      <div className="absolute top-4 right-4 text-2xl">
        {isLoading ? '...' : (mood && moodIcons[mood] ? moodIcons[mood] : ' ')}
      </div>
      
      {/* Content Section */}
      <div>
        <h3 className="font-bold text-lg text-gray-800 pr-10">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{date}</p>
      </div>
    </button>
  );
};

export { CardButton, moodIcons };
