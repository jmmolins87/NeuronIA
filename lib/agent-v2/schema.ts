import { z } from "zod"

export const ChatRoleSchema = z.enum(["user", "assistant"])

export const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z.string().min(1).max(6000),
})

export const ChatInputSchema = z.object({
  sessionId: z.string().min(8).max(200),
  locale: z.enum(["es", "en"]),
  timezone: z.string().min(1).max(64),
  page: z.string().min(1).max(300),
  messages: z.array(ChatMessageSchema).min(1).max(20),
})

export type ChatInput = z.infer<typeof ChatInputSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm")

export const GetAvailabilityActionSchema = z.object({
  type: z.literal("getAvailability"),
  date: DateSchema,
})

export const CreateHoldActionSchema = z.object({
  type: z.literal("createHold"),
  date: DateSchema,
  time: TimeSchema,
})

export const AgentActionSchema = z.union([GetAvailabilityActionSchema, CreateHoldActionSchema])
export type AgentAction = z.infer<typeof AgentActionSchema>

export const LeadSchema = z.object({
  name: z.string().min(1).max(120).nullable(),
  clinicName: z.string().min(1).max(160).nullable(),
  city: z.string().min(1).max(120).nullable(),
  email: z.string().min(3).max(200).nullable(),
  phone: z.string().min(5).max(40).nullable(),
  needs: z.array(z.string().min(1).max(80)).max(10),
})

export const UiHoldSchema = z.object({
  sessionToken: z.string().min(10).max(300).nullable(),
  expiresAt: z.string().min(10).max(60).nullable(),
})

export const UiSchema = z.object({
  suggestedQuickReplies: z.array(z.string().min(1).max(80)).max(8),
  handoffUrl: z.string().min(1).max(300),
  handoffLabel: z.string().min(1).max(60),
  hold: UiHoldSchema,
})

export const AgentOutputSchema = z.object({
  reply: z.string().min(1).max(5000),
  actions: z.array(AgentActionSchema).max(2),
  lead: LeadSchema,
  ui: UiSchema,
})

export type AgentOutput = z.infer<typeof AgentOutputSchema>
