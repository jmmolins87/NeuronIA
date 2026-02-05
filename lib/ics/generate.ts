import "server-only"

import ical, { ICalCalendarMethod } from "ical-generator"

export function generateIcsBase64(args: {
  startAt: Date
  endAt: Date
  tz: string
  uid: string
  summary: string
  description: string
}): string {
  const cal = ical({
    name: "ClinvetIA",
  })

  cal.method(ICalCalendarMethod.REQUEST)
  cal.timezone({ name: args.tz })

  cal.createEvent({
    id: args.uid,
    start: args.startAt,
    end: args.endAt,
    summary: args.summary,
    description: args.description,
  })

  const ics = cal.toString()
  return Buffer.from(ics, "utf-8").toString("base64")
}
