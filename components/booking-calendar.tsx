"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DemoButton } from "@/components/cta/demo-button"
import { CancelButton } from "@/components/cta/cancel-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import type { AvailabilitySlot, ConfirmResponse, EmailResult } from "@/lib/api/bookings"
import { createHold, confirmBooking, getAvailability } from "@/lib/api/bookings"
import { useROIData } from "@/hooks/use-roi-data"

interface BookingCalendarProps {
  onBookingComplete?: (data: BookingCompleteData) => void
  onDateSelected?: (date: Date) => void
}

export interface BookingData {
  date: Date
  time: string
  name: string
  email: string
  phone?: string
  clinicName?: string
  message?: string
}

export interface BookingCompleteData {
  date: Date
  time: string
  confirm: Exclude<ConfirmResponse, { ok: false }>
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function isSameDayLocal(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isAfterLocalCutoff1930(now: Date): boolean {
  const h = now.getHours()
  const m = now.getMinutes()
  return h > 19 || (h === 19 && m >= 30)
}

function secondsLeft(expiresAt: Date, now: Date): number {
  return Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${pad2(s)}`
}

function codeToMessage(code: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    SLOT_TAKEN: t("book.backend.errors.SLOT_TAKEN"),
    INVALID_INPUT: t("book.backend.errors.INVALID_INPUT"),
    INTERNAL_ERROR: t("book.backend.errors.INTERNAL_ERROR"),
    TOKEN_EXPIRED: t("book.backend.errors.TOKEN_EXPIRED"),
    TOKEN_INVALID: t("book.backend.errors.TOKEN_INVALID"),
    ROI_REQUIRED: t("book.backend.errors.ROI_REQUIRED"),
  }
  return map[code] ?? code
}

function emailNote(email: EmailResult | undefined, t: (key: string) => string): string | null {
  if (!email) return null
  if (email.enabled === false) return t("book.backend.email_disabled_note")
  return null
}

export function BookingCalendar({ onBookingComplete, onDateSelected }: BookingCalendarProps) {
  const { t, locale } = useTranslation()
  const { roiData, hasROIData } = useROIData()

  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const timeStepRef = React.useRef<HTMLDivElement | null>(null)

  const [availability, setAvailability] = React.useState<AvailabilitySlot[] | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = React.useState(false)
  const [availabilityError, setAvailabilityError] = React.useState<string | null>(null)

  const [hold, setHold] = React.useState<{ sessionToken: string; expiresAt: Date; date: string; time: string } | null>(null)
  const [holdSecondsLeft, setHoldSecondsLeft] = React.useState<number>(0)
  const [holding, setHolding] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)

  const [contact, setContact] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    clinicName: "",
    message: "",
  })

  // Load contact data from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("clinvetia-contact-draft")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object") {
          setContact({
            fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
            email: typeof parsed.email === "string" ? parsed.email : "",
            phone: typeof parsed.phone === "string" ? parsed.phone : "",
            clinicName: typeof parsed.clinicName === "string" ? parsed.clinicName : "",
            message: typeof parsed.message === "string" ? parsed.message : "",
          })
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save contact data to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem("clinvetia-contact-draft", JSON.stringify(contact))
    } catch {
      // Ignore storage errors
    }
  }, [contact])

  const isTodayCutoff = selectedDate ? isSameDayLocal(selectedDate, new Date()) && isAfterLocalCutoff1930(new Date()) : false

  React.useEffect(() => {
    if (step !== 2 || !selectedDate) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Wait for the slide transition to finish before scrolling.
    const delayMs = prefersReducedMotion ? 0 : 560
    const id = window.setTimeout(() => {
      timeStepRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }, delayMs)

    return () => window.clearTimeout(id)
  }, [selectedDate, step])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = new Date(date)
    day.setHours(0, 0, 0, 0)
    
    // No weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    
    // Not in the past
    if (day < today) return false
    
    // Not more than 60 days in the future
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 60)
    if (day > maxDate) return false
    
    return true
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day)
    if (isDateAvailable(date)) {
      setSelectedDate(date)
      setSelectedTime(null)
      setHold(null)
      setAvailability(null)
      setAvailabilityError(null)

      // Notificar que el usuario seleccionó una fecha
      onDateSelected?.(date)

      const isoDate = toIsoDate(date)
      setAvailabilityLoading(true)
      void (async () => {
        const res = await getAvailability(isoDate)
        if (res.ok) {
          setAvailability(res.slots)
          setAvailabilityError(null)
        } else {
          setAvailability(null)
          setAvailabilityError(res.code)
          toast.error(codeToMessage(res.code, t))
        }
        setAvailabilityLoading(false)
      })()

      // Slide to the next step immediately.
      setStep(2)
    }
  }

  const handleTimeSelect = async (time: string) => {
    if (!selectedDate) return
    if (hold && hold.time !== time) return
    if (isTodayCutoff) return

    setSelectedTime(time)
    if (hold) return

    const isoDate = toIsoDate(selectedDate)
    setHolding(true)
    const res = await createHold({ date: isoDate, time, timezone: "Europe/Madrid", locale })
    setHolding(false)

    if (!res.ok) {
      setHold(null)
      toast.error(codeToMessage(res.code, t))
      const refreshed = await getAvailability(isoDate)
      if (refreshed.ok) setAvailability(refreshed.slots)
      return
    }

    const expiresAtISO = res.booking.expiresAtISO
    if (!expiresAtISO) {
      setHold(null)
      toast.error(codeToMessage("INTERNAL_ERROR", t))
      return
    }

    const expiresAt = new Date(expiresAtISO)
    setHold({ sessionToken: res.sessionToken, expiresAt, date: isoDate, time })
    setHoldSecondsLeft(secondsLeft(expiresAt, new Date()))
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !hold) return
    if (!hasROIData || !roiData) {
      toast.error(t("book.backend.errors.ROI_REQUIRED"))
      return
    }

    if (!contact.fullName.trim() || !contact.email.trim() || !contact.phone.trim()) {
      toast.error(t("book.backend.errors.INVALID_INPUT"))
      return
    }

    const res = await confirmBooking({
      sessionToken: hold.sessionToken,
      locale,
      contact: {
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        ...(contact.clinicName.trim() ? { clinicName: contact.clinicName.trim() } : {}),
        ...(contact.message.trim() ? { message: contact.message.trim() } : {}),
      },
      roi: roiData,
    })

    if (!res.ok) {
      toast.error(codeToMessage(res.code, t))
      if (res.code === "SLOT_TAKEN" && selectedDate) {
        const isoDate = toIsoDate(selectedDate)
        const refreshed = await getAvailability(isoDate)
        if (refreshed.ok) setAvailability(refreshed.slots)
      }
      return
    }

    const note = emailNote(res.email, t)
    if (note) toast.message(note)

    // Clear the saved contact draft since booking is confirmed
    try {
      localStorage.removeItem("clinvetia-contact-draft")
    } catch {
      // Ignore storage errors
    }

    toast.success(t("book.backend.confirm_success"))
    onBookingComplete?.({ date: selectedDate, time: selectedTime, confirm: res })
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const formatDate = (date: Date) => {
    const locale = t("common.locale")
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  React.useEffect(() => {
    if (!hold) {
      setHoldSecondsLeft(0)
      return
    }

    const tick = () => {
      const left = secondsLeft(hold.expiresAt, new Date())
      setHoldSecondsLeft(left)
      if (left === 0) {
        setHold(null)
        setSelectedTime(null)
        if (selectedDate) {
          const isoDate = toIsoDate(selectedDate)
          setAvailabilityLoading(true)
          void (async () => {
            const refreshed = await getAvailability(isoDate)
            if (refreshed.ok) {
              setAvailability(refreshed.slots)
              setAvailabilityError(null)
            }
            setAvailabilityLoading(false)
          })()
        }
      }
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [hold, selectedDate])

  const days = []
  const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7
  
  for (let i = 0; i < totalSlots; i++) {
    if (i < startingDayOfWeek) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    } else if (i < daysInMonth + startingDayOfWeek) {
      const day = i - startingDayOfWeek + 1
      const date = new Date(year, month, day)
      const isAvailable = isDateAvailable(date)
      const isSelected = selectedDate?.getDate() === day && 
                        selectedDate?.getMonth() === month && 
                        selectedDate?.getFullYear() === year

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={!isAvailable}
          className={cn(
            "aspect-square rounded-lg text-sm font-medium transition-all border border-border bg-card text-foreground",
            isAvailable
              ? "hover:bg-primary/10 hover:border-primary cursor-pointer"
              : "opacity-30 cursor-not-allowed",
            isSelected
              ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
              : ""
          )}
        >
          {day}
        </button>
      )
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Info Box - What's included */}
      <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
        <div className="flex items-start gap-3">
          <Info className="w-10 h-10 text-blue-500 dark:text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-2 text-foreground text-base">
              {t("book.info.title")}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t("book.info.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Steps Container with Slide Animation */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "flex transition-transform duration-500 ease-in-out motion-reduce:transition-none",
            step === 1 && "translate-x-0",
            step === 2 && "-translate-x-full",
            step === 3 && "-translate-x-[200%]"
          )}
        >
          {/* Step 1: Select Date */}
          <div className="w-full shrink-0 space-y-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {t("book.calendar.selectDate")}
                  </h3>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousMonth}
                    className="cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h4 className="text-lg font-semibold">
                    {currentMonth.toLocaleDateString(t("common.locale"), {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                    className="cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                      {t(`book.calendar.weekdays.${day}`)}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">{days}</div>
              </div>
            ) : null}
          </div>

       {/* Step 2: Select Time */}
       <div className="w-full shrink-0 space-y-6">
         {step === 2 && selectedDate ? (
            <div ref={timeStepRef} className="space-y-6 scroll-mt-4 md:scroll-mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("book.calendar.selectTime")}
            </h3>
            <CancelButton
              size="sm"
              onClick={() => setStep(1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("common.back")}
            </CancelButton>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/30">
            <p className="text-sm font-medium text-foreground">{formatDate(selectedDate)}</p>
          </div>

           {availabilityLoading ? (
             <div className="rounded-lg border border-primary/20 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 p-8">
               <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="relative">
                   <Loader2 className="w-10 h-10 text-primary animate-spin" />
                   <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                 </div>
                 <div className="text-center space-y-1">
                   <p className="text-sm font-medium text-foreground">
                     {t("book.backend.searching_slots")}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {t("book.backend.searching_subtitle")}
                   </p>
                 </div>
               </div>
             </div>
           ) : availabilityError ? (
             <div className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">
               {codeToMessage(availabilityError, t)}
             </div>
           ) : availability && availability.length > 0 ? (
             <div className="space-y-4">
               {hold ? (
                 <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
                   <CardHeader className="pb-3">
                     <CardTitle className="text-base">{t("book.backend.hold_title")}</CardTitle>
                   </CardHeader>
                   <CardContent className="text-sm text-muted-foreground">
                     {t("book.backend.hold_countdown", { time: formatCountdown(holdSecondsLeft) })}
                   </CardContent>
                 </Card>
               ) : null}

               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availability.map((slot) => {
                   const isSelected = selectedTime === slot.start
                   const disabledByCutoff = isTodayCutoff
                   const disabledByHold = Boolean(hold && hold.time !== slot.start)
                   const disabledByAvailability = !slot.available && !(hold && hold.time === slot.start)
                   const disabled = disabledByCutoff || disabledByHold || disabledByAvailability || holding

                   const label = slot.start
                   const tooltipText = disabledByCutoff
                     ? t("book.backend.tooltip_1930")
                     : disabledByAvailability
                       ? t("book.backend.errors.SLOT_TAKEN")
                       : null

                   const btn = (
                     <button
                       key={slot.start}
                       type="button"
                       onClick={() => void handleTimeSelect(slot.start)}
                       disabled={disabled}
                       className={cn(
                         "p-3 rounded-lg text-sm font-medium transition-all border-2",
                         disabled
                           ? "opacity-40 cursor-not-allowed bg-muted border-border"
                           : isSelected
                             ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
                             : "bg-card border-border hover:bg-primary/10 hover:border-primary cursor-pointer"
                       )}
                     >
                       {label}
                     </button>
                   )

                   if (!tooltipText || !disabled) return btn

                   return (
                     <Tooltip key={`${slot.start}-tt`}>
                       <TooltipTrigger asChild>
                         <span className="inline-flex">{btn}</span>
                       </TooltipTrigger>
                       <TooltipContent side="top">{tooltipText}</TooltipContent>
                     </Tooltip>
                   )
                 })}
               </div>
             </div>
           ) : (
             <div className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">
               {t("book.calendar.noSlotsAvailable")}
             </div>
           )}

           <div className="flex justify-end">
             <DemoButton
               onClick={() => setStep(3)}
               disabled={!selectedTime || !hold || holding}
               className="w-auto cursor-pointer dark:glow-primary"
             >
               {t("common.continue")}
             </DemoButton>
           </div>
        </div>
        ) : null}
      </div>

       {/* Step 3: Confirm Details */}
       <div className="w-full shrink-0 space-y-6">
         {step === 3 && selectedDate && selectedTime ? (
           <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              {t("book.calendar.confirmDetails")}
            </h3>
            <CancelButton
              size="sm"
              onClick={() => setStep(2)}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("common.back")}
            </CancelButton>
          </div>

          <div className="p-6 rounded-lg bg-linear-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/30">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>
          </div>

           {!hasROIData ? (
             <div className="rounded-lg border border-border bg-card/70 p-4 text-sm text-muted-foreground">
               {t("contact.form.roiRequired")}
             </div>
           ) : null}

           {!hold ? (
             <div className="rounded-lg border border-border bg-card/70 p-4 text-sm text-muted-foreground">
               {t("book.backend.hold_missing")}
             </div>
           ) : (
             <div className="rounded-lg border border-border bg-card/70 p-4 text-sm text-muted-foreground">
               {t("book.backend.hold_countdown", { time: formatCountdown(holdSecondsLeft) })}
             </div>
           )}

           <Card className="border-border bg-card/80 backdrop-blur-sm">
             <CardHeader className="pb-3">
               <CardTitle className="text-base">{t("book.backend.contact_title")}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid gap-4 sm:grid-cols-2">
                 <div className="space-y-2">
                   <Label htmlFor="booking-fullName">{t("book.calendar.name")}</Label>
                   <Input
                     id="booking-fullName"
                     value={contact.fullName}
                     onChange={(e) => setContact((p) => ({ ...p, fullName: e.target.value }))}
                     placeholder={t("book.calendar.namePlaceholder")}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="booking-email">{t("book.calendar.email")}</Label>
                   <Input
                     id="booking-email"
                     value={contact.email}
                     onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                     placeholder={t("book.calendar.emailPlaceholder")}
                   />
                 </div>
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                 <div className="space-y-2">
                   <Label htmlFor="booking-phone">{t("contact.form.fields.phone.label")}</Label>
                   <Input
                     id="booking-phone"
                     value={contact.phone}
                     onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                     placeholder={t("contact.form.fields.phone.placeholder")}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="booking-clinic">{t("book.form.clinic.label")}</Label>
                   <Input
                     id="booking-clinic"
                     value={contact.clinicName}
                     onChange={(e) => setContact((p) => ({ ...p, clinicName: e.target.value }))}
                     placeholder={t("book.form.clinic.placeholder")}
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="booking-message">{t("book.calendar.message")}</Label>
                 <Textarea
                   id="booking-message"
                   value={contact.message}
                   onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
                   placeholder={t("book.calendar.messagePlaceholder")}
                 />
               </div>
             </CardContent>
           </Card>

           <p className="text-base text-muted-foreground">{t("book.calendar.confirmMessage")}</p>

           <div className="flex justify-end">
             <DemoButton
               onClick={() => {
                 if (confirming) return
                 setConfirming(true)
                 void (async () => {
                   try {
                     await handleSubmit()
                   } finally {
                     setConfirming(false)
                   }
                 })()
               }}
               disabled={
                 confirming ||
                 !hold ||
                 holdSecondsLeft <= 0 ||
                 !hasROIData ||
                 !contact.fullName.trim() ||
                 !contact.email.trim() ||
                 !contact.phone.trim()
               }
               className="w-auto cursor-pointer dark:glow-primary"
             >
               <Check className="w-5 h-5 mr-2" />
               {confirming ? t("common.loading") : t("book.calendar.confirm")}
             </DemoButton>
           </div>
         </div>
         ) : null}
       </div>
        </div>
      </div>
    </div>
  )
}
