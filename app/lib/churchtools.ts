import "server-only";

const BASE_URL = process.env.CHURCHTOOLS_BASE_URL!;
const TOKEN = process.env.CHURCHTOOLS_LOGIN_TOKEN!;

const AUTH = { Authorization: `Login ${TOKEN}` };

async function ctFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: AUTH,
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ChurchTools ${res.status} ${path}: ${body}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

async function ctMutate(
  method: "PUT" | "DELETE" | "POST",
  path: string,
  body: unknown
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { ...AUTH, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ChurchTools ${method} ${res.status} ${path}: ${text}`);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type CTEventService = {
  id: number;
  personId: number | null;
  person: {
    title: string;
    initials: string;
    imageUrl: string | null;
    domainAttributes: { firstName: string; lastName: string };
  } | null;
  name: string | null;
  serviceId: number;
  isAccepted: boolean | null;
  requestedDate: string | null;
  requesterPersonId: number | null;
  requesterPerson: { title: string } | null;
  comment: string;
  agreed: boolean;
};

export type CTEvent = {
  id: number;
  name: string;
  note: string | null;
  startDate: string;
  endDate: string;
  calendar: { id: number; name: string } | null;
  eventServices: CTEventService[];
};

export type CTService = {
  id: number;
  name: string;
  serviceGroupId: number;
};

export type CTServiceGroup = {
  id: number;
  name: string;
  sortKey: number;
};

export type CTPossiblePerson = {
  person: {
    domainIdentifier: string;
    title: string;
    imageUrl: string | null;
    initials: string | null;
    domainAttributes: { firstName: string; lastName: string };
  };
  score: number;
  scoreHints: Array<{ score: number; reason: string; nameTranslated: string }>;
  monthlyUtilization: Record<string, number> | null;
  absences: Array<{ absenceReason: { nameTranslated: string }; startDate: string; endDate: string }>;
  serviceOnSameDay: boolean;
  servicesOnSameDay: Array<{ event: { title: string } }>;
  servicesPreviouslyDeclined: unknown[];
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getEvents(from: string, to: string): Promise<CTEvent[]> {
  const data = await ctFetch<CTEvent[]>("/events", {
    from,
    to,
    include: "eventServices",
  });
  return Array.isArray(data) ? data : [];
}

export async function getEvent(id: string): Promise<CTEvent> {
  return ctFetch<CTEvent>(`/events/${id}`, { include: "eventServices" });
}

export async function getServices(): Promise<CTService[]> {
  const data = await ctFetch<CTService[]>("/services");
  return Array.isArray(data) ? data : [];
}

export async function getServiceGroups(): Promise<CTServiceGroup[]> {
  const data = await ctFetch<CTServiceGroup[]>("/servicegroups");
  return Array.isArray(data) ? data : [];
}

export async function getPossiblePersons(
  eventId: string,
  serviceId: string
): Promise<CTPossiblePerson[]> {
  const data = await ctFetch<CTPossiblePerson[]>(
    `/events/${eventId}/services/${serviceId}/possiblepersons`
  );
  return Array.isArray(data) ? data : [];
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function assignPerson(
  eventId: string,
  eventServiceId: string,
  personId: number,
  personName: string
): Promise<void> {
  await ctMutate("PUT", `/events/${eventId}/servicerequests/${eventServiceId}`, {
    isAccepted: false,
    personId,
    name: personName,
  });
}

export async function removeAssignment(
  eventId: string,
  eventServiceId: string
): Promise<void> {
  await ctMutate("DELETE", `/events/${eventId}/eventservices/${eventServiceId}`, {
    eventId: parseInt(eventId),
    eventServiceId: parseInt(eventServiceId),
  });
}
