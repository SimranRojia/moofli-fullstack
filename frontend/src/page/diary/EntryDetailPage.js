import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Sidebar } from "../../component/sideBar/sideBar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import EntryNotFoundPage from "../notfoundpage/entryNotfound";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { BottomNav } from "../../component/Navbar/BottomNav";
import { getMoodFromGemini } from "../../utils/getMoodFromGemini";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import imageCompression from 'browser-image-compression';
import { useUser } from "../../context/UserContext"; // ⬅️ 1. IMPORT THE HOOK
import toast from "react-hot-toast";

// --- Icons (no change) ---
const BackIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const EditIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const DeleteIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18" />
    <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
    <path d="M10 10v6" />
    <path d="M14 10v6" />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);


function EntryDetailPage({ entries, setEntries }) {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { refetchStats } = useUser(); // ⬅️ 2. GET THE FUNCTION

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [images, setImages] = useState([]); // Will hold old {url} and new {File}
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setEditedTitle(entry.title);
      setEditedContent(entry.content);
      setImages(entry.images || []);
    }
  }, [entry]);

  // Dropzone for editing images
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setImages((prev) => [...prev, ...newImages]); 
    },
  });
  
  const removeImage = (indexToRemove) => {
    const img = images[indexToRemove];
    // Revoke object URL if it's a new file preview
    if (img.preview) {
      URL.revokeObjectURL(img.preview);
    }
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };


  // Fetch diary entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const existingEntry = entries.find((e) => e._id === entryId);
        if (existingEntry) {
          setEntry(existingEntry);
        } else {
          const res = await axios.get(`${API_BASE_URL}/api/diary/${entryId}`);
          setEntry(res.data);
        }
      } catch (err) {
        console.error("Error fetching diary entry:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [entryId, entries]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!entry) return <EntryNotFoundPage />;

  // --- Edit handler ---
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      const detectedMood = await getMoodFromGemini(editedContent);
      
      const formData = new FormData();
      formData.append('title', editedTitle);
      formData.append('content', editedContent);
      formData.append('mood', detectedMood);

      const newImageFiles = images.filter(img => img.preview);
      const existingImages = images.filter(img => img.url);   

      formData.append('existingImages', JSON.stringify(existingImages));

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      for (const file of newImageFiles) {
        const compressedFile = await imageCompression(file, compressionOptions);
        formData.append('images', compressedFile, compressedFile.name);
      }

      const res = await axios.put(
        `${API_BASE_URL}/api/diary/${entry._id}`, 
        formData
      );

      const updatedEntry = res.data.diary;
      setEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e._id === entry._id ? updatedEntry : e))
      );
      
      refetchStats(); // ⬅️ 3. CALL REFETCH ON SAVE
      toast.success("Changes saved!", { id: toastId });
      setIsEditOpen(false);
    } catch (err) {
      console.error("Error updating entry:", err);
      toast.error("Failed to save changes.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };
  
  // --- Delete handler ---
  const handleDelete = () => {
     toast(
      (t) => (
        <div className="flex flex-col gap-y-3">
          <span className="font-semibold">Are you sure?</span>
          <span>This entry will be permanently deleted.</span>
          <div className="flex gap-x-3">
            <button
              className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={async () => {
                toast.dismiss(t.id);
                const deleteToastId = toast.loading("Deleting entry...");
                try {
                  await axios.delete(`${API_BASE_URL}/api/diary/${entry._id}`);
                  setEntries((prev) => prev.filter((e) => e._id !== entry._id));
                  refetchStats(); // ⬅️ 4. CALL REFETCH ON DELETE
                  toast.success("Entry deleted!", { id: deleteToastId });
                  navigate("/homepage");
                } catch (err) {
                  console.error("Error deleting entry:", err);
                  toast.error("Failed to delete entry.", { id: deleteToastId });
                }
              }}
            >
              Delete
            </button>
            <button
              className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };


  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileNavbar />
      <div className="hidden lg:block">
        <RightSidebar />
      </div>
      <BottomNav />

      <main className="flex-1 lg:pl-[256px] lg:pr-[340px] p-4 sm:p-8 relative">
        <button
          onClick={() => navigate("/homepage")}
          className="flex items-center gap-x-2 text-slate-500 font-semibold hover:text-green-500 mb-8 transition-colors"
        >
          <BackIcon className="w-5 h-5" /> Back to Diary
        </button>


        <article className="relative max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <button
            onClick={handleDelete} // Use the new handler
            className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold font-['Fredoka_One',_cursive] text-slate-800 leading-tight">
            {entry.title}
          </h1>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            {new Date(entry.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="mt-8 text-slate-700 text-lg leading-relaxed whitespace-pre-line">
            {entry.content}
          </p>
          {entry.images && entry.images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {entry.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url || img.preview} // Handles both old and new
                  alt={`Diary ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow"
                />
              ))}
            </div>
          )}
        </article>
      </main>

      {/* Edit floating button */}
      <motion.button
        onClick={() => setIsEditOpen(true)}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-[380px] bg-green-400 hover:bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <EditIcon className="w-7 h-7" />
      </motion.button>

      {/* Edit modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 m-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Edit Entry</h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full border rounded-lg p-2 mb-4 text-lg"
                placeholder="Edit title"
              />
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full border rounded-lg p-2 h-40 mb-4"
                placeholder="Edit content"
              />

              <div
                {...getRootProps()}
                className="border-2 border-dashed border-slate-300 p-4 rounded-lg cursor-pointer text-center mb-4"
              >
                <input {...getInputProps()} />
                <p className="text-slate-500">
                  Drag & drop images here, or click to select
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.preview || img.url}
                        alt={`Preview ${idx}`}
                        className="w-full h-32 object-cover rounded-lg shadow"
                      />
                       <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EntryDetailPage;