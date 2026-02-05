export type BookingStatus =
  | "HELD"
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "EXPIRED"

export type BookingLocale = "es" | "en"

export interface Booking {
  id: string
  startAt: string
  durationMinutes: number
  status: BookingStatus
  email: string
  name: string
  locale: BookingLocale
  createdAt: string
  form: {
    company: string
    role: string
    clinicSize: string
    goals: string
    notes: string
  }
  roi: {
    currentLeadsPerMonth: number
    avgTicketEur: number
    conversionRatePct: number
    estimatedUpliftPct: number
  }
}

export interface ActivityEvent {
  id: string
  at: string
  title: string
  description?: string
  bookingId?: string
  tone?: "neutral" | "good" | "warn" | "bad"
}

export const BOOKINGS: Booking[] = [
  {
    id: "BKG-1001",
    startAt: "2026-02-04T09:30:00.000Z",
    durationMinutes: 30,
    status: "CONFIRMED",
    email: "maria.santos@clinicavita.es",
    name: "Maria Santos",
    locale: "es",
    createdAt: "2026-01-30T10:12:00.000Z",
    form: {
      company: "Clinica Vita",
      role: "Gerencia",
      clinicSize: "3-5 veterinarios",
      goals: "Mejorar conversion y reducir no-shows",
      notes: "Interes en automatizar confirmaciones y recordatorios.",
    },
    roi: {
      currentLeadsPerMonth: 120,
      avgTicketEur: 85,
      conversionRatePct: 18,
      estimatedUpliftPct: 12,
    },
  },
  {
    id: "BKG-1002",
    startAt: "2026-02-04T11:00:00.000Z",
    durationMinutes: 45,
    status: "HELD",
    email: "john.meyer@petcare.io",
    name: "John Meyer",
    locale: "en",
    createdAt: "2026-01-28T15:40:00.000Z",
    form: {
      company: "PetCare Group",
      role: "Operations",
      clinicSize: "6-10 vets",
      goals: "Streamline inbound and reduce admin overhead",
      notes: "Wants a dashboard for bookings + follow-ups.",
    },
    roi: {
      currentLeadsPerMonth: 260,
      avgTicketEur: 110,
      conversionRatePct: 14,
      estimatedUpliftPct: 10,
    },
  },
  {
    id: "BKG-1003",
    startAt: "2026-02-03T16:00:00.000Z",
    durationMinutes: 30,
    status: "CANCELLED",
    email: "laura.moreno@animaplus.es",
    name: "Laura Moreno",
    locale: "es",
    createdAt: "2026-01-25T09:05:00.000Z",
    form: {
      company: "AnimaPlus",
      role: "Marketing",
      clinicSize: "1-2 veterinarios",
      goals: "Captar mas leads desde Google",
      notes: "Cancelada por cambio de agenda.",
    },
    roi: {
      currentLeadsPerMonth: 60,
      avgTicketEur: 70,
      conversionRatePct: 22,
      estimatedUpliftPct: 8,
    },
  },
  {
    id: "BKG-1004",
    startAt: "2026-02-05T10:00:00.000Z",
    durationMinutes: 30,
    status: "RESCHEDULED",
    email: "diego.ramos@veterinariaoasis.es",
    name: "Diego Ramos",
    locale: "es",
    createdAt: "2026-01-22T11:22:00.000Z",
    form: {
      company: "Veterinaria Oasis",
      role: "Propietario",
      clinicSize: "2-3 veterinarios",
      goals: "Reducir tiempos de respuesta en WhatsApp",
      notes: "Pidio mover la demo a la semana siguiente.",
    },
    roi: {
      currentLeadsPerMonth: 95,
      avgTicketEur: 78,
      conversionRatePct: 16,
      estimatedUpliftPct: 15,
    },
  },
  {
    id: "BKG-1005",
    startAt: "2026-02-01T13:30:00.000Z",
    durationMinutes: 30,
    status: "EXPIRED",
    email: "sophie.lee@northvet.co",
    name: "Sophie Lee",
    locale: "en",
    createdAt: "2026-01-18T08:58:00.000Z",
    form: {
      company: "NorthVet",
      role: "Founder",
      clinicSize: "1 vet",
      goals: "Automate intake and reminders",
      notes: "No show, no response.",
    },
    roi: {
      currentLeadsPerMonth: 35,
      avgTicketEur: 95,
      conversionRatePct: 20,
      estimatedUpliftPct: 6,
    },
  },
  {
    id: "BKG-1006",
    startAt: "2026-02-06T08:30:00.000Z",
    durationMinutes: 45,
    status: "CONFIRMED",
    email: "andrea.garcia@medivet.es",
    name: "Andrea Garcia",
    locale: "es",
    createdAt: "2026-01-20T17:31:00.000Z",
    form: {
      company: "MediVet",
      role: "Administracion",
      clinicSize: "6-10 veterinarios",
      goals: "Centralizar reservas y reducir llamadas",
      notes: "Quiere reportes semanales.",
    },
    roi: {
      currentLeadsPerMonth: 300,
      avgTicketEur: 120,
      conversionRatePct: 12,
      estimatedUpliftPct: 14,
    },
  },
  {
    id: "BKG-1007",
    startAt: "2026-02-06T14:00:00.000Z",
    durationMinutes: 30,
    status: "HELD",
    email: "carlos.navarro@vetcenter.es",
    name: "Carlos Navarro",
    locale: "es",
    createdAt: "2026-01-21T12:44:00.000Z",
    form: {
      company: "VetCenter",
      role: "Direccion",
      clinicSize: "3-5 veterinarios",
      goals: "Mejorar atencion post-consulta",
      notes: "Interesado en integraciones a futuro.",
    },
    roi: {
      currentLeadsPerMonth: 180,
      avgTicketEur: 90,
      conversionRatePct: 17,
      estimatedUpliftPct: 9,
    },
  },
  {
    id: "BKG-1008",
    startAt: "2026-02-02T10:15:00.000Z",
    durationMinutes: 30,
    status: "CANCELLED",
    email: "emma.dupont@petclinic.fr",
    name: "Emma Dupont",
    locale: "en",
    createdAt: "2026-01-19T09:12:00.000Z",
    form: {
      company: "PetClinic",
      role: "Manager",
      clinicSize: "2-3 vets",
      goals: "Reduce churn and improve follow-ups",
      notes: "Cancelled due to internal meeting.",
    },
    roi: {
      currentLeadsPerMonth: 140,
      avgTicketEur: 105,
      conversionRatePct: 13,
      estimatedUpliftPct: 7,
    },
  },
  {
    id: "BKG-1009",
    startAt: "2026-02-07T12:00:00.000Z",
    durationMinutes: 60,
    status: "CONFIRMED",
    email: "pablo.suarez@animalia.es",
    name: "Pablo Suarez",
    locale: "es",
    createdAt: "2026-01-26T18:01:00.000Z",
    form: {
      company: "Animalia",
      role: "IT",
      clinicSize: "10+ veterinarios",
      goals: "Automatizar triage y captacion",
      notes: "Quiere ver ejemplo de flujo completo.",
    },
    roi: {
      currentLeadsPerMonth: 420,
      avgTicketEur: 115,
      conversionRatePct: 11,
      estimatedUpliftPct: 16,
    },
  },
  {
    id: "BKG-1010",
    startAt: "2026-02-07T09:00:00.000Z",
    durationMinutes: 30,
    status: "RESCHEDULED",
    email: "lucia.fernandez@myvet.es",
    name: "Lucia Fernandez",
    locale: "es",
    createdAt: "2026-01-23T08:50:00.000Z",
    form: {
      company: "MyVet",
      role: "Coordinacion",
      clinicSize: "3-5 veterinarios",
      goals: "Reducir friccion en reservas",
      notes: "Reagenda por vacaciones.",
    },
    roi: {
      currentLeadsPerMonth: 210,
      avgTicketEur: 88,
      conversionRatePct: 15,
      estimatedUpliftPct: 11,
    },
  },
  {
    id: "BKG-1011",
    startAt: "2026-02-08T15:30:00.000Z",
    durationMinutes: 45,
    status: "HELD",
    email: "alex.brown@cityvet.uk",
    name: "Alex Brown",
    locale: "en",
    createdAt: "2026-01-27T13:12:00.000Z",
    form: {
      company: "CityVet",
      role: "Director",
      clinicSize: "6-10 vets",
      goals: "Improve booking throughput",
      notes: "Interested in metrics and alerts.",
    },
    roi: {
      currentLeadsPerMonth: 310,
      avgTicketEur: 130,
      conversionRatePct: 10,
      estimatedUpliftPct: 13,
    },
  },
  {
    id: "BKG-1012",
    startAt: "2026-02-08T10:45:00.000Z",
    durationMinutes: 30,
    status: "CONFIRMED",
    email: "nuria.lopez@saludvet.es",
    name: "Nuria Lopez",
    locale: "es",
    createdAt: "2026-01-29T09:26:00.000Z",
    form: {
      company: "SaludVet",
      role: "Recepcion",
      clinicSize: "2-3 veterinarios",
      goals: "Reducir llamadas y mejorar confirmaciones",
      notes: "Le preocupa el tono de mensajes.",
    },
    roi: {
      currentLeadsPerMonth: 150,
      avgTicketEur: 82,
      conversionRatePct: 19,
      estimatedUpliftPct: 9,
    },
  },
  {
    id: "BKG-1013",
    startAt: "2026-02-09T09:15:00.000Z",
    durationMinutes: 30,
    status: "CANCELLED",
    email: "mark.jensen@lakevet.com",
    name: "Mark Jensen",
    locale: "en",
    createdAt: "2026-01-16T14:03:00.000Z",
    form: {
      company: "LakeVet",
      role: "Owner",
      clinicSize: "1-2 vets",
      goals: "Reduce back-office workload",
      notes: "Cancelled due to staffing.",
    },
    roi: {
      currentLeadsPerMonth: 80,
      avgTicketEur: 100,
      conversionRatePct: 12,
      estimatedUpliftPct: 7,
    },
  },
  {
    id: "BKG-1014",
    startAt: "2026-02-09T17:00:00.000Z",
    durationMinutes: 60,
    status: "CONFIRMED",
    email: "ines.gomez@vetnorte.es",
    name: "Ines Gomez",
    locale: "es",
    createdAt: "2026-01-24T10:10:00.000Z",
    form: {
      company: "Vet Norte",
      role: "Direccion",
      clinicSize: "3-5 veterinarios",
      goals: "Aumentar leads de calidad",
      notes: "Necesita reporting por canal.",
    },
    roi: {
      currentLeadsPerMonth: 190,
      avgTicketEur: 92,
      conversionRatePct: 16,
      estimatedUpliftPct: 12,
    },
  },
  {
    id: "BKG-1015",
    startAt: "2026-02-10T12:30:00.000Z",
    durationMinutes: 30,
    status: "RESCHEDULED",
    email: "paula.vazquez@amigosvet.es",
    name: "Paula Vazquez",
    locale: "es",
    createdAt: "2026-01-17T08:22:00.000Z",
    form: {
      company: "AmigosVet",
      role: "Coordinacion",
      clinicSize: "2-3 veterinarios",
      goals: "Reducir cancelaciones",
      notes: "Reagenda por imprevisto.",
    },
    roi: {
      currentLeadsPerMonth: 130,
      avgTicketEur: 75,
      conversionRatePct: 21,
      estimatedUpliftPct: 10,
    },
  },
  {
    id: "BKG-1016",
    startAt: "2026-02-10T08:00:00.000Z",
    durationMinutes: 45,
    status: "EXPIRED",
    email: "noah.wilson@vetops.io",
    name: "Noah Wilson",
    locale: "en",
    createdAt: "2026-01-12T16:10:00.000Z",
    form: {
      company: "VetOps",
      role: "Ops",
      clinicSize: "10+ vets",
      goals: "Automate confirmations",
      notes: "Did not attend.",
    },
    roi: {
      currentLeadsPerMonth: 500,
      avgTicketEur: 140,
      conversionRatePct: 9,
      estimatedUpliftPct: 8,
    },
  },
  {
    id: "BKG-1017",
    startAt: "2026-02-11T11:20:00.000Z",
    durationMinutes: 30,
    status: "CONFIRMED",
    email: "carmen.prieto@clinicaplana.es",
    name: "Carmen Prieto",
    locale: "es",
    createdAt: "2026-01-31T09:45:00.000Z",
    form: {
      company: "Clinica Plana",
      role: "Gerencia",
      clinicSize: "1-2 veterinarios",
      goals: "Captar mas reservas desde web",
      notes: "Busca una UI clara para el equipo.",
    },
    roi: {
      currentLeadsPerMonth: 90,
      avgTicketEur: 68,
      conversionRatePct: 24,
      estimatedUpliftPct: 9,
    },
  },
  {
    id: "BKG-1018",
    startAt: "2026-02-11T15:10:00.000Z",
    durationMinutes: 30,
    status: "HELD",
    email: "oliver.ng@brightvet.com",
    name: "Oliver Ng",
    locale: "en",
    createdAt: "2026-01-15T12:31:00.000Z",
    form: {
      company: "BrightVet",
      role: "CEO",
      clinicSize: "3-5 vets",
      goals: "Improve efficiency",
      notes: "Wants automation for follow-ups.",
    },
    roi: {
      currentLeadsPerMonth: 220,
      avgTicketEur: 125,
      conversionRatePct: 12,
      estimatedUpliftPct: 10,
    },
  },
  {
    id: "BKG-1019",
    startAt: "2026-02-12T09:40:00.000Z",
    durationMinutes: 60,
    status: "CANCELLED",
    email: "martin.alonso@veturbana.es",
    name: "Martin Alonso",
    locale: "es",
    createdAt: "2026-01-14T10:18:00.000Z",
    form: {
      company: "Vet Urbana",
      role: "Direccion",
      clinicSize: "6-10 veterinarios",
      goals: "Mejorar conversion de leads",
      notes: "Cancelado por conflicto de horarios.",
    },
    roi: {
      currentLeadsPerMonth: 340,
      avgTicketEur: 98,
      conversionRatePct: 13,
      estimatedUpliftPct: 12,
    },
  },
  {
    id: "BKG-1020",
    startAt: "2026-02-12T18:00:00.000Z",
    durationMinutes: 45,
    status: "RESCHEDULED",
    email: "hannah.kim@vetcloud.ai",
    name: "Hannah Kim",
    locale: "en",
    createdAt: "2026-01-13T17:03:00.000Z",
    form: {
      company: "VetCloud",
      role: "Product",
      clinicSize: "6-10 vets",
      goals: "Understand workflow and integration needs",
      notes: "Rescheduled to align with stakeholders.",
    },
    roi: {
      currentLeadsPerMonth: 280,
      avgTicketEur: 150,
      conversionRatePct: 8,
      estimatedUpliftPct: 14,
    },
  },
]

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "ACT-01",
    at: "2026-02-04T08:15:00.000Z",
    title: "Nueva reserva creada",
    description: "BKG-1001 Maria Santos",
    bookingId: "BKG-1001",
    tone: "good",
  },
  {
    id: "ACT-02",
    at: "2026-02-04T08:45:00.000Z",
    title: "Recordatorio enviado",
    description: "Email (mock) a john.meyer@petcare.io",
    bookingId: "BKG-1002",
    tone: "neutral",
  },
  {
    id: "ACT-03",
    at: "2026-02-03T16:05:00.000Z",
    title: "Reserva cancelada",
    description: "BKG-1003 Laura Moreno",
    bookingId: "BKG-1003",
    tone: "bad",
  },
  {
    id: "ACT-04",
    at: "2026-02-03T12:20:00.000Z",
    title: "Reagenda solicitada",
    description: "BKG-1004 Diego Ramos",
    bookingId: "BKG-1004",
    tone: "warn",
  },
  {
    id: "ACT-05",
    at: "2026-02-02T10:30:00.000Z",
    title: "Confirmacion recibida",
    description: "BKG-1006 Andrea Garcia",
    bookingId: "BKG-1006",
    tone: "good",
  },
  {
    id: "ACT-06",
    at: "2026-02-01T13:50:00.000Z",
    title: "No show detectado",
    description: "BKG-1005 Sophie Lee",
    bookingId: "BKG-1005",
    tone: "warn",
  },
]
