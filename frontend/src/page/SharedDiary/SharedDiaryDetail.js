import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";
import { useUser } from "../../context/UserContext";
import SharedDiaryView from "../../component/sharedDiary/SharedDiaryView";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { addEntry } from "../../api/sharedDiaryApi";
import { Sidebar } from "../../component/sideBar/sideBar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { BottomNav } from "../../component/Navbar/BottomNav";

// ✅ Reusable button
const Button = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-green-500 text-white font-semibold px-5 py-2.5 
    hover:bg-green-600 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${className}`}
    {...props}
  />
);

// ✅ Add Entry Modal
const AddEntryModal = ({ isOpen, onClose, diaryId, onEntryAdded }) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Write something or add an image!");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Posting...");

    try {
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedImages = await Promise.all(
        images.map(async (f) => {
          try {
            return await imageCompression(f, compressionOptions);
          } catch {
            return f;
          }
        })
      );

      const res = await addEntry(diaryId, {
        content,
        mood: "neutral",
        images: compressedImages,
      });

      toast.success("Entry added!", { id: toastId });
      setContent("");
      setImages([]);
      onEntryAdded(res);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add entry.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 mx-4 border border-slate-200"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h2 className="text-2xl font-bold text-slate-800">New Entry</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              placeholder="Write your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl p-3 min-h-[140px] text-slate-700 focus:ring-2 focus:ring-green-300 focus:outline-none resize-none"
            />

            {/* Upload zone */}
            <div
              {...getRootProps()}
              className={`mt-5 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-green-400 bg-green-50"
                  : "border-slate-300 hover:border-green-300 hover:bg-green-50/20"
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-green-600 font-medium">
                  Drop your images here...
                </p>
              ) : (
                <p className="text-slate-500">
                  Drag & drop or click to select images
                </p>
              )}
            </div>

            {/* Image preview */}
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 justify-start">
                {images.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md border border-slate-200"
                  >
                    <img
                      src={file.preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "Posting..." : "Post"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ✅ Main Shared Diary Detail Page
export default function SharedDiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [showModal, setShowModal] = useState(false);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Please log in.
      </div>
    );

  const me = { id: user._id, username: user.username, email: user.email };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar />

      {/* Main Content */}
      <main className="lg:pl-[256px] lg:pr-[340px] p-4 sm:p-8 flex flex-col min-h-screen transition-all">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-md px-5 py-3 mb-5 sticky top-2 z-30 border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/shareddiary")}
              className="p-2 rounded-full hover:bg-slate-100 transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="font-bold text-xl text-slate-800">
              Shared Diary
            </h2>
          </div>
        </div>

        {/* Diary Content */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white shadow-md border border-slate-200 p-5 md:p-8">
          <SharedDiaryView diaryId={id} me={me} />
        </div>
      </main>

      {/* Floating Add Entry Button */}
      <motion.div
        className="fixed bottom-20 right-6 z-50 lg:bottom-10 lg:right-[360px]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      >
        <Button
          onClick={() => setShowModal(true)}
          className="!rounded-full !w-16 !h-16 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Modal */}
      <AddEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        diaryId={id}
        onEntryAdded={() => {}}
      />

      {/* Right Sidebar */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      {/* Bottom Navigation (mobile) */}
      <BottomNav />
    </div>
  );
}
