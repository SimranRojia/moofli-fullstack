import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useUser } from "../../context/UserContext";
import { Sidebar } from "../../component/sideBar/sideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { BottomNav } from "../../component/Navbar/BottomNav";

export default function DiaryParagraphPage() {
  const { user, loading } = useUser();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${API_BASE_URL}/api/diary/paragraph`, {
        params: { userId: user._id },
      })
      .then((res) => {
        setText(res.data.paragraph || "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [user]);

  if (loading)
    return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Sidebar (desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />

      <main className="lg:pl-[256px] lg:pr-[320px] p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Diary History</h1>
        <p className="text-slate-500 mb-6">
          This is a compact version of all your diary entries so far.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 min-h-[300px] whitespace-pre-line">
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : !text ? (
            <p className="text-slate-400">No entries found.</p>
          ) : (
            <p className="text-slate-700 leading-relaxed">{text}</p>
          )}
        </div>
      </main>

      {/* Right Sidebar (desktop) */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      {/* Bottom Navigation (mobile) */}
      <BottomNav />
    </div>
  );
}
