import React, { useEffect, useState,useCallback } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { Sidebar } from "../../component/sideBar/sideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { BottomNav } from "../../component/Navbar/BottomNav";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";

export default function StoryVideoPage() {
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  // Gallery state
  const [oldVideos, setOldVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Options
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [template, setTemplate] = useState("basic");

  // Fetch paginated videos
  const fetchVideos = useCallback(async (p = 1) => {
  if (!user?._id) return;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/story/videos`, {
      params: { userId: user._id, page: p, limit: 5 }
    });

    setOldVideos(res.data.videos || []);
    setTotalPages(res.data.totalPages || 1);
    setPage(res.data.currentPage || p);
  } catch (err) {
    console.error("fetch videos", err);
  }
}, [user?._id]);


  useEffect(() => {
  if (user?._id) fetchVideos(1);
}, [user?._id, fetchVideos]);

useEffect(() => {
  if (user?._id) fetchVideos(page);
}, [page, user?._id, fetchVideos]);


  // Generate Video
  const handleGenerate = async () => {
    if (!user?._id) return toast.error("Please login first");

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const payload = {
        userId: user._id,
        from: from || undefined,
        to: to || undefined,
        template
      };

      const res = await axios.post(`${API_BASE_URL}/api/story/generate`, payload, {
        timeout: 130000
      });

      setVideoUrl(res.data.videoUrl);
      toast.success("Video generated!");

      fetchVideos(1); // reload gallery
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message);
      toast.error("Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  // Delete Video
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video permanently?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/story/delete/${id}`);
      toast.success("Deleted");

      setOldVideos(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // Rename video
  const handleRename = async (id, currentTitle) => {
    const newTitle = prompt("Enter new title:", currentTitle || "");
    if (!newTitle.trim()) return;

    try {
      const res = await axios.put(`${API_BASE_URL}/api/story/rename/${id}`, {
        title: newTitle.trim(),
      });

      toast.success("Renamed!");

      setOldVideos(prev =>
        prev.map(v => (v._id === id ? res.data : v))
      );
    } catch (err) {
      console.error(err);
      toast.error("Rename failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <div className="hidden lg:block"><Sidebar /></div>
      <MobileNavbar />

      {/* MAIN CONTAINER */}
      <main className=" p-4 md:p-6 lg:pl-[256px] lg:pr-[256px] max-w-5xl mx-auto">


        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Create Story Video</h1>

        {/* OPTIONS CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
          <p className="mb-4 text-slate-600 text-sm md:text-base">
            Turn your diary entries into an animated MP4 video — with templates,
            date range selection, and downloadable output.
          </p>

          {/* Template + Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Template */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Template</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="basic">Basic Slideshow</option>
                <option value="reels">Reels Style (Crossfade)</option>
              </select>
            </div>

            {/* From */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">From</label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            {/* To */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">To</label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white w-full md:w-auto ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {loading ? "Generating..." : "Generate Story Video"}
            </button>
          </div>

          {/* Error */}
          {error && <div className="mt-4 text-red-600">{error}</div>}

          {/* Video Output */}
          {videoUrl && (
            <div className="mt-6">
              <video controls src={videoUrl} className="w-full rounded-lg" />
              <a
                href={videoUrl}
                download
                className="inline-block mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg"
              >
                Download MP4
              </a>
            </div>
          )}
        </div>

        {/* GALLERY */}
        {oldVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-5">Your Story Videos</h2>

            <div className="space-y-6">
              {oldVideos.map((video) => (
                <div key={video._id} className="bg-white p-5 rounded-2xl shadow">

                  {/* Title */}
                  <h3 className="font-medium mb-2">{video.title}</h3>

                  {/* Video */}
                  <video controls src={video.videoUrl} className="w-full rounded-lg mb-3" />

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    <a
                      href={video.videoUrl}
                      download
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm"
                    >
                      Download
                    </a>

                    <button
                      onClick={() => handleRename(video._id, video.title)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
                    >
                      Rename
                    </button>

                    <button
                      onClick={() => handleDelete(video._id)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Created on {new Date(video.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        )}
      </main>

      <div className="hidden lg:block"><RightSidebar /></div>
      <BottomNav />
    </div>
  );
}
