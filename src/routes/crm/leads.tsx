import { createFileRoute } from "@tanstack/react-router";
import { DealsPage } from "./deals";

export const Route = createFileRoute("/crm/leads")({
  head: () => ({
    meta: [
      { title: "Leads | Trygc Operations OS" },
      { name: "description", content: "New, contacted and qualified opportunities with owners, sources and the next action for each lead." },
      { property: "og:title", content: "Leads | Trygc Operations OS" },
      { property: "og:description", content: "Early-stage opportunities with owners, sources and next actions." },
    ],
  }),
  component: () => <DealsPage leadsOnly />,
});
