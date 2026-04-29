import { getEvents } from "@/app/lib/churchtools";
import { EventCard } from "@/app/components/EventCard";
import Link from "next/link";

function getWeekBounds(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(12, 0, 0, 0); // noon avoids UTC±2 edge cases in toLocaleDateString
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  // apiTo is Monday+7: CT API treats "to" as exclusive, so this covers Sunday fully
  const apiTo = new Date(monday);
  apiTo.setDate(monday.getDate() + 7);
  return { monday, sunday, apiTo };
}

// Returns YYYY-MM-DD in Europe/Berlin timezone (safe across UTC offsets)
function toISO(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

function formatWeekLabel(monday: Date, sunday: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit",
      month: "2-digit",
    });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

type SearchParams = Promise<{ w?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { w } = await searchParams;
  const offset = parseInt(w ?? "0", 10) || 0;
  const { monday, sunday, apiTo } = getWeekBounds(offset);
  const events = await getEvents(toISO(monday), toISO(apiTo));

  const weekLabel = formatWeekLabel(monday, sunday);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Events</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/?w=${offset - 1}`}
            className="px-3 py-1.5 text-sm border border-[#E8E6DE] rounded-lg hover:bg-white transition-colors"
          >
            ← Vorherige
          </Link>
          <span className="text-sm text-gray-500 min-w-[130px] text-center">{weekLabel}</span>
          <Link
            href={`/?w=${offset + 1}`}
            className="px-3 py-1.5 text-sm border border-[#E8E6DE] rounded-lg hover:bg-white transition-colors"
          >
            Nächste →
          </Link>
          {offset !== 0 && (
            <Link href="/" className="text-xs text-[#C8102E] hover:underline ml-1">
              Heute
            </Link>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p>Keine Events in dieser Woche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
