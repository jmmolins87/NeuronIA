"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, User, Mail, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  onBookingComplete?: (data: BookingData) => void
  prefillName?: string
  prefillEmail?: string
}

export interface BookingData {
  date: Date
  time: string
  name: string
  email: string
  message?: string
}

const AVAILABLE_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
]

export function BookingCalendar({ onBookingComplete, prefillName = "", prefillEmail = "" }: BookingCalendarProps) {
  const { t } = useTranslation()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: prefillName,
    email: prefillEmail,
    message: ""
  })

  // Update form when prefill changes
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: prefillName || prev.name,
      email: prefillEmail || prev.email,
    }))
  }, [prefillName, prefillEmail])

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
    date.setHours(0, 0, 0, 0)
    
    // No weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    
    // Not in the past
    if (date < today) return false
    
    // Not more than 60 days in the future
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 60)
    if (date > maxDate) return false
    
    return true
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day)
    if (isDateAvailable(date)) {
      setSelectedDate(date)
      setStep(2)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDate && selectedTime && formData.name && formData.email) {
      const bookingData: BookingData = {
        date: selectedDate,
        time: selectedTime,
        name: formData.name,
        email: formData.email,
        message: formData.message
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
    return date.toLocaleDateString(t("common.locale") === "es" ? "es-ES" : "en-US", {
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
    <div className="w-full">
      {/* Step 1: Select Date */}
      {step === 1 && (
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
              {currentMonth.toLocaleDateString(t("common.locale") === "es" ? "es-ES" : "en-US", {
                month: "long",
                year: "numeric"
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
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">
              {t("book.calendar.availabilityNote")}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Select Time */}
      {step === 2 && selectedDate && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("book.calendar.selectTime")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("common.back")}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/30">
            <p className="text-sm font-medium text-foreground">
              {formatDate(selectedDate)}
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {AVAILABLE_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeSelect(time)}
                className={cn(
                  "p-3 rounded-lg text-sm font-medium transition-all border",
                  selectedTime === time
                    ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
                    : "bg-card border-border hover:bg-primary/10 hover:border-primary cursor-pointer"
                )}
              >
                {time}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep(3)}
            disabled={!selectedTime}
            className="w-full cursor-pointer dark:glow-primary"
            size="lg"
          >
            {t("common.continue")}
          </Button>
        </div>
      )}

      {/* Step 3: Confirm Details */}
      {step === 3 && selectedDate && selectedTime && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              {t("book.calendar.confirmDetails")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(2)}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("common.back")}
            </Button>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-name">{t("book.calendar.name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="booking-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("book.calendar.namePlaceholder")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-email">{t("book.calendar.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="booking-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("book.calendar.emailPlaceholder")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-message">{t("book.calendar.message")}</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="booking-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("book.calendar.messagePlaceholder")}
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer dark:glow-primary"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              {t("book.calendar.confirm")}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
