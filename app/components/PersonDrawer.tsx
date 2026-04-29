"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { CTEventService, CTPossiblePerson } from "@/app/lib/churchtools";
import { PersonPickList } from "./PersonPickList";

type Props = {
  service: CTEventService | null;
  positionName: string;
  eventId: number;
  onClose: () => void;
};

type Mode =
  | { type: "info" }
  | { type: "picking" }
  | { type: "confirming"; candidate: CTPossiblePerson }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

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

export function PersonDrawer({ service, positionName, eventId, onClose }: Props) {
  const router = useRouter();

  const initialMode: Mode =
    !service || !service.person ? { type: "picking" } : { type: "info" };

  const [mode, setMode] = useState<Mode>(initialMode);

  // Reset mode when the selected service changes
  const handleClose = useCallback(() => {
    setMode(initialMode);
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  if (!service) return null;

  // Capture into locals so closures don't need to narrow the nullable prop
  const eventServiceId = service.id;
  const serviceTypeId = service.serviceId;
  const person = service.person;
  const isAccepted = service.isAccepted;
  const requestedDate = service.requestedDate;
  const requesterPerson = service.requesterPerson;
  const comment = service.comment;

  // ── Assign ─────────────────────────────────────────────────────────────────
  async function handleAssign(candidate: CTPossiblePerson) {
    setMode({ type: "loading", message: "Anfrage wird gesendet…" });
    try {
      const res = await fetch("/api/servicerequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          eventServiceId,
          personId: Number(candidate.person.domainIdentifier),
          personName: candidate.person.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
      setMode({ type: "success", message: `Anfrage an ${candidate.person.title} gesendet` });
      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 1500);
    } catch (e) {
      setMode({ type: "error", message: String(e) });
    }
  }

  // ── Remove ─────────────────────────────────────────────────────────────────
  async function handleRemove() {
    setMode({ type: "loading", message: "Zuweisung wird entfernt…" });
    try {
      const res = await fetch("/api/servicerequest", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, eventServiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
      setMode({ type: "success", message: "Zuweisung entfernt" });
      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 1200);
    } catch (e) {
      setMode({ type: "error", message: String(e) });
    }
  }

  // ── Drawer content ─────────────────────────────────────────────────────────
  function renderContent() {
    // Loading
    if (mode.type === "loading") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{mode.message}</p>
        </div>
      );
    }

    // Success
    if (mode.type === "success") {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-12 h-12 rounded-full bg-[#2E7D5B]/10 flex items-center justify-center">
            <span className="text-[#2E7D5B] text-2xl">✓</span>
          </div>
          <p className="text-sm font-medium text-[#2E7D5B]">{mode.message}</p>
        </div>
      );
    }

    // Error
    if (mode.type === "error") {
      return (
        <div className="p-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-[#C8102E]">
            {mode.message}
          </div>
          <button
            onClick={() => setMode({ type: "picking" })}
            className="text-sm text-gray-500 hover:text-[#C8102E]"
          >
            ← Zurück
          </button>
        </div>
      );
    }

    // Confirming
    if (mode.type === "confirming") {
      const { candidate } = mode;
      return (
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-[#F5F5F0] rounded-lg border border-[#E8E6DE]">
            {candidate.person.imageUrl ? (
              <Image
                src={candidate.person.imageUrl}
                alt={candidate.person.title}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E8E6DE] flex items-center justify-center text-sm font-semibold text-gray-600">
                {candidate.person.initials ?? "?"}
              </div>
            )}
            <div>
              <div className="font-medium text-sm">{candidate.person.title}</div>
              <div className="text-xs text-gray-400">{positionName}</div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            <strong>{candidate.person.title}</strong> als <strong>{positionName}</strong> anfragen?
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setMode({ type: "picking" })}
              className="flex-1 px-4 py-2 text-sm border border-[#E8E6DE] rounded-lg hover:bg-[#F5F5F0] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={() => handleAssign(candidate)}
              className="flex-1 px-4 py-2 text-sm bg-[#C8102E] text-white rounded-lg hover:bg-[#a50e26] transition-colors font-medium"
            >
              Anfragen
            </button>
          </div>
        </div>
      );
    }

    // Picking — person picker
    if (mode.type === "picking") {
      return (
        <div className="flex flex-col h-full">
          {person && (
            <button
              onClick={() => setMode({ type: "info" })}
              className="mx-4 mb-2 text-xs text-gray-400 hover:text-[#C8102E] text-left"
            >
              ← Zurück zu {person.title}
            </button>
          )}
          <PersonPickList
            eventId={eventId}
            serviceId={serviceTypeId}
            onSelect={(candidate) => setMode({ type: "confirming", candidate })}
          />
        </div>
      );
    }

    // Info — occupied slot detail
    return (
      <div className="p-5 space-y-5">
        {/* Person header */}
        {person && (
          <div className="flex items-center gap-4">
            {person.imageUrl ? (
              <Image
                src={person.imageUrl}
                alt={person.title}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#E8E6DE] flex items-center justify-center text-xl font-bold text-gray-600">
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
        )}

        {/* Status */}
        <div className="text-xs space-y-1">
          <div className="font-semibold text-[#1A1A1A] mb-1">Status</div>
          {isAccepted === true && (
            <span className="text-[#2E7D5B] font-medium">✓ Bestätigt</span>
          )}
          {isAccepted === false && person && (
            <span className="text-[#B8770A] font-medium">⏳ Angefragt — noch nicht bestätigt</span>
          )}
          {isAccepted === null && (
            <span className="text-gray-400">Kein Status</span>
          )}
        </div>

        {/* Anfrage-Historie */}
        <div className="text-xs space-y-1">
          <div className="font-semibold text-[#1A1A1A] mb-1">Anfrage</div>
          {requestedDate ? (
            <div className="text-gray-500">Angefragt: {formatDate(requestedDate)}</div>
          ) : (
            <div className="text-gray-400">Keine Angaben</div>
          )}
          {requesterPerson && (
            <div className="text-gray-500">Von: {requesterPerson.title}</div>
          )}
          {comment && (
            <div className="italic text-gray-400 mt-1">„{comment}"</div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-[#E8E6DE]">
          <button
            onClick={() => setMode({ type: "picking" })}
            className="w-full px-4 py-2 text-sm border border-[#E8E6DE] rounded-lg hover:bg-[#F5F5F0] transition-colors text-left"
          >
            Person tauschen
          </button>
          <button
            onClick={handleRemove}
            className="w-full px-4 py-2 text-sm border border-red-200 text-[#C8102E] rounded-lg hover:bg-red-50 transition-colors text-left"
          >
            Zuweisung entfernen
          </button>
        </div>
      </div>
    );
  }

  // ── Title per mode ─────────────────────────────────────────────────────────
  function drawerTitle() {
    if (mode.type === "picking") return `${positionName} zuweisen`;
    if (mode.type === "confirming") return "Anfrage bestätigen";
    return positionName;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={handleClose}
      />
      <aside className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6DE] shrink-0">
          <h2 className="font-semibold text-sm">{drawerTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </aside>
    </>
  );
}
