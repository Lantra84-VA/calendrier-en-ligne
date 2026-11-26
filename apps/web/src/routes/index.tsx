import { createFileRoute } from "@tanstack/react-router";

import { CalendarApp } from "../calendar/calendar-app";
import { realApi } from "../calendar/real-api";

export const Route = createFileRoute("/")({
  component: () => <CalendarApp api={realApi} />,
});
