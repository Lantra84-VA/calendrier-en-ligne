import type { EventRead } from "../api/generated/types.gen";
import type { EventSubmit } from "./event-dialog";
import type { EventRange } from "./event-range";

/**
 * The one seam between the calendar UI and its events source. The app passes the real API; the
 * demo entry passes an in-memory adapter, so the same component runs against either.
 */
export interface CalendarApi {
  listEvents(range: EventRange): Promise<EventRead[]>;
  createEvent(payload: EventSubmit): Promise<EventRead>;
  updateEvent(id: number, payload: EventSubmit): Promise<EventRead>;
  deleteEvent(id: number): Promise<void>;
}
