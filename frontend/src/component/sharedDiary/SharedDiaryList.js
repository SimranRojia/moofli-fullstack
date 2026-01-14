import { useEffect, useState } from "react";
import { getMySharedDiaries } from "../../api/sharedDiaryApi";
import Avatar from "../shared/Avatar";

export default function SharedDiaryList({ onSelect, meId }) {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMySharedDiaries();
        setDiaries(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-2">
      {diaries.map((d) => {
        const other = d.participants?.find((p) => p._id !== meId);
        return (
          <button
            key={d._id}
            onClick={() => onSelect?.(d)}
            className="w-full flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Avatar src={other?.profilePicture} name={other?.username || other?.email} />
              <div className="text-left">
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-gray-500">Last activity {new Date(d.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
