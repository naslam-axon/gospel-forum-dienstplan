"use client";

import Image from "next/image";
import type { CTEventService } from "@/app/lib/churchtools";

type Props = {
  service: CTEventService | null;
  positionName: string;
  onClose: () => void;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PersonDrawer({ service, positionName, onClose }: Props) {
  if (!service) return null;
  const person = service.person;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6DE]">
          <h2 className="font-semibold text-sm">{positionName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {person ? (
            <>
              <div className="flex items-center gap-4">
                {person.imageUrl ? (
                  <Image
                    src={person.imageUrl}
                    alt={person.title}
                    width={56}
                    height={56}
                    className="rounded-full object-cover w-14 h-14"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#E8E6DE] flex items-center justify-center text-lg font-bold text-gray-600">
                    {person.initials}
                  </div>
                )}
                <div>
                  <div className="font-semibold">{person.title}</div>
                  <div className="text-xs text-gray-400">
                    {person.domainAttributes.firstName} {person.domainAttributes.lastName}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="font-semibold text-[#1A1A1A] mb-1">Status</div>
                <div>
                  {service.isAccepted === true && (
                    <span className="text-[#2E7D5B] font-medium">✓ Bestätigt</span>
                  )}
                  {service.isAccepted === false && (
                    <span className="text-[#B8770A] font-medium">⏳ Ausstehend — noch nicht bestätigt</span>
                  )}
                  {service.isAccepted === null && (
                    <span className="text-[#C8102E] font-medium">○ Keine Zuweisung</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="font-semibold text-[#1A1A1A] mb-1">Anfrage-Historie</div>
                {service.requestedDate ? (
                  <div>Angefragt: {formatDate(service.requestedDate)}</div>
                ) : (
                  <div>Keine Anfrage-Daten</div>
                )}
                {service.requesterPerson && (
                  <div>Von: {service.requesterPerson.title}</div>
                )}
                {service.comment && (
                  <div className="italic mt-1">„{service.comment}"</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-[#C8102E]">
              <div className="text-3xl mb-2">○</div>
              <div className="font-medium">Position offen</div>
              <div className="text-xs text-gray-400 mt-1">Noch keine Person zugewiesen</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
