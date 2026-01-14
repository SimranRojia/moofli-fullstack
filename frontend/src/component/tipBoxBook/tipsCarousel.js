import React, { useState } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');


// --- Useful Tips Carousel with Book Style ---
const usefulTips = ["Practice a little every day to build a strong habit.","Review past entries to see how much you've progressed.","Set small, achievable goals to stay motivated.","Don't be afraid to make mistakes. They are part of learning.","Consistency is more important than perfection."];
export const TipsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    
    const handleNext = () => {
        if (isFlipping) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % usefulTips.length);
            setIsFlipping(false);
        }, 300); 
    };
    
    return (
        <div className="bg-white border-2 border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg font-['Fredoka_One',_cursive] text-slate-700">Useful Tips</h3>
                <button onClick={handleNext} className="text-sm font-bold text-green-500 hover:text-green-600 transition-colors">NEXT</button>
            </div>
            <div style={{ perspective: '1000px' }} className="h-24 flex items-center justify-center">
                <div 
                    className={cn("relative w-full h-full transition-transform duration-600", isFlipping && "transform -rotate-y-180")}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                     <div className="absolute w-full h-full backface-hidden flex items-center justify-center text-slate-500 text-center p-2 bg-slate-50 rounded-lg">
                        {usefulTips[currentIndex]}
                     </div>
                     <div className="absolute w-full h-full backface-hidden transform rotate-y-180 flex items-center justify-center text-slate-500 text-center p-2 bg-slate-50 rounded-lg">
                        {usefulTips[(currentIndex + 1) % usefulTips.length]}
                     </div>
                </div>
            </div>
        </div>
    );
};