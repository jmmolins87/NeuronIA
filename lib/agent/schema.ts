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
  timezone: z.string().min(1).max(64),
  locale: z.enum(["es", "en"]),
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

// JSON Schema for OpenAI Responses API (response_format: json_schema)
export const AGENT_OUTPUT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "actions", "lead", "ui"],
  properties: {
    reply: { type: "string" },
    actions: {
      type: "array",
      maxItems: 2,
      items: {
        oneOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "date"],
            properties: {
              type: { const: "getAvailability" },
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "date", "time", "timezone", "locale"],
            properties: {
              type: { const: "createHold" },
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              time: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
              timezone: { type: "string" },
              locale: { enum: ["es", "en"] },
            },
          },
        ],
      },
    },
    lead: {
      type: "object",
      additionalProperties: false,
      required: ["name", "clinicName", "city", "email", "phone", "needs"],
      properties: {
        name: { anyOf: [{ type: "string" }, { type: "null" }] },
        clinicName: { anyOf: [{ type: "string" }, { type: "null" }] },
        city: { anyOf: [{ type: "string" }, { type: "null" }] },
        email: { anyOf: [{ type: "string" }, { type: "null" }] },
        phone: { anyOf: [{ type: "string" }, { type: "null" }] },
        needs: { type: "array", maxItems: 10, items: { type: "string" } },
      },
    },
    ui: {
      type: "object",
      additionalProperties: false,
      required: ["suggestedQuickReplies", "handoffUrl", "handoffLabel", "hold"],
      properties: {
        suggestedQuickReplies: { type: "array", maxItems: 8, items: { type: "string" } },
        handoffUrl: { type: "string" },
        handoffLabel: { type: "string" },
        hold: {
          type: "object",
          additionalProperties: false,
          required: ["sessionToken", "expiresAt"],
          properties: {
            sessionToken: { anyOf: [{ type: "string" }, { type: "null" }] },
            expiresAt: { anyOf: [{ type: "string" }, { type: "null" }] },
          },
        },
      },
    },
  },
}
