export const UI_TEXT = {
  appName: "ClinvetIA",
  adminTitle: "Admin",
  overviewTitle: "Dashboard",
  overviewSubtitle: "Resumen de reservas",
  bookingsTitle: "Bookings",
  bookingsSubtitle: "Listado de reservas",
  settingsTitle: "Settings",
  settingsSubtitle: "Administracion y preferencias (mock)",
  loginTitle: "Acceso admin",
  loginSubtitle: "Solo personal autorizado",

  nav: {
    overview: "Overview",
    bookings: "Bookings",
    calendar: "Calendar",
    metrics: "Metrics",
    settings: "Settings",
  },

  actions: {
    view: "Ver",
    open: "Abrir",
    cancel: "Cancelar",
    reschedule: "Reagendar",
    retry: "Reintentar",
    exportCsv: "Exportar CSV",
    newBooking: "Nueva",
    save: "Guardar",
    copyEmail: "Copiar email",
    logout: "Logout",
    signIn: "Entrar",
    createFirst: "Crear primera reserva",
  },

  filters: {
    searchLabel: "Buscar",
    searchPlaceholder: "Email o nombre...",
    statusLabel: "Estado",
    localeLabel: "Locale",
    dateFrom: "Desde",
    dateTo: "Hasta",
    pageSize: "Tamano pagina",
    dateRange: "Rango de fechas",
  },

  empty: {
    title: "Sin resultados",
    description: "No hay reservas para mostrar con estos filtros.",
  },

  error: {
    title: "No pudimos cargar el dashboard",
    description: "Esto es un estado mock. Reintenta para volver a la vista normal.",
  },

  kpi: {
    total: "Total reservas",
    confirmed: "Confirmadas",
    cancelled: "Canceladas",
    rescheduled: "Reagendadas",
  },

  sections: {
    recentBookings: "Reservas recientes",
    activity: "Actividad",
    calendar: "Calendario",
    booking: "Cita",
    customer: "Cliente",
    form: "Formulario",
    roi: "ROI",
    internalNotes: "Notas internas",
    quickActions: "Acciones",
    comingSoon: "Proximamente",
  },

  dialogs: {
    cancelTitle: "Cancelar reserva",
    cancelDescription: "Esta accion es solo UI (mock).",
    rescheduleTitle: "Reagendar reserva",
    rescheduleDescription: "Esta accion es solo UI (mock).",
  },
} as const
