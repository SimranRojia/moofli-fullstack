import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";
import { Sidebar } from "../../component/sideBar/sideBar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { BottomNav } from "../../component/Navbar/BottomNav";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Helper Functions for Mood Calculation ---

// 1. UPDATED: Maps mood *strings* to a numerical score
const moodMap = {
  // Positive (2)
  "ecstatic": 2, "joyful": 2, "excited": 2, "amazing": 2, "wonderful": 2,
  // Positive (1)
  "happy": 1, "good": 1, "content": 1, "pleased": 1, "positive": 1, "great": 1,
  // Neutral (0)
  "neutral": 0, "okay": 0, "calm": 0, "normal": 0, "fine": 0,
  // Negative (-1)
  "sad": -1, "unhappy": -1, "down": -1, "anxious": -1, "worried": -1, "bad": -1,
  // Very Negative (-2)
  "angry": -2, "terrible": -2, "awful": -2, "miserable": -2, "depressed": -2, "furious": -2,
};

// 2. UPDATED: Gets score from string, defaulting to 0
const getMoodScore = (moodString) => {
  if (!moodString) return 0; // Handle null/undefined moods
  const mood = moodString.toLowerCase().trim();
  // Check if mood exists in the map, otherwise default to 0
  return moodMap.hasOwnProperty(mood) ? moodMap[mood] : 0;
};


// 3. UNCHANGED: This function is still needed for the *average*
const getEmojiForScore = (score) => {
  if (score > 1.5) return "🤩";
  if (score > 0.5) return "😊";
  if (score > -0.5) return "😐";
  if (score > -1.5) return "🙁";
  return "😢";
};

// --- Stat Card Component (UPDATED FOR RESPONSIVENESS) ---
const StatCard = ({ title, value, emoji }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center text-center sm:text-left space-y-3 sm:space-y-0 sm:space-x-4">
    {emoji && <div className="text-3xl sm:text-4xl">{emoji}</div>}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

// --- Main Diary Capsule Page ---
const DiaryCapsule = () => {
  const { user } = useUser();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    avgMoodEmoji: "😐",
    avgScore: 0, // <-- 1. Add avgScore to initial state
    happinessData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch all entries for the user
  useEffect(() => {
    if (!user?._id) return;
    setIsLoading(true);
    axios
      .get(`${API_BASE_URL}/api/diary`, { params: { userId: user._id } })
      .then((res) => {
        setEntries(res.data);
      })
      .catch((err) => {
        toast.error("Error fetching diary entries.");
        console.error("Error fetching diaries:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  // 2. Calculate statistics when entries are loaded
  useEffect(() => {
    if (entries.length === 0) {
      setStats({ 
        totalEntries: 0, 
        avgMoodEmoji: "😐", 
        avgScore: 0, // <-- 2. Reset avgScore
        happinessData: [] 
      });
      return;
    }

    // Entries are newest-first, so reverse them for chronological order
    const chronologicalEntries = [...entries].reverse();

    let totalMoodScore = 0;

    const happinessData = chronologicalEntries.map((entry, index) => {
      // This line now correctly uses the string mood from the entry
      const score = getMoodScore(entry.mood); 
      totalMoodScore += score;
      return {
        // Format date like "Nov 5"
        name: new Date(entry.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        Happiness: score,
      };
    });

    const avgScore = totalMoodScore / entries.length;
    const avgEmoji = getEmojiForScore(avgScore);

    setStats({
      totalEntries: entries.length,
      avgMoodEmoji: avgEmoji,
      avgScore: avgScore, // <-- 3. Set avgScore in state
      happinessData: happinessData,
    });
  }, [entries]);

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileNavbar />

      <main className="flex-1 lg:pl-[256px] lg:pr-[340px] p-4 sm:p-8 pb-20 lg:pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-['Fredoka_One',_cursive] text-slate-800">
          Diary Capsule
        </h1>
        <p className="mt-2 text-slate-500">
          Here's a summary of your activity and well-being.
        </p>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            Loading your stats...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl shadow-lg mt-8">
            <p className="text-lg font-medium">No data yet!</p>
            <p className="mt-2">
              Write a few diary entries to see your stats here.
            </p>
          </div>
        ) : (
          <>
            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <StatCard
                title="Total Entries"
                value={stats.totalEntries}
                emoji="📖"
              />
              <StatCard
                title="Average Mood"
                value="Overall"
                emoji={stats.avgMoodEmoji}
              />
              {/* 4. Add new StatCard for Average Score */}
              <StatCard
                title="Avg. Happiness Score"
                // Format score to 2 decimal places
                value={stats.avgScore.toFixed(2)} 
                emoji="📈"
              />
            </div>

            {/* --- Happiness Chart --- */}
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4 sm:mb-6">
                Happiness Over Time
              </h2>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={stats.happinessData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: -20, // Adjust to show Y-axis labels
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis
                      stroke="#64748b"
                      domain={[-2, 2]} // Set Y-axis from -2 to 2
                      ticks={[-2, -1, 0, 1, 2]} // Define the ticks
                      fontSize={12}
                      label={{
                        value: "Mood Score",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#64748b",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        borderColor: "#e2e8f0",
                      }}
                      labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Happiness"
                      stroke="#10b981" // Green line
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: "#10b981" }}
                      dot={{ fill: "#10b981", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>

      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      <BottomNav />
    </div>
  );
};

export default DiaryCapsule;