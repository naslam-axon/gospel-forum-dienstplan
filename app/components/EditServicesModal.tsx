"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CTService, CTServiceGroup, CTEventService } from "@/app/lib/churchtools";

type Props = {
  eventId: number;
  allServices: CTService[];
  serviceGroups: CTServiceGroup[];
  currentServices: CTEventService[];
};

type Entry = { serviceId: number; enabled: boolean; count: number };

export function EditServicesModal({ eventId, allServices, serviceGroups, currentServices }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedGroups = useMemo(() => {
    const groupMap = new Map(serviceGroups.map((g) => [g.id, g]));
    const byGroup = new Map<number, CTService[]>();
    for (const s of allServices) {
      const gid = s.serviceGroupId;
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(s);
    }
    return [...byGroup.entries()]
      .sort(([aId], [bId]) => (groupMap.get(aId)?.sortKey ?? 999) - (groupMap.get(bId)?.sortKey ?? 999))
      .map(([gid, svcs]) => ({
        groupId: gid,
        groupName: groupMap.get(gid)?.name ?? `Gruppe ${gid}`,
        services: [...svcs].sort((a, b) => (a.sortKey ?? 999) - (b.sortKey ?? 999)),
      }));
  }, [allServices, serviceGroups]);

  const initialEntries = useMemo<Entry[]>(() => {
    const countMap = new Map<number, number>();
    for (const es of currentServices) {
      countMap.set(es.serviceId, (countMap.get(es.serviceId) ?? 0) + 1);
    }
    return allServices.map((s) => ({
      serviceId: s.id,
      enabled: countMap.has(s.id),
      count: countMap.get(s.id) ?? 1,
    }));
  }, [allServices, currentServices]);

  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  function resetAndOpen() {
    setEntries(initialEntries);
    setError(null);
    setOpen(true);
  }

  function toggle(serviceId: number) {
    setEntries((prev) =>
      prev.map((e) => (e.serviceId === serviceId ? { ...e, enabled: !e.enabled } : e))
    );
  }

  function setCount(serviceId: number, count: number) {
    setEntries((prev) =>
      prev.map((e) => (e.serviceId === serviceId ? { ...e, count: Math.max(1, count) } : e))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const services = entries
      .filter((e) => e.enabled)
      .map((e) => ({ serviceId: e.serviceId, count: e.count }));
    try {
      const res = await fetch(`/api/events/${eventId}/eventservices`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const entryMap = new Map(entries.map((e) => [e.serviceId, e]));

  return (
    <>
      <button
        onClick={resetAndOpen}
        className="text-xs text-gray-400 hover:text-[#C8102E] transition-colors border border-[#E8E6DE] rounded px-2 py-1 hover:border-[#C8102E]"
      >
        Dienste bearbeiten
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => !saving && setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6DE] shrink-0">
                <h2 className="font-semibold text-sm">Dienste bearbeiten</h2>
                <button
                  onClick={() => !saving && setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  aria-label="Schließen"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {sortedGroups.map(({ groupId, groupName, services }) => (
                  <div key={groupId}>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {groupName}
                    </div>
                    <div className="space-y-1">
                      {services.map((svc) => {
                        const entry = entryMap.get(svc.id);
                        if (!entry) return null;
                        return (
                          <div
                            key={svc.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F5F5F0]"
                          >
                            <input
                              type="checkbox"
                              id={`svc-${svc.id}`}
                              checked={entry.enabled}
                              onChange={() => toggle(svc.id)}
                              className="accent-[#C8102E] w-4 h-4 shrink-0"
                            />
                            <label
                              htmlFor={`svc-${svc.id}`}
                              className="flex-1 text-sm cursor-pointer select-none"
                            >
                              {svc.name}
                            </label>
                            {entry.enabled && (
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={entry.count}
                                onChange={(e) => setCount(svc.id, parseInt(e.target.value) || 1)}
                                className="w-14 text-sm text-center border border-[#E8E6DE] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 focus:border-[#C8102E]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mx-5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-[#C8102E]">
                  {error}
                </div>
              )}

              <div className="flex gap-2 px-5 py-4 border-t border-[#E8E6DE] shrink-0">
                <button
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm border border-[#E8E6DE] rounded-lg hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm bg-[#C8102E] text-white rounded-lg hover:bg-[#a50e26] transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? "Speichern…" : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
