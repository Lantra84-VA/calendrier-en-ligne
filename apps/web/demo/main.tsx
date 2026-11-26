import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CalendarApp } from "../src/calendar/calendar-app";
import { demoApi } from "../src/calendar/demo-api";
import "../src/index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Élément #root introuvable");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="min-h-full bg-slate-100">
        <p className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-800">
          Démo — données d'exemple en mémoire. Tout ce que vous créez disparaît en
          rechargeant la page.
        </p>
        <CalendarApp api={demoApi()} />
      </div>
    </QueryClientProvider>
  </StrictMode>
);
