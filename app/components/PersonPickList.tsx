"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CTPossiblePerson } from "@/app/lib/churchtools";

type Props = {
  eventId: number;
  serviceId: number;
  onSelect: (person: CTPossiblePerson) => void;
};

function availabilityHint(p: CTPossiblePerson): string | null {
  if (p.absences.length > 0) return "Abwesend";
  if (p.serviceOnSameDay) return "Anderer Dienst am selben Tag";
  if (p.servicesPreviouslyDeclined.length > 0) return "Hat früher abgelehnt";
  return null;
}

function hintColor(hint: string): string {
  if (hint === "Abwesend") return "text-[#C8102E]";
  if (hint.startsWith("Anderer")) return "text-[#B8770A]";
  return "text-gray-400";
}

export function PersonPickList({ eventId, serviceId, onSelect }: Props) {
  const [persons, setPersons] = useState<CTPossiblePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/possiblepersons?eventId=${eventId}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPersons(data);
        else setError(data.error ?? "Unbekannter Fehler");
      })
      .catch(() => setError("Netzwerkfehler"))
      .finally(() => setLoading(false));
  }, [eventId, serviceId]);

  const filtered = query.trim()
    ? persons.filter((p) =>
        p.person.title.toLowerCase().includes(query.toLowerCase())
      )
    : persons;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 text-center text-sm text-[#C8102E]">
        Fehler: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Person suchen…"
          className="w-full px-3 py-2 text-sm border border-[#E8E6DE] rounded-lg bg-[#F5F5F0] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 focus:border-[#C8102E]"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#E8E6DE]">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Keine Personen gefunden</p>
        ) : (
          filtered.map((p) => {
            const hint = availabilityHint(p);
            const pid = p.person.domainIdentifier;
            return (
              <button
                key={pid}
                onClick={() => onSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F0] transition-colors text-left"
              >
                <div className="shrink-0">
                  {p.person.imageUrl ? (
                    <Image
                      src={p.person.imageUrl}
                      alt={p.person.title}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E8E6DE] flex items-center justify-center text-sm font-semibold text-gray-600">
                      {p.person.initials ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.person.title}</div>
                  {hint && (
                    <div className={`text-xs truncate ${hintColor(hint)}`}>{hint}</div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
