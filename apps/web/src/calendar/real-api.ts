import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from "../api/generated";
import { unwrap } from "../api/unwrap";
import type { CalendarApi } from "./api-adapter";
import type { EventRange } from "./event-range";

export const realApi: CalendarApi = {
  listEvents: (range: EventRange) =>
    unwrap(
      listEvents({
        query: { from: range.start.toISOString(), to: range.end.toISOString() },
      })
    ),
  createEvent: (payload) => unwrap(createEvent({ body: payload })),
  updateEvent: (id, payload) =>
    unwrap(updateEvent({ path: { event_id: id }, body: payload })),
  deleteEvent: (id) =>
    unwrap(deleteEvent({ path: { event_id: id } })).then(() => undefined),
};
