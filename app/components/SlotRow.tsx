"use client";

import Image from "next/image";
import type { CTEventService } from "@/app/lib/churchtools";

type Props = {
  service: CTEventService;
  positionName: string;
  onClick: () => void;
};

function StatusBadge({ status }: { status: boolean | null }) {
  if (status === true)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7D5B]">
        <span>✓</span> Bestätigt
      </span>
    );
  if (status === false)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B8770A]">
        <span>⏳</span> Ausstehend
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C8102E]">
      <span>○</span> Vakant
    </span>
  );
}

export function SlotRow({ service, positionName, onClick }: Props) {
  const person = service.person;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F0] transition-colors text-left border-b border-[#E8E6DE] last:border-0"
    >
      <div className="w-8 shrink-0">
        {person?.imageUrl ? (
          <Image
            src={person.imageUrl}
            alt={person.title}
            width={32}
            height={32}
            className="rounded-full object-cover w-8 h-8"
          />
        ) : person ? (
          <div className="w-8 h-8 rounded-full bg-[#E8E6DE] flex items-center justify-center text-xs font-semibold text-gray-600">
            {person.initials}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#FDECEA] flex items-center justify-center">
            <span className="text-[#C8102E] text-xs">?</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {person ? person.title : (
            <span className="text-[#C8102E]">Position offen</span>
          )}
        </div>
        <div className="text-xs text-gray-400 truncate">{positionName}</div>
      </div>
      <StatusBadge status={service.isAccepted} />
    </button>
  );
}
