import type { EventRead } from "../api/generated/types.gen";
import type { CalendarApi } from "./api-adapter";
import { CATEGORIES } from "./categories";
import type { EventRange } from "./event-range";
import { addDays, startOfDay } from "./date-utils";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const at = (day: Date, hours: number, minutes: number): Date => {
  const date = startOfDay(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const iso = (date: Date): string => date.toISOString();

const nextId = (events: readonly EventRead[]): number =>
  events.reduce((max, event) => Math.max(max, event.id ?? 0), 0) + 1;

const sampleEvents = (): EventRead[] => {
  const today = startOfDay(new Date());
  const [travail, personnel, famille, sport, sante, autre] = CATEGORIES;

  return [
    {
      id: 1,
      title: "Réunion d'équipe",
      description: "Point hebdomadaire",
      category: travail.label,
      color: travail.color,
      all_day: false,
      start_at: iso(at(today, 9, 0)),
      end_at: iso(at(today, 10, 0)),
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 2,
      title: "Déjeuner en famille",
      description: null,
      category: famille.label,
      color: famille.color,
      all_day: false,
      start_at: iso(at(today, 12, 30)),
      end_at: iso(at(today, 14, 0)),
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 3,
      title: "Séance de sport",
      description: null,
      category: sport.label,
      color: sport.color,
      all_day: false,
      start_at: iso(at(addDays(today, 1), 18, 0)),
      end_at: iso(at(addDays(today, 1), 19, 30)),
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 4,
      title: "Rendez-vous médecin",
      description: "Contrôle annuel",
      category: sante.label,
      color: sante.color,
      all_day: false,
      start_at: iso(at(addDays(today, 3), 14, 0)),
      end_at: iso(at(addDays(today, 3), 15, 0)),
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 5,
      title: "Week-end à la mer",
      description: "Départ vendredi soir",
      category: personnel.label,
      color: personnel.color,
      all_day: true,
      start_at: iso(at(addDays(today, 5), 0, 0)),
      end_at: null,
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 6,
      title: "Deadline projet",
      description: "Livraison client",
      category: travail.label,
      color: travail.color,
      all_day: false,
      start_at: iso(at(addDays(today, 8), 17, 0)),
      end_at: iso(at(addDays(today, 8), 18, 30)),
      created_at: iso(today),
      updated_at: iso(today),
    },
    {
      id: 7,
      title: "Cours de piano",
      description: null,
      category: autre.label,
      color: autre.color,
      all_day: false,
      start_at: iso(at(addDays(today, -2), 19, 0)),
      end_at: iso(at(addDays(today, -2), 20, 0)),
      created_at: iso(today),
      updated_at: iso(today),
    },
  ];
};

export const demoApi = (): CalendarApi => {
  let events = sampleEvents();

  const wait = async () => delay(250);

  return {
    listEvents: async (range: EventRange) => {
      await wait();
      return events.filter((event) => {
        const start = new Date(event.start_at);
        const end = event.end_at
          ? new Date(event.end_at)
          : endOfDay(start);
        return start < range.end && end >= range.start;
      });
    },
    createEvent: async (payload) => {
      await wait();
      const now = new Date().toISOString();
      const event: EventRead = {
        ...payload,
        id: nextId(events),
        created_at: now,
        updated_at: now,
      };
      events = [...events, event];
      return event;
    },
    updateEvent: async (id, payload) => {
      await wait();
      const existing = events.find((event) => event.id === id);
      if (!existing) {
        throw new Error("Événement introuvable");
      }
      const updated: EventRead = { ...existing, ...payload, updated_at: new Date().toISOString() };
      events = events.map((event) => (event.id === id ? updated : event));
      return updated;
    },
    deleteEvent: async (id) => {
      await wait();
      events = events.filter((event) => event.id !== id);
    },
  };
};

const endOfDay = (date: Date): Date => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + 1);
  return next;
};
