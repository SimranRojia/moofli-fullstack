import React, { useState, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import "./App.css";
import Loading from "./component/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";

import Homepage from "./page/homepage/Homepage";
import Login from "./page/login/Login";
import EntryDetailPage from "./page/diary/EntryDetailPage";
import UnprotectedRoute from "./component/UnprotectedRoute";
import Landing from "./page/Landing/landing";
import ComingSoonPage from "./page/notfoundpage/upcomingfeature";
import { Toaster } from "react-hot-toast";
import AboutPage from "./page/aboutUs/about";
import DiaryCapsule from "./page/DiaryCapsule/DiaryCapsule";
import SharedDiaryPage from "./page/SharedDiary/SharedDiaryPage";
import SharedDiaryDetail from "./page/SharedDiary/SharedDiaryDetail";
import NotFoundPage from "./page/notfoundpage/notfound";
import AdminPanel from "./page/admin/AdminPanel";
import ProfilePage from "./page/profile/ProfilePage";
import ForgotPassword from "./page/login/ForgotPassword";
import ResetPassword from "./page/login/ResetPassword";
import DiaryParagraphPage from "./page/diary/DiaryParagraphPage";
import StoryVideoPage from "./page/storyCreation/StoryVideoPage";
// import WritePage from "./page/diary/WritePage";
// import EditEntryPage from "./page/diary/EditEntryPage";

import WelcomeTyping from "./component/WelcomeTyping";


function App() {
  const [appState, setAppState] = useState("loading");
  const [entries, setEntries] = useState([]);

  // Load saved entries
  useEffect(() => {
    const saved = localStorage.getItem("entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (newEntry) => {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === newEntry.id);
      return exists
        ? prev.map((e) => (e.id === newEntry.id ? newEntry : e))
        : [newEntry, ...prev];
    });
  };

  const handleUpdateEntry = (id, updated) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  // Loading → Welcome
  useEffect(() => {
    const timer = setTimeout(() => setAppState("welcome"), 1500);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="App">
      <Analytics />
      <Toaster position="top-center" />

      <AnimatePresence mode="wait">

        {/* Loading Screen */}
        {appState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loading />
          </motion.div>
        )}

        {/* Welcome Screen */}
        {appState === "welcome" && (
          <WelcomeTyping onFinish={() => setAppState("main")} />
        )}

        {/* Main App */}
        {appState === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Routes>
              {/* Public */}
              <Route
                path="/"
                element={<UnprotectedRoute><Landing /></UnprotectedRoute>}
              />
              <Route
                path="/login"
                element={<UnprotectedRoute><Login /></UnprotectedRoute>}
              />
              <Route path="/privacy-policy" element={<h1>Privacy Policy</h1>} />
              <Route path="/terms" element={<h1>Terms & Conditions</h1>} />

              {/* App */}
              <Route path="/homepage" element={<Homepage entries={entries} onAddEntry={handleAddEntry} />} />
              <Route path="/shareddiary" element={<SharedDiaryPage />} />
              <Route path="/shareddiary/:id" element={<SharedDiaryDetail />} />
              <Route path="/quest" element={<ComingSoonPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/record" element={<DiaryCapsule />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/settings" element={<ComingSoonPage />} />
              <Route path="/spcialspace" element={<SharedDiaryPage />} />
              <Route path="/setting" element={<ComingSoonPage />} />

              <Route
                path="/diary/:entryId"
                element={
                  <EntryDetailPage
                    entries={entries}
                    setEntries={setEntries}
                    onUpdateEntry={handleUpdateEntry}
                  />
                }
              />

              {/* <Route path="/write" element={<WritePage />} /> */}
              {/* <Route path="/edit/:id" element={<EditEntryPage />} /> */}
              <Route path="/storyCreation" element={<StoryVideoPage />} />
              <Route path="/diary-history" element={<DiaryParagraphPage />} />
              <Route path="/shop" element={<ComingSoonPage />} />
              <Route path="/about" element={<AboutPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
