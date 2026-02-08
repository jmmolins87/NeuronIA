import type { AgentState } from "@/lib/agent-v21/schema"

export function defaultAgentState(): AgentState {
  return {
    stage: "DISCOVERY",
    lead: { name: null, clinicName: null, city: null, email: null, phone: null, needs: [] },
    roiInputs: {
      clinicType: null,
      monthlyPatients: null,
      avgTicket: null,
      missedRate: null,
      leadsMonthly: null,
      conversionCurrentPct: null,
      avgTicketEur: null,
      setupCostEur: null,
      monthlyCostEur: null,
    },
    roiResult: null,
    booking: { date: null, time: null, sessionToken: null, expiresAt: null },
    lastOfferedSlots: [],
  }
}
