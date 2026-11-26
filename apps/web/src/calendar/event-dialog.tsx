import { useState } from "react";

import type { EventRead } from "../api/generated/types.gen";
import { CATEGORIES, DEFAULT_COLOR } from "./categories";
import {
  combineInputValues,
  toDateInputValue,
  toTimeInputValue,
} from "./date-utils";

export interface EventDraft {
  title: string;
  description: string;
  category: string;
  color: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface EventSubmit {
  title: string;
  description: string | null;
  category: string;
  color: string;
  all_day: boolean;
  start_at: string;
  end_at: string | null;
}

interface EventDialogProps {
  draft: EventDraft;
  saving: boolean;
  error: string | null;
  editing: boolean;
  onSubmit: (payload: EventSubmit) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const draftForCreate = (date: Date): EventDraft => {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(10, 0, 0, 0);

  return {
    title: "",
    description: "",
    category: CATEGORIES[0].label,
    color: CATEGORIES[0].color,
    allDay: false,
    startDate: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    endDate: toDateInputValue(end),
    endTime: toTimeInputValue(end),
  };
};

export const draftForEdit = (event: EventRead): EventDraft => {
  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : start;

  return {
    title: event.title,
    description: event.description ?? "",
    category: event.category ?? CATEGORIES[CATEGORIES.length - 1].label,
    color: event.color ?? DEFAULT_COLOR,
    allDay: event.all_day ?? false,
    startDate: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    endDate: toDateInputValue(end),
    endTime: toTimeInputValue(end),
  };
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export const EventDialog = ({
  draft,
  saving,
  error,
  editing,
  onSubmit,
  onDelete,
  onClose,
}: EventDialogProps) => {
  const [form, setForm] = useState<EventDraft>(draft);

  const set = <K extends keyof EventDraft>(field: K, value: EventDraft[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = (domEvent: React.FormEvent) => {
    domEvent.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    const start = form.allDay
      ? combineInputValues(form.startDate, "00:00")
      : combineInputValues(form.startDate, form.startTime);
    const end = form.allDay
      ? null
      : combineInputValues(form.endDate, form.endTime);

    if (!start) {
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      category: form.category,
      color: form.color,
      all_day: form.allDay,
      start_at: start.toISOString(),
      end_at: end ? end.toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Modifier l'événement" : "Nouvel événement"}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {editing ? "Modifier l'événement" : "Nouvel événement"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="event-title">
              Titre
            </label>
            <input
              id="event-title"
              className={inputClass}
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Titre de l'événement"
              required
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="event-description">
              Description
            </label>
            <textarea
              id="event-description"
              className={inputClass}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              rows={2}
            />
          </div>

          <div>
            <span className={labelClass}>Catégorie</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => {
                    set("category", category.label);
                    set("color", category.color);
                  }}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    form.category === category.label
                      ? "border-transparent font-semibold text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                  style={
                    form.category === category.label
                      ? { backgroundColor: category.color }
                      : undefined
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="event-all-day"
              type="checkbox"
              className="h-4 w-4"
              checked={form.allDay}
              onChange={(event) => set("allDay", event.target.checked)}
            />
            <label className="text-sm text-slate-700" htmlFor="event-all-day">
              Toute la journée
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-start-date">
                {form.allDay ? "Date" : "Début"}
              </label>
              <input
                id="event-start-date"
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(event) => set("startDate", event.target.value)}
                required
              />
            </div>
            {!form.allDay && (
              <div>
                <label className={labelClass} htmlFor="event-start-time">
                  Heure
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  className={inputClass}
                  value={form.startTime}
                  onChange={(event) => set("startTime", event.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="event-end-date">
                  Fin
                </label>
                <input
                  id="event-end-date"
                  type="date"
                  className={inputClass}
                  value={form.endDate}
                  onChange={(event) => set("endDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="event-end-time">
                  Heure
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  className={inputClass}
                  value={form.endTime}
                  onChange={(event) => set("endTime", event.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            {editing ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Supprimer
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving || !form.title.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
