export default function Avatar({ src, name }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={src || "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=" + encodeURIComponent(name || "?")}
        alt={name || "user"}
        className="w-8 h-8 rounded-full object-cover"
      />
      {name && <span className="text-sm text-gray-700">{name}</span>}
    </div>
  );
}
