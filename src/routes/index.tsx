import { createFileRoute } from "@tanstack/react-router";
import { ExecDashboard } from "@/features/exec-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trygc CRM HUB — Executive Command Center" },
      { name: "description", content: "Group performance, pipeline, campaign delivery and exceptions for Trygc across Egypt and the GCC, consolidated in SAR." },
      { property: "og:title", content: "Trygc CRM HUB — Executive Command Center" },
      { property: "og:description", content: "Group performance, pipeline, campaign delivery and exceptions consolidated in SAR." },
    ],
  }),
  component: ExecDashboard,
});
