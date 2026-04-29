import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent, getServices, getServiceGroups } from "@/app/lib/churchtools";
import { CoverageBar } from "@/app/components/CoverageBar";
import { CategorySection } from "@/app/components/CategorySection";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Params = Promise<{ id: string }>;

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const [event, services, serviceGroups] = await Promise.all([
    getEvent(id).catch(() => null),
    getServices(),
    getServiceGroups(),
  ]);

  if (!event) notFound();

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const groupMap = new Map(serviceGroups.map((g) => [g.id, g]));

  const eventServices = event.eventServices ?? [];
  const filledTotal = eventServices.filter((s) => s.isAccepted === true).length;
  const total = eventServices.length;

  // Group by serviceGroupId
  const grouped = new Map<number, typeof eventServices>();
  for (const svc of eventServices) {
    const service = serviceMap.get(svc.serviceId);
    const groupId = service?.serviceGroupId ?? 0;
    if (!grouped.has(groupId)) grouped.set(groupId, []);
    grouped.get(groupId)!.push(svc);
  }

  // Sort groups by sortKey
  const sortedGroups = [...grouped.entries()].sort(([aId], [bId]) => {
    const aKey = groupMap.get(aId)?.sortKey ?? 999;
    const bKey = groupMap.get(bId)?.sortKey ?? 999;
    return aKey - bKey;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-xs text-gray-400 hover:text-[#C8102E] mb-4 inline-block">
        ← Zurück zur Übersicht
      </Link>

      <div className="bg-white border border-[#E8E6DE] rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-lg font-bold leading-tight">{event.name}</h1>
          {event.calendar && (
            <span className="text-xs bg-[#F5F5F0] border border-[#E8E6DE] rounded px-2 py-0.5 text-gray-500 shrink-0">
              {event.calendar.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-1">{formatDateTime(event.startDate)}</p>
        {event.note && <p className="text-sm text-gray-400 mb-4">{event.note}</p>}

        {total > 0 && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">{filledTotal} von {total} Positionen besetzt</div>
            <CoverageBar filled={filledTotal} total={total} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sortedGroups.map(([groupId, groupServices]) => {
          const groupName = groupMap.get(groupId)?.name ?? `Gruppe ${groupId}`;
          return (
            <CategorySection
              key={groupId}
              groupName={groupName}
              services={groupServices}
              serviceMap={serviceMap}
            />
          );
        })}
      </div>
    </div>
  );
}
