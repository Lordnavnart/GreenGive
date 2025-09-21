export default function Progress({ value = 0 }: { value?: number }) {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-rose-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
