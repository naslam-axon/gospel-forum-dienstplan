import Link from "next/link";
import type { CTEvent } from "@/app/lib/churchtools";
import { CoverageBar } from "./CoverageBar";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = { event: CTEvent };

export function EventCard({ event }: Props) {
  const services = event.eventServices ?? [];
  const filled = services.filter((s) => s.isAccepted === true).length;
  const total = services.length;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white border border-[#E8E6DE] rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight">{event.name}</h3>
        {event.calendar && (
          <span className="text-[10px] bg-[#F5F5F0] border border-[#E8E6DE] rounded px-1.5 py-0.5 text-gray-500 whitespace-nowrap">
            {event.calendar.name}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{formatDateTime(event.startDate)}</p>
      {event.note && (
        <p className="text-xs text-gray-400 mb-3 truncate">{event.note}</p>
      )}
      {total > 0 && (
        <div className="mt-3">
          <CoverageBar filled={filled} total={total} />
        </div>
      )}
    </Link>
  );
}
