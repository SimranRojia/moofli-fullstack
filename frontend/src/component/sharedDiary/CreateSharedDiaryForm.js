import { useState } from "react";
import { createSharedDiary } from "../../api/sharedDiaryApi";

export default function CreateSharedDiaryForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !partnerEmail.trim()) {
      setError("Title and partner email are required");
      return;
    }
    setLoading(true);
    try {
      const diary = await createSharedDiary({ title: title.trim(), partnerEmail: partnerEmail.trim() });
      onCreated?.(diary);
      setTitle("");
      setPartnerEmail("");
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold">Create Shared Diary</h3>
      <input
        className="w-full border rounded-xl p-2"
        placeholder="Diary title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="w-full border rounded-xl p-2"
        placeholder="Partner's email"
        type="email"
        value={partnerEmail}
        onChange={(e) => setPartnerEmail(e.target.value)}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">
        {loading ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
