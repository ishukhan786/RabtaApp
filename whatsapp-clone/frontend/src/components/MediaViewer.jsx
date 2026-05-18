export default function MediaViewer({ media, onClose }) {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
      <div className="max-w-3xl rounded-md bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-medium text-slate-900">{media.name}</h2>
          <button className="text-sm text-slate-500 hover:text-slate-900" onClick={onClose}>
            Close
          </button>
        </div>
        {media.type?.startsWith('image/') ? (
          <img className="max-h-[70vh] rounded" src={media.url} alt={media.name} />
        ) : (
          <a className="text-emerald-600 underline" href={media.url} target="_blank" rel="noreferrer">
            Open file
          </a>
        )}
      </div>
    </div>
  );
}
