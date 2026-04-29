"use client";

import { useState } from "react";
import type { CTEventService } from "@/app/lib/churchtools";
import { SlotRow } from "./SlotRow";
import { PersonDrawer } from "./PersonDrawer";
import { CoverageBar } from "./CoverageBar";

type ServiceMeta = { id: number; name: string };

type Props = {
  groupName: string;
  services: CTEventService[];
  serviceMap: Map<number, ServiceMeta>;
  eventId: number;
};

export function CategorySection({ groupName, services, serviceMap, eventId }: Props) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<CTEventService | null>(null);

  const filled = services.filter((s) => s.person !== null).length;
  const total = services.length;

  return (
    <section className="bg-white border border-[#E8E6DE] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F5F0] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{groupName}</span>
          <span className="text-xs bg-[#F5F5F0] border border-[#E8E6DE] rounded px-2 py-0.5 text-gray-500">
            {filled}/{total} besetzt
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24">
            <CoverageBar filled={filled} total={total} showLabel={false} />
          </div>
          <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-[#E8E6DE] border-t border-[#E8E6DE]">
          {services.map((svc) => (
            <SlotRow
              key={svc.id}
              service={svc}
              positionName={serviceMap.get(svc.serviceId)?.name ?? `Service ${svc.serviceId}`}
              onClick={() => setSelected(svc)}
            />
          ))}
        </div>
      )}

      {/* key=selected.id resets drawer state when a different slot is chosen */}
      <PersonDrawer
        key={selected?.id ?? "none"}
        service={selected}
        positionName={
          selected ? (serviceMap.get(selected.serviceId)?.name ?? "Position") : ""
        }
        eventId={eventId}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
