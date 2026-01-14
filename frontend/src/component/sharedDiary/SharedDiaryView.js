import { useEffect, useRef, useState } from "react";
import { getSharedDiary, addEntry, updateEntry, deleteEntry } from "../../api/sharedDiaryApi";

function EntryItem({ entry, meId, onEdit, onDelete }) {
  const mine = entry.author?._id === meId;
  return (
    <div className={`p-3 border rounded-xl ${mine ? "bg-gray-50" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {entry.author?.username || entry.author?.email} • {new Date(entry.createdAt).toLocaleString()}{" "}
          {entry.editedAt && <> (edited)</>}
        </div>
        <div className="flex gap-2">
          {mine && (
            <>
              <button className="text-xs underline" onClick={() => onEdit(entry)}>Edit</button>
              <button className="text-xs underline text-red-600" onClick={() => onDelete(entry)}>Delete</button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 whitespace-pre-wrap">{entry.content}</div>
      {entry.images?.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {entry.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.description || ""} className="rounded-lg w-full object-cover" />
          ))}
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">Mood: {entry.mood}</div>
    </div>
  );
}

export default function SharedDiaryView({ diaryId, me }) {
  const [diary, setDiary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [files, setFiles] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getSharedDiary(diaryId);
        setDiary(d);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [diaryId]);

  const submit = async () => {
    if (!content.trim() && files.length === 0) return;
    try {
      const updated = await addEntry(diary._id, { content, mood, images: files });
      setDiary(updated);
      setContent("");
      setMood("neutral");
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  const onDelete = async (entry) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteEntry(diary._id, entry._id);
      const d = await getSharedDiary(diary._id);
      setDiary(d);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  const onEdit = async (entry) => {
    const newContent = window.prompt("Edit content", entry.content);
    if (newContent === null) return;
    try {
      const updated = await updateEntry(diary._id, entry._id, {
        content: newContent,
        mood: entry.mood,
        existingImages: entry.images,
      });
      setDiary(updated);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!diary) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{diary.title}</h2>
        <div className="text-sm text-gray-500">
          With {diary.participants.filter((p) => p._id !== me.id).map((p) => p.username || p.email).join(", ")}
        </div>
      </div>

      <div className="space-y-3">
        {diary.entries?.length === 0 && <div className="text-gray-500">No entries yet.</div>}
        {diary.entries?.map((entry) => (
          <EntryItem key={entry._id} entry={entry} meId={me.id} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
