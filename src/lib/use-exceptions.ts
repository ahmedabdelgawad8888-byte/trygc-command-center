import { useMemo } from "react";
import { buildExceptions, type Exception } from "@/lib/derive";
import { useApp } from "@/lib/store";
import { fxRates } from "@/lib/data/seed";

export function useExceptions(): Exception[] {
  const { db, inScope } = useApp();
  return useMemo(() => {
    const fxMissing = db.entities
      .filter((e) => !fxRates.some((r) => r.currency === e.currency))
      .map((e) => ({ currency: e.currency, entityId: e.id }));
    return buildExceptions({
      deals: inScope(db.deals),
      campaigns: inScope(db.campaigns),
      campaignInfluencers: db.campaignInfluencers,
      influencers: db.influencers,
      tasks: inScope(db.tasks),
      invoices: inScope(db.invoices),
      clients: db.clients,
      users: db.users,
      coaPending: db.coaRequests.filter((r) => r.status === "Pending Review").length,
      fxMissing,
    });
  }, [db, inScope]);
}
