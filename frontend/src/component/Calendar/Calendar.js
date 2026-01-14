import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import axios from 'axios'; // ⬅️ Import axios
import { API_BASE_URL } from '../../config'; // ⬅️ Import the base URL (path may vary)

// A simple utility to merge class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

const ChevronLeftIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRightIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const CheckIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;

export const Calendar = () => {
    // 1. Default to the CURRENT date
    const [date, setDate] = useState(new Date()); 
    // 2. State to hold completed days from API
    const [completedDays, setCompletedDays] = useState([]);
    
    // 3. Get user from context
    const { user } = useUser();
    // Get dynamic userId from user object
    const userId = user ? user._id : null;
    
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const daysOfWeek = ['S','M','T','W','T','F','S'];

    // 4. Fetch data when the component mounts or the displayed month/year changes
   useEffect(() => {
        const fetchCalendarData = async () => {
            // This check now works! It will wait until user is loaded.
            if (!userId) return; 
            
            const month = date.getMonth();
            const year = date.getFullYear();
            
            try {
                // ⬇️ Use axios and the full API_BASE_URL
                const res = await axios.get(`${API_BASE_URL}/api/diary/calendar`, {
                  params: { userId, month, year }
                });
                setCompletedDays(res.data); // ⬅️ Get data from res.data
            } catch (error) {
                console.error("Error fetching calendar:", error);
                setCompletedDays([]);
            }
        };
        
        fetchCalendarData();
    }, [date, userId]); // Re-run if 'date' (month/year) or 'userId' changes

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const handlePrevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    const handleNextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    
    const today = new Date(); // For highlighting today
    
    return (
        <div className="bg-white border-2 border-slate-200/80 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 transition-colors"><ChevronLeftIcon className="h-6 w-6 text-slate-500"/></button>
                <h3 className="font-bold text-xl font-['Fredoka_One',_cursive] text-slate-700">{monthNames[date.getMonth()]} {date.getFullYear()}</h3>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 transition-colors"><ChevronRightIcon className="h-6 w-6 text-slate-500"/></button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-bold text-slate-400">
                {daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2 mt-2 text-center text-slate-600 font-semibold">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: totalDays }).map((_, day) => {
                    const dayNumber = day + 1;
                    
                    // 5. Updated checks
                    const isToday = dayNumber === today.getDate() && 
                                  date.getMonth() === today.getMonth() &&
                                  date.getFullYear() === today.getFullYear();
                                  
                    const isCompleted = completedDays.includes(dayNumber);
                    
                    return (
                        <div key={dayNumber} className="flex justify-center items-center h-9">
                           <div className={cn("h-9 w-9 rounded-full flex items-center justify-center transition-all",
                                isToday && "bg-green-500 text-white shadow-md", // Today's style
                                isCompleted && !isToday && "bg-sky-400/80 text-white", // Completed (not today)
                                !isToday && !isCompleted && "hover:bg-slate-100" // Default
                           )}>
                                {/* Show check if completed, *unless* it's also today */}
                                {(isCompleted && !isToday) ? <CheckIcon className="h-5 w-5"/> : dayNumber}
                           </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};