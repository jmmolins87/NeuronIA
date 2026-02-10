/**
 * Demo Data Generator
 * 
 * Generates realistic mock data for DEMO mode admin users.
 * Uses seeded random generation for deterministic results.
 */

export type DemoBookingStatus = "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "RESCHEDULED"

export interface DemoBooking {
  id: string
  uid: string
  status: DemoBookingStatus
  startAt: Date
  endAt: Date
  timezone: string
  locale: string
  contactName: string
  contactEmail: string
  contactPhone: string
  contactClinicName: string
  contactMessage: string | null
  roiData: DemoROIData | null
  confirmedAt: Date | null
  cancelledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface DemoROIData {
  monthlyInvestment: number
  estimatedAppointments: number
  estimatedRevenue: number
  estimatedProfit: number
  roi: number
  paybackMonths: number
}

export interface DemoLead {
  id: string
  contactName: string
  contactEmail: string
  contactPhone: string
  contactClinicName: string
  message: string
  source: "WEB_FORM" | "EMAIL" | "WHATSAPP"
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
  createdAt: Date
}

export interface DemoROICalculation {
  id: string
  clinicName: string | null
  contactEmail: string | null
  monthlyInvestment: number
  estimatedAppointments: number
  estimatedRevenue: number
  estimatedProfit: number
  roi: number
  paybackMonths: number
  createdAt: Date
}

export interface DemoDataSet {
  bookings: DemoBooking[]
  leads: DemoLead[]
  roiCalculations: DemoROICalculation[]
  seed: string
  generatedAt: Date
}

/**
 * Seeded Random Number Generator (Mulberry32)
 * Same seed = same sequence of "random" numbers
 */
class SeededRandom {
  private seed: number

  constructor(seed: string) {
    // Convert string seed to number
    this.seed = this.hashString(seed)
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  next(): number {
    let t = this.seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextElement<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  nextBoolean(probability = 0.5): boolean {
    return this.next() < probability
  }
}

// Mock data pools
const FIRST_NAMES = [
  "Carlos", "María", "José", "Ana", "Juan", "Laura", "Pedro", "Carmen", "Luis", "Isabel",
  "Miguel", "Elena", "Antonio", "Rosa", "Francisco", "Pilar", "Manuel", "Teresa", "Javier", "Dolores"
]

const LAST_NAMES = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
  "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez"
]

const CLINIC_NAMES = [
  "Clínica Veterinaria San Francisco", "Hospital Veterinario Central", "Clínica Veterinaria El Bosque",
  "Centro Veterinario Madrid", "Clínica Veterinaria Los Ángeles", "Hospital de Mascotas Barcelona",
  "Clínica Veterinaria La Esperanza", "Centro de Salud Animal Valencia", "Clínica Veterinaria El Roble",
  "Hospital Veterinario Sevilla", "Clínica Veterinaria Las Palmas", "Centro Veterinario Bilbao",
  "Clínica Veterinaria El Prado", "Hospital de Animales Zaragoza", "Clínica Veterinaria Santa Clara"
]

const MESSAGES = [
  "Me gustaría información sobre vuestros servicios de automatización",
  "Necesito mejorar la gestión de citas en mi clínica",
  "Estoy interesado en implementar IA para atención al cliente",
  "Quiero reducir la carga administrativa de mi equipo",
  "Me interesa conocer cómo funcionan vuestras soluciones",
  "Necesito automatizar el seguimiento de pacientes",
  "Quiero optimizar los procesos de mi clínica veterinaria",
  "Estoy buscando soluciones para mejorar la eficiencia",
  null, null // Some bookings have no message
]

const LEAD_MESSAGES = [
  "Vi vuestra web y me interesa conocer más sobre ClinvetIA",
  "Un colega me recomendó vuestros servicios de automatización",
  "Necesito ayuda urgente con la gestión de mi clínica",
  "Quiero agendar una demo para ver cómo funciona el sistema",
  "Estoy comparando diferentes soluciones de IA para veterinarias",
  "¿Cuánto cuesta implementar vuestro sistema completo?",
  "Necesito más información sobre el ROI de vuestra solución"
]

/**
 * Generate a random date within a range
 */
function randomDate(rng: SeededRandom, start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const randomTime = startTime + rng.next() * (endTime - startTime)
  return new Date(randomTime)
}

/**
 * Generate a random email from a name
 */
function generateEmail(firstName: string, lastName: string, rng: SeededRandom): string {
  const domains = ["gmail.com", "hotmail.com", "yahoo.es", "outlook.com", "icloud.com"]
  const separators = ["", ".", "_"]
  const sep = rng.nextElement(separators)
  const domain = rng.nextElement(domains)
  return `${firstName.toLowerCase()}${sep}${lastName.toLowerCase()}@${domain}`
}

/**
 * Generate a random Spanish phone number
 */
function generatePhone(rng: SeededRandom): string {
  const prefix = rng.nextElement(["6", "7"])
  const number = Array.from({ length: 8 }, () => rng.nextInt(0, 9)).join("")
  return `${prefix}${number}`
}

/**
 * Generate ROI data
 */
function generateROIData(rng: SeededRandom): DemoROIData {
  const monthlyInvestment = rng.nextInt(200, 1000)
  const estimatedAppointments = rng.nextInt(10, 50)
  const avgRevenuePerAppointment = rng.nextInt(50, 200)
  const estimatedRevenue = estimatedAppointments * avgRevenuePerAppointment
  const estimatedProfit = estimatedRevenue - monthlyInvestment
  const roi = Math.round((estimatedProfit / monthlyInvestment) * 100)
  const paybackMonths = roi > 0 ? Math.ceil(monthlyInvestment / (estimatedProfit / 1)) : 12
  
  return {
    monthlyInvestment,
    estimatedAppointments,
    estimatedRevenue,
    estimatedProfit,
    roi,
    paybackMonths: Math.min(paybackMonths, 12)
  }
}

/**
 * Generate demo bookings
 */
function generateDemoBookings(rng: SeededRandom, count: number): DemoBooking[] {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  
  const bookings: DemoBooking[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = rng.nextElement(FIRST_NAMES)
    const lastName = rng.nextElement(LAST_NAMES)
    const clinicName = rng.nextElement(CLINIC_NAMES)
    
    // Distribute bookings: 60% past, 40% future
    const isPast = rng.nextBoolean(0.6)
    const createdAt = isPast
      ? randomDate(rng, thirtyDaysAgo, now)
      : randomDate(rng, now, fourteenDaysAhead)
    
    // Start time during business hours (9:00 - 17:00)
    const startAt = new Date(createdAt)
    startAt.setHours(rng.nextInt(9, 16), rng.nextInt(0, 1) * 30, 0, 0)
    
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000) // 30 min slots
    
    // Status distribution
    let status: DemoBookingStatus
    let confirmedAt: Date | null = null
    let cancelledAt: Date | null = null
    
    if (isPast) {
      const statusWeights = [
        { status: "CONFIRMED" as const, weight: 0.7 },
        { status: "CANCELLED" as const, weight: 0.2 },
        { status: "EXPIRED" as const, weight: 0.1 }
      ]
      const rand = rng.next()
      let cumulative = 0
      status = "CONFIRMED"
      for (const { status: s, weight } of statusWeights) {
        cumulative += weight
        if (rand < cumulative) {
          status = s
          break
        }
      }
      
      if (status === "CONFIRMED") {
        confirmedAt = new Date(createdAt.getTime() + rng.nextInt(1, 60) * 60 * 1000)
      } else if (status === "CANCELLED") {
        cancelledAt = new Date(createdAt.getTime() + rng.nextInt(1, 120) * 60 * 1000)
      }
    } else {
      // Future bookings
      const statusWeights = [
        { status: "CONFIRMED" as const, weight: 0.5 },
        { status: "HELD" as const, weight: 0.5 }
      ]
      const rand = rng.next()
      status = rand < statusWeights[0].weight ? statusWeights[0].status : statusWeights[1].status
      
      if (status === "CONFIRMED") {
        confirmedAt = new Date(createdAt.getTime() + rng.nextInt(1, 60) * 60 * 1000)
      }
    }
    
    const hasROI = rng.nextBoolean(0.7) // 70% have ROI data
    
    bookings.push({
      id: `demo-booking-${i.toString().padStart(5, "0")}`,
      uid: `DEMO${i.toString().padStart(6, "0")}`,
      status,
      startAt,
      endAt,
      timezone: "Europe/Madrid",
      locale: "es",
      contactName: `${firstName} ${lastName}`,
      contactEmail: generateEmail(firstName, lastName, rng),
      contactPhone: generatePhone(rng),
      contactClinicName: clinicName,
      contactMessage: rng.nextElement(MESSAGES),
      roiData: hasROI ? generateROIData(rng) : null,
      confirmedAt,
      cancelledAt,
      createdAt,
      updatedAt: createdAt
    })
  }
  
  // Sort by startAt descending (most recent first)
  return bookings.sort((a, b) => b.startAt.getTime() - a.startAt.getTime())
}

/**
 * Generate demo leads
 */
function generateDemoLeads(rng: SeededRandom, count: number): DemoLead[] {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const leads: DemoLead[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = rng.nextElement(FIRST_NAMES)
    const lastName = rng.nextElement(LAST_NAMES)
    const clinicName = rng.nextElement(CLINIC_NAMES)
    const createdAt = randomDate(rng, thirtyDaysAgo, now)
    
    // Status distribution based on age
    const ageInDays = (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
    let status: DemoLead["status"]
    
    if (ageInDays < 2) {
      status = "NEW"
    } else if (ageInDays < 7) {
      status = rng.nextElement(["NEW", "CONTACTED", "CONTACTED"])
    } else if (ageInDays < 14) {
      status = rng.nextElement(["CONTACTED", "QUALIFIED", "QUALIFIED"])
    } else {
      status = rng.nextElement(["QUALIFIED", "CONVERTED", "LOST"])
    }
    
    leads.push({
      id: `demo-lead-${i.toString().padStart(5, "0")}`,
      contactName: `${firstName} ${lastName}`,
      contactEmail: generateEmail(firstName, lastName, rng),
      contactPhone: generatePhone(rng),
      contactClinicName: clinicName,
      message: rng.nextElement(LEAD_MESSAGES),
      source: rng.nextElement(["WEB_FORM", "EMAIL", "WHATSAPP"] as const),
      status,
      createdAt
    })
  }
  
  // Sort by createdAt descending
  return leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Generate demo ROI calculations
 */
function generateDemoROICalculations(rng: SeededRandom, count: number): DemoROICalculation[] {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const calculations: DemoROICalculation[] = []
  
  for (let i = 0; i < count; i++) {
    const hasContact = rng.nextBoolean(0.6) // 60% have contact info
    const firstName = hasContact ? rng.nextElement(FIRST_NAMES) : null
    const lastName = hasContact ? rng.nextElement(LAST_NAMES) : null
    const clinicName = rng.nextBoolean(0.8) ? rng.nextElement(CLINIC_NAMES) : null
    
    calculations.push({
      id: `demo-roi-${i.toString().padStart(5, "0")}`,
      clinicName,
      contactEmail: hasContact && firstName && lastName ? generateEmail(firstName, lastName, rng) : null,
      ...generateROIData(rng),
      createdAt: randomDate(rng, thirtyDaysAgo, now)
    })
  }
  
  // Sort by createdAt descending
  return calculations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Generate complete demo dataset
 */
export function generateDemoData(seed?: string): DemoDataSet {
  const actualSeed = seed || `demo-${Date.now()}`
  const rng = new SeededRandom(actualSeed)
  
  // Generate variable counts for realism
  const bookingCount = rng.nextInt(300, 800)
  const leadCount = rng.nextInt(500, 1500)
  const roiCount = rng.nextInt(200, 600)
  
  return {
    bookings: generateDemoBookings(rng, bookingCount),
    leads: generateDemoLeads(rng, leadCount),
    roiCalculations: generateDemoROICalculations(rng, roiCount),
    seed: actualSeed,
    generatedAt: new Date()
  }
}

/**
 * Get default demo data (consistent seed for all demo users)
 */
export function getDefaultDemoData(): DemoDataSet {
  return generateDemoData("clinvetia-demo-v1")
}
