import { createFileRoute } from "@tanstack/react-router";
import { ExecDashboard } from "@/features/exec-dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Overview | Trygc CRM HUB" },
      { name: "description", content: "Consolidated revenue, pipeline, campaign health and exceptions across all Trygc entities." },
      { property: "og:title", content: "Executive Overview | Trygc CRM HUB" },
      { property: "og:description", content: "Consolidated revenue, pipeline, campaign health and exceptions across all Trygc entities." },
    ],
  }),
  component: ExecDashboard,
});
