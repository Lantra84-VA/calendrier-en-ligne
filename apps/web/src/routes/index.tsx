import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from "../api/generated";
import type { EventRead } from "../api/generated/types.gen";
import { unwrap } from "../api/unwrap";
import { CATEGORIES } from "../calendar/categories";
import {
  addDays,
  addMonths,
  dayLabel,
  endOfDay,
  isSameDay,
  monthGrid,
  monthLabel,
  startOfDay,
  startOfWeek,
  timeLabel,
  weekdayLabels,
} from "../calendar/date-utils";
import {
  draftForCreate,
  draftForEdit,
  EventDialog,
} from "../calendar/event-dialog";
import type { EventSubmit } from "../calendar/event-dialog";

type View = "month" | "week" | "day";

interface DialogState {
  draft: ReturnType<typeof draftForCreate>;
  editing: EventRead | null;
}

interface EventRange {
  start: Date;
  end: Date;
}

const VIEWS: { key: View; label: string }[] = [
  { key: "month", label: "Mois" },
  { key: "week", label: "Semaine" },
  { key: "day", label: "Jour" },
];

const rangeFor = (view: View, cursor: Date): EventRange => {
  if (view === "month") {
    const grid = monthGrid(cursor);
    return { start: grid[0], end: addDays(grid[grid.length - 1], 1) };
  }
  if (view === "week") {
    const start = startOfWeek(cursor);
    return { start, end: addDays(start, 7) };
  }
  return { start: startOfDay(cursor), end: endOfDay(cursor) };
};

const eventRangeOf = (event: EventRead): EventRange => {
  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : endOfDay(start);
  return { start, end };
};

const eventsOn = (events: EventRead[], day: Date): EventRead[] =>
  events.filter((event) => {
    const range = eventRangeOf(event);
    return range.start < endOfDay(day) && range.end > day;
  });

const Home = () => {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const range = useMemo(() => rangeFor(view, cursor), [view, cursor]);

  const eventsQuery = useQuery({
    queryKey: ["events", range.start.toISOString(), range.end.toISOString()],
    queryFn: () =>
      unwrap(
        listEvents({
          query: { from: range.start.toISOString(), to: range.end.toISOString() },
        })
      ),
  });
  const events = eventsQuery.data ?? [];

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["events"] });

  const createMutation = useMutation({
    mutationFn: (payload: EventSubmit) => unwrap(createEvent({ body: payload })),
    onSuccess: () => {
      void refresh();
      setDialog(null);
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EventSubmit }) =>
      unwrap(updateEvent({ path: { event_id: id }, body: payload })),
    onSuccess: () => {
      void refresh();
      setDialog(null);
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrap(deleteEvent({ path: { event_id: id } })),
    onSuccess: () => {
      void refresh();
      setDialog(null);
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const saving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const navigate = (direction: 1 | -1) => {
    if (view === "month") {
      setCursor((current) => addMonths(current, direction));
    } else {
      setCursor((current) => addDays(current, direction * (view === "week" ? 7 : 1)));
    }
  };

  const periodLabel =
    view === "month"
      ? monthLabel(cursor)
      : view === "week"
        ? `Semaine du ${dayLabel(startOfWeek(cursor))}`
        : dayLabel(cursor);

  const submit = (payload: EventSubmit) => {
    setActionError(null);
    if (dialog?.editing) {
      updateMutation.mutate({ id: dialog.editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const remove = () => {
    if (!dialog?.editing) {
      return;
    }
    setActionError(null);
    deleteMutation.mutate(dialog.editing.id);
  };

  const today = startOfDay(new Date());
  const weekdays = weekdayLabels();

  const eventChip = (event: EventRead) => (
    <button
      type="button"
      onClick={() => setDialog({ draft: draftForEdit(event), editing: event })}
      className="w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium text-slate-800 hover:brightness-95"
      style={{
        backgroundColor: `${event.color}26`,
        borderLeft: `3px solid ${event.color}`,
      }}
      title={event.title}
    >
      {event.all_day ? (
        event.title
      ) : (
        <span className="mr-1 text-slate-500">
          {timeLabel(new Date(event.start_at))}
        </span>
      )}
      {event.title}
    </button>
  );

  const monthView = () => (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekdays.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase text-slate-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthGrid(cursor).map((day, index) => {
          const outside = day.getMonth() !== cursor.getMonth();
          const dayEvents = eventsOn(events, day);
          return (
            <div
              key={index}
              className={`min-h-24 border-b border-r border-slate-100 p-1.5 ${
                outside ? "bg-slate-50/60" : ""
              } ${isSameDay(day, today) ? "bg-blue-50/60" : ""}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isSameDay(day, today)
                      ? "bg-blue-600 font-semibold text-white"
                      : outside
                        ? "text-slate-400"
                        : "text-slate-600"
                  }`}
                >
                  {day.getDate()}
                </span>
                <button
                  type="button"
                  aria-label={`Ajouter un événement le ${dayLabel(day)}`}
                  onClick={() =>
                    setDialog({ draft: draftForCreate(day), editing: null })
                  }
                  className="hidden h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 group-hover:flex sm:flex"
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <span key={event.id}>{eventChip(event)}</span>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCursor(startOfDay(day));
                      setView("day");
                    }}
                    className="w-full text-left text-xs text-slate-500 hover:text-slate-700"
                  >
                    + {dayEvents.length - 3} autre(s)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const columnView = (days: Date[]) => (
    <div
      className={`grid gap-3 ${
        days.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7"
      }`}
    >
      {days.map((day) => {
        const dayEvents = eventsOn(events, day);
        return (
          <div
            key={day.toISOString()}
            className={`rounded-lg border border-slate-200 p-3 ${
              isSameDay(day, today) ? "border-blue-300 bg-blue-50/40" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize text-slate-700">
                {days.length === 1
                  ? dayLabel(day)
                  : new Intl.DateTimeFormat("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                    }).format(day)}
              </h3>
              <button
                type="button"
                aria-label={`Ajouter un événement le ${dayLabel(day)}`}
                onClick={() => setDialog({ draft: draftForCreate(day), editing: null })}
                className="h-6 w-6 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                +
              </button>
            </div>
            <div className="space-y-1.5">
              {dayEvents.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun événement</p>
              ) : (
                dayEvents.map((event) => (
                  <span key={event.id}>{eventChip(event)}</span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="mx-auto min-h-full max-w-6xl p-4 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Calendrier</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {VIEWS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  view === key
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCursor(startOfDay(new Date()))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setDialog({ draft: draftForCreate(cursor), editing: null })}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Nouvel événement
          </button>
        </div>
      </header>

      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Période précédente"
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-100"
        >
          ‹
        </button>
        <h2 className="min-w-56 text-lg font-semibold capitalize text-slate-800">
          {periodLabel}
        </h2>
        <button
          type="button"
          aria-label="Période suivante"
          onClick={() => navigate(1)}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-100"
        >
          ›
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => (
          <span
            key={category.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.label}
          </span>
        ))}
      </div>

      {eventsQuery.isPending ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          Chargement…
        </div>
      ) : eventsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Impossible de charger les événements : {eventsQuery.error.message}
        </div>
      ) : view === "month" ? (
        monthView()
      ) : view === "week" ? (
        columnView(
          Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursor), index))
        )
      ) : (
        columnView([startOfDay(cursor)])
      )}

      {dialog && (
        <EventDialog
          draft={dialog.draft}
          editing={dialog.editing !== null}
          saving={saving}
          error={actionError}
          onSubmit={submit}
          onDelete={remove}
          onClose={() => {
            setDialog(null);
            setActionError(null);
          }}
        />
      )}
    </main>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
});
