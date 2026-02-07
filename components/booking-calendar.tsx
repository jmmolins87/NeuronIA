"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { DemoButton } from "@/components/cta/demo-button"
import { CancelButton } from "@/components/cta/cancel-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  onBookingComplete?: (data: BookingData) => void
  onDateSelected?: (date: Date) => void
}

export interface BookingData {
  date: Date
  time: string
  name: string
  email: string
  message?: string
}

const ALL_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", 
  // 13:00 - 16:00 descanso para comer (no hay horario)
  "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
]

// Horarios ocupados (9:00 - 16:30)
const OCCUPIED_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "16:00", "16:30"
]

export function BookingCalendar({ onBookingComplete, onDateSelected }: BookingCalendarProps) {
  const { t } = useTranslation()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const timeStepRef = React.useRef<HTMLDivElement | null>(null)

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
        block: "start",
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
      
      // Notificar que el usuario seleccionó una fecha
      onDateSelected?.(date)

      // Slide to the next step immediately.
      setStep(2)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      const bookingData: BookingData = {
        date: selectedDate,
        time: selectedTime,
        name: "",
        email: "",
        message: ""
      }
      onBookingComplete?.(bookingData)
    }
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
            "aspect-square rounded-lg text-sm font-medium transition-all",
            isAvailable
              ? "hover:bg-primary/10 hover:border-primary cursor-pointer"
              : "opacity-30 cursor-not-allowed",
            isSelected
              ? "bg-primary text-primary-foreground dark:glow-primary"
              : "bg-card border border-border text-foreground"
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
           <div ref={timeStepRef} className="space-y-6 scroll-mt-24">
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

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ALL_TIMES.map((time) => {
              const isOccupied = OCCUPIED_TIMES.includes(time)
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => !isOccupied && handleTimeSelect(time)}
                  disabled={isOccupied}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-all border-2",
                    isOccupied
                      ? "opacity-40 cursor-not-allowed bg-muted border-red-500 line-through"
                      : selectedTime === time
                        ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
                        : "bg-card border-border hover:bg-primary/10 hover:border-primary cursor-pointer"
                  )}
                >
                  {time}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end">
            <DemoButton
              onClick={() => setStep(3)}
              disabled={!selectedTime}
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

          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/30">
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

          <p className="text-base text-muted-foreground">{t("book.calendar.confirmMessage")}</p>

          <div className="flex justify-end">
            <DemoButton
              onClick={handleSubmit}
              className="w-auto cursor-pointer dark:glow-primary"
            >
              <Check className="w-5 h-5 mr-2" />
              {t("book.calendar.confirm")}
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
