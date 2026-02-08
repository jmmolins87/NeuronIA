import { z } from "zod"

export const ChatRoleSchema = z.enum(["user", "assistant"])
export const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z.string().min(1).max(6000),
})

export const StageSchema = z.enum([
  "DISCOVERY",
  "ROI",
  "BOOKING_DATE",
  "BOOKING_TIME",
  "HOLD_CREATED",
  "HANDOFF",
])

export const LeadSchema = z.object({
  name: z.string().min(1).max(120).nullable(),
  clinicName: z.string().min(1).max(160).nullable(),
  city: z.string().min(1).max(120).nullable(),
  email: z.string().min(3).max(200).nullable(),
  phone: z.string().min(5).max(40).nullable(),
  needs: z.array(z.string().min(1).max(80)).max(10),
})

export const RoiInputsSchema = z.object({
  clinicType: z.enum(["small", "medium", "large", "specialized"]).nullable(),
  monthlyPatients: z.number().int().min(0).max(20000).nullable(),
  avgTicket: z.number().int().min(0).max(10000).nullable(),
  missedRate: z.number().int().min(0).max(100).nullable(),

  // Generic ROI (leads/conversion)
  leadsMonthly: z.number().int().min(0).max(1_000_000).nullable().optional(),
  conversionCurrentPct: z.number().min(0).max(100).nullable().optional(),
  avgTicketEur: z.number().int().min(0).max(1_000_000).nullable().optional(),
  setupCostEur: z.number().int().min(0).max(1_000_000).nullable().optional(),
  monthlyCostEur: z.number().int().min(0).max(1_000_000).nullable().optional(),
})

export const RoiResultSchema = z.object({
  missedPatients: z.number().int(),
  recoveredPatients: z.number().int(),
  monthlyRevenue: z.number().int(),
  yearlyRevenue: z.number().int(),
  systemCost: z.number().int(),
  roi: z.number().int(),
  breakEvenDays: z.number().int(),

  // Generic ROI extras
  newConversionPct: z.number().optional(),
  extraSalesRounded: z.number().int().optional(),
  extraRevenueMonthly: z.number().int().optional(),
  roi3m: z.number().int().nullable().optional(),
  roi6m: z.number().int().nullable().optional(),
  roi12m: z.number().int().nullable().optional(),
})

export const BookingStateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  sessionToken: z.string().min(10).max(300).nullable(),
  expiresAt: z.string().min(10).max(60).nullable(),
})

export const AgentStateSchema = z.object({
  stage: StageSchema,
  lead: LeadSchema,
  roiInputs: RoiInputsSchema,
  roiResult: RoiResultSchema.nullable(),
  booking: BookingStateSchema,
  lastOfferedSlots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).max(8),
})

export type AgentState = z.infer<typeof AgentStateSchema>

export const ChatInputSchema = z.object({
  sessionId: z.string().min(8).max(200),
  locale: z.enum(["es", "en"]),
  timezone: z.string().min(1).max(64),
  page: z.string().min(1).max(300),
  messages: z.array(ChatMessageSchema).min(1).max(20),
  agentState: AgentStateSchema.optional(),
})

export type ChatInput = z.infer<typeof ChatInputSchema>

export const UiHoldSchema = z.object({
  sessionToken: z.string().min(10).max(300).nullable(),
  expiresAt: z.string().min(10).max(60).nullable(),
})

export const UiSchema = z.object({
  suggestedQuickReplies: z.array(z.string().min(1).max(80)).max(8),
  handoffUrl: z.string().min(1).max(300).nullable(),
  handoffLabel: z.string().min(1).max(80).nullable(),
  handoffPayload: z
    .object({
      booking: BookingStateSchema,
      roi: z.object({ inputs: RoiInputsSchema, result: RoiResultSchema }).nullable(),
      lead: LeadSchema,
    })
    .nullable(),
  hold: UiHoldSchema,
})

export const ChatOutputSchema = z.object({
  reply: z.string().min(1).max(5000),
  actions: z.array(z.never()).optional().default([]),
  lead: LeadSchema,
  roi: z.object({ inputs: RoiInputsSchema, result: RoiResultSchema }).nullable(),
  ui: UiSchema,
  agentState: AgentStateSchema,
})

export type ChatOutput = z.infer<typeof ChatOutputSchema>
