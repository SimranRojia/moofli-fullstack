import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { tv } from "tailwind-variants";
import { useDropzone } from "react-dropzone";
import { Sidebar } from "../../component/sideBar/sideBar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { BottomNav } from "../../component/Navbar/BottomNav";
import { getMoodFromGemini } from "../../utils/getMoodFromGemini";
import { CardButton } from "../../component/Card/card";
import { API_BASE_URL } from "../../config";
import { useUser } from "../../context/UserContext"; // Already imported!
import axios from "axios";
import toast from "react-hot-toast";
import imageCompression from 'browser-image-compression';

// --- Button style (no change) ---
const button = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 shrink-0 outline-none focus-visible:ring-[3px]",
  variants: {
    variant: {
      secondary:
        "bg-green-400 text-white hover:bg-green-400/90 border-green-500 border-b-4 active:border-b-0",
      danger:
        "bg-red-500 text-white hover:bg-red-600 border-red-700 border-b-4 active:border-b-0",
    },
    rounded: { true: "rounded-full" },
  },
  defaultVariants: { variant: "secondary" },
});

const Button = React.forwardRef(
  ({ className, variant, size, rounded, ...props }, ref) => (
    <button
      className={button({ variant, size, rounded, className })}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

// --- Icons (no change) ---
const PlusIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
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

// --- Diary Card (no change) ---
const DiaryEntryCard = ({ entry, onDelete }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation(); // prevent navigation
    // MODIFICATION: Replaced window.confirm with toast for better UX
    e.stopPropagation();
    toast(
      (t) => (
        <div className="flex flex-col gap-y-3">
          <span className="font-semibold">Are you sure?</span>
          <span>This entry will be permanently deleted.</span>
          <div className="flex gap-x-3">
            <Button
              variant="danger"
              className="px-4 py-1.5"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeleting(true);
                  await axios.delete(`${API_BASE_URL}/api/diary/${entry._id}`);
                  onDelete(entry._id); // This calls handleDeleteEntry
                  toast.success("Entry deleted!");
                } catch (err) {
                  console.error("Error deleting diary:", err);
                   toast.error("Failed to delete entry.");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
      onClick={() => navigate(`/diary/${entry._id}`)}
    >
      <CardButton
        title={entry.title}
        date={new Date(entry.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        mood={entry.mood}
        isLoading={entry.isLoading}
      />

      {/* Delete Button */}
      <Button
        variant="danger"
        rounded
        className="absolute top-12 right-2 !p-2 !rounded-full"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "..." : "×"}
      </Button>
    </motion.div>
  );
};

// --- Modal for Adding New Entry (no change) ---
// (We add the refetch logic in the Homepage component that *uses* this modal)
const AddEntryModal = ({ isOpen, onClose, onAddEntry }) => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
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
  
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !content || !user?._id) {
       toast.error("Please fill in the title and content.");
       return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Saving entry...");
    
    try {
      const detectedMood = await getMoodFromGemini(content);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('mood', detectedMood);
      formData.append('userId', user._id);
      
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      for (const file of images) {
        try {
          const compressedFile = await imageCompression(file, compressionOptions);
          formData.append('images', compressedFile, compressedFile.name); 
        } catch (error) {
          console.error("Compression failed for a file:", error);
          formData.append('images', file, file.name);
        }
      }

      const res = await axios.post(`${API_BASE_URL}/api/diary`, formData);

      onAddEntry(res.data.diary); // This calls handleAddEntry
      toast.success("Entry saved!", { id: toastId });
      setTitle("");
      setContent("");
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Error creating diary:", err);
      toast.error("Failed to create entry.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-['Fredoka_One',_cursive] text-slate-800">
                New Entry
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Entry Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-2 border-slate-200 px-4 py-3 rounded-xl h-40 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div
              {...getRootProps()}
              className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                isDragActive
                  ? "border-green-400 bg-green-50"
                  : "border-slate-300"
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-green-500 font-semibold">
                  Drop the files here...
                </p>
              ) : (
                <p className="text-slate-400">
                  Drag & drop images here, or click to select
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              {images.map((file, i) => (
                <div key={i} className="w-24 h-24 relative">
                  <img
                    src={file.preview}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg shadow"
                    onLoad={() => URL.revokeObjectURL(file.preview)} // Clean up object URL
                  />
                   <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                rounded
                className="px-6"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Homepage ---
function Homepage() {
  // 1. Get user AND refetchStats from the context
  const { user, refetchStats } = useUser(); 
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const toastId = toast.loading("Fetching entries...");
    axios
      .get(`${API_BASE_URL}/api/diary`, { params: { userId: user._id } })
      .then((res) => {
        setEntries(res.data);
        toast.dismiss(toastId);
      })
      .catch((err) => {
        toast.error("Error fetching diaries.", { id: toastId });
        console.error("Error fetching diaries:", err)
      });
  }, [user]);

  const handleAddEntry = (newEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    // 2. Call refetchStats when a new entry is added
    refetchStats();
  };

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e._id !== id));
    // 3. Call refetchStats when an entry is deleted
    refetchStats();
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileNavbar />

      <main className="flex-1 lg:pl-[256px] lg:pr-[340px] p-4 sm:p-8">
        <h1 className="text-4xl font-bold font-['Fredoka_One',_cursive] text-slate-800">
          My Diary
        </h1>
        <p className="mt-2 text-slate-500">
          Here is your collection of entries. Click on one to read more.
        </p>

        <div className="mt-8 space-y-6">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <DiaryEntryCard
                key={entry._id}
                entry={entry}
                onDelete={handleDeleteEntry} // This now calls our updated function
              />
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>No entries yet. Click the '+' button to add your first one!</p>
            </div>
          )}
        </div>
      </main>

      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      <BottomNav />

      <motion.div
        className="fixed bottom-20 right-6 z-40 lg:bottom-8 lg:right-[380px]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Button
          rounded
          onClick={() => setIsModalOpen(true)}
          className="!rounded-full !w-16 !h-16 shadow-xl"
        >
          <PlusIcon className="w-8 h-8" />
        </Button>
      </motion.div>

      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEntry={handleAddEntry} // This now calls our updated function
      />
    </div>
  );
}

export default Homepage;