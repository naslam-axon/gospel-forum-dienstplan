type Props = {
  filled: number;
  total: number;
  showLabel?: boolean;
};

export function CoverageBar({ filled, total, showLabel = true }: Props) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const color =
    pct >= 80
      ? "bg-[#2E7D5B]"
      : pct >= 50
      ? "bg-[#B8770A]"
      : "bg-[#C8102E]";

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filled}/{total}
        </span>
      )}
      <div className="flex-1 h-1.5 bg-[#E8E6DE] rounded-full overflow-hidden min-w-[60px]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color: pct >= 80 ? "#2E7D5B" : pct >= 50 ? "#B8770A" : "#C8102E" }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
