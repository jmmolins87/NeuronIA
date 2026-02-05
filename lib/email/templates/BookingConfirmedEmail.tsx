import * as React from "react"

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"

import type { EmailLocale } from "@/lib/email/i18n"
import { t } from "@/lib/email/i18n"

interface BookingConfirmedEmailProps {
  locale: EmailLocale
  logoUrl: string
  title: string
  intro: string
  dateLabel: string
  timeLabel: string
  timezoneLabel: string
  detailsTitle: string
  actionsTitle: string
  dateText: string
  timeText: string
  timezoneText: string
  rescheduleUrl: string
  cancelUrl: string
}

const COLORS = {
  background: "#fbfcff",
  foreground: "#0b1630",
  card: "#ffffff",
  border: "#dbe3f3",
  primary: "#1f5bff",
  secondary: "#7c3aed",
  accent: "#5b5dff",
  gradientFrom: "#1f5bff",
  gradientTo: "#7c3aed",
}

export function BookingConfirmedEmail(props: BookingConfirmedEmailProps) {
  const preview = t(props.locale, "email.bookingConfirmed.preview")
  const footerLegal = t(props.locale, "email.bookingConfirmed.footerLegal")
  const companyLine = t(props.locale, "email.bookingConfirmed.companyLine")
  const rescheduleCta = t(props.locale, "email.bookingConfirmed.rescheduleCta")
  const cancelCta = t(props.locale, "email.bookingConfirmed.cancelCta")
  const rescheduleHint = t(props.locale, "email.bookingConfirmed.rescheduleHint")
  const cancelHint = t(props.locale, "email.bookingConfirmed.cancelHint")

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Section style={styles.headerInner}>
              <Img
                src={props.logoUrl}
                width={120}
                height={32}
                alt={companyLine}
                style={styles.logo}
              />
              <Text style={styles.headerTitle}>{props.title}</Text>
              <Text style={styles.headerIntro}>{props.intro}</Text>
            </Section>
          </Section>

          <Section style={styles.card}>
            <Text style={styles.cardTitle}>{props.detailsTitle}</Text>
            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>{props.dateLabel}</Text>
              <Text style={styles.detailValue}>{props.dateText}</Text>
            </Section>
            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>{props.timeLabel}</Text>
              <Text style={styles.detailValue}>{props.timeText}</Text>
            </Section>
            <Section style={styles.detailRow}>
              <Text style={styles.detailLabel}>{props.timezoneLabel}</Text>
              <Text style={styles.detailValue}>{props.timezoneText}</Text>
            </Section>
          </Section>

          <Section style={styles.card}>
            <Text style={styles.cardTitle}>{props.actionsTitle}</Text>
            <Text style={styles.hint}>{rescheduleHint}</Text>
            <Button href={props.rescheduleUrl} style={styles.primaryButton}>
              {rescheduleCta}
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.hint}>{cancelHint}</Text>
            <Section style={styles.outlineWrap}>
              <Section style={styles.outlineInner}>
                <Button href={props.cancelUrl} style={styles.outlineButton}>
                  {cancelCta}
                </Button>
              </Section>
            </Section>
          </Section>

          <Text style={styles.footer}>{footerLegal}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: COLORS.background,
    color: COLORS.foreground,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 12px",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
  },
  header: {
    backgroundColor: COLORS.primary,
    backgroundImage: `linear-gradient(135deg, ${COLORS.gradientFrom}, ${COLORS.gradientTo})`,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(31, 91, 255, 0.25)",
  },
  headerInner: {
    position: "relative",
    padding: "34px 24px 26px",
  },
  logo: {
    position: "absolute",
    top: 18,
    right: 18,
    opacity: 0.95,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: "30px",
    margin: "8px 0 10px",
  },
  headerIntro: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: "20px",
    margin: 0,
    maxWidth: 520,
  },
  card: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "18px 18px 16px",
    marginTop: 14,
    boxShadow: "0 10px 26px rgba(11, 22, 48, 0.06)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 800,
    margin: "0 0 10px",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  detailRow: {
    margin: "0 0 10px",
  },
  detailLabel: {
    fontSize: 12,
    color: "rgba(11, 22, 48, 0.7)",
    margin: 0,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 700,
    margin: "2px 0 0",
  },
  hint: {
    fontSize: 13,
    lineHeight: "19px",
    color: "rgba(11, 22, 48, 0.8)",
    margin: "0 0 12px",
  },
  primaryButton: {
    display: "inline-block",
    backgroundColor: COLORS.primary,
    backgroundImage: `linear-gradient(135deg, ${COLORS.gradientFrom}, ${COLORS.gradientTo})`,
    color: "#ffffff",
    fontWeight: 800,
    borderRadius: 14,
    padding: "12px 16px",
    textDecoration: "none",
    boxShadow: "0 12px 30px rgba(124, 58, 237, 0.25)",
  },
  hr: {
    borderColor: COLORS.border,
    margin: "16px 0",
  },
  outlineWrap: {
    backgroundImage: `linear-gradient(135deg, ${COLORS.gradientFrom}, ${COLORS.gradientTo})`,
    padding: 1,
    borderRadius: 14,
    display: "inline-block",
  },
  outlineInner: {
    backgroundColor: COLORS.card,
    borderRadius: 13,
    padding: 0,
  },
  outlineButton: {
    display: "inline-block",
    backgroundColor: "transparent",
    color: COLORS.foreground,
    fontWeight: 800,
    borderRadius: 13,
    padding: "11px 16px",
    textDecoration: "none",
  },
  footer: {
    fontSize: 12,
    lineHeight: "18px",
    color: "rgba(11, 22, 48, 0.7)",
    margin: "16px 4px 0",
  },
}
