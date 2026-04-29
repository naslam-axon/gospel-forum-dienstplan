import "server-only";

const BASE_URL = process.env.CHURCHTOOLS_BASE_URL!;
const TOKEN = process.env.CHURCHTOOLS_LOGIN_TOKEN!;

async function ctFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Login ${TOKEN}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`ChurchTools API error ${res.status}: ${path}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

export type CTEventService = {
  id: number;
  personId: number | null;
  person: {
    title: string;
    initials: string;
    imageUrl: string | null;
    domainAttributes: { firstName: string; lastName: string };
  } | null;
  name: string;
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
