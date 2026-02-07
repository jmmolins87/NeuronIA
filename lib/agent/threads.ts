import "server-only"

import { Prisma } from "@prisma/client"
import type { AgentChannel } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface UpsertThreadArgs {
  channel: AgentChannel
  externalId: string
  locale: "es" | "en"
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  now: Date
}

export async function upsertAgentThread(args: UpsertThreadArgs) {
  return await prisma.agentThread.upsert({
    where: {
      channel_externalId: { channel: args.channel, externalId: args.externalId },
    },
    create: {
      channel: args.channel,
      externalId: args.externalId,
      locale: args.locale,
      customerName: args.customerName ?? null,
      customerEmail: args.customerEmail ?? null,
      customerPhone: args.customerPhone ?? null,
      status: "OPEN",
      lastMessageAt: args.now,
    },
    update: {
      locale: args.locale,
      customerName: args.customerName ?? undefined,
      customerEmail: args.customerEmail ?? undefined,
      customerPhone: args.customerPhone ?? undefined,
      status: "OPEN",
      lastMessageAt: args.now,
    },
  })
}

export async function createAgentMessage(args: {
  threadId: string
  direction: "IN" | "OUT"
  text: string
  raw: unknown
  now: Date
}) {
  return await prisma.agentMessage.create({
    data: {
      threadId: args.threadId,
      direction: args.direction,
      text: args.text,
      raw: args.raw as Prisma.InputJsonValue,
      createdAt: args.now,
    },
  })
}

export async function enqueueInboundMessageJob(args: {
  threadId: string
  messageId: string
  now: Date
}) {
  return await prisma.agentJob.create({
    data: {
      type: "PROCESS_INBOUND_MESSAGE",
      payload: { threadId: args.threadId, messageId: args.messageId },
      runAt: args.now,
      status: "PENDING",
    },
  })
}
