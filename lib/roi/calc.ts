import "server-only"

export type ClinicType = "small" | "medium" | "large" | "specialized"

export interface RoiInputs {
  clinicType: ClinicType
  monthlyPatients: number
  avgTicket: number
  missedRate: number
}

export interface RoiResult {
  missedPatients: number
  recoveredPatients: number
  monthlyRevenue: number
  yearlyRevenue: number
  systemCost: number
  roi: number
  breakEvenDays: number
}

// -----------------------------
// Generic ROI calculator (leads/conversion)
// -----------------------------

export interface GenericRoiInputs {
  leadsMonthly: number
  conversionCurrentPct: number
  avgTicketEur: number
  improvementsPct?: {
    capture: number
    aiAttention: number
    followUp: number
    retention: number
  }
  setupCostEur?: number | null
  monthlyCostEur?: number | null
}

export interface GenericRoiResult {
  leadsNonConverted: number
  upliftOnNonConvertedPct: number
  extraSalesExact: number
  extraSalesRounded: number
  currentSalesRounded: number
  newSalesRounded: number
  newConversionPct: number

  currentSalesExact: number
  currentRevenueMonthly: number

  newSalesExact: number
  newRevenueMonthly: number

  extraRevenueMonthly: number
  extraRevenueYearly: number

  setupCostEur: number | null
  monthlyCostEur: number | null
  roi3m: number | null
  roi6m: number | null
  roi12m: number | null
}

export interface GenericRoiCalculation {
  inputs: Required<Pick<GenericRoiInputs, "leadsMonthly" | "conversionCurrentPct" | "avgTicketEur">> & {
    improvementsPct: Required<NonNullable<GenericRoiInputs["improvementsPct"]>>
    setupCostEur: number | null
    monthlyCostEur: number | null
  }
  result: GenericRoiResult
  note: string
}

function clampNum(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n)
}

function computeRoiPercent(extraMonthly: number, setup: number, monthly: number, months: number): number {
  const gain = extraMonthly * months
  const cost = setup + monthly * months
  const net = gain - cost
  if (cost <= 0) return 0
  return Math.round((net / cost) * 100)
}

export function calcGenericRoi(raw: Partial<GenericRoiInputs>): GenericRoiCalculation | null {
  const leadsMonthly = clampNum(Number(raw.leadsMonthly ?? NaN), 0, 1_000_000)
  const conversionCurrentPct = clampNum(Number(raw.conversionCurrentPct ?? NaN), 0, 100)
  const avgTicketEur = clampNum(Number(raw.avgTicketEur ?? NaN), 0, 1_000_000)

  if (leadsMonthly <= 0 || avgTicketEur <= 0) return null
  if (conversionCurrentPct <= 0 || conversionCurrentPct > 100) return null

  const improvementsPct = raw.improvementsPct ?? {
    capture: 4,
    aiAttention: 8,
    followUp: 7,
    retention: 5,
  }

  const upliftOnNonConvertedPct =
    clampNum(improvementsPct.capture, 0, 100) +
    clampNum(improvementsPct.aiAttention, 0, 100) +
    clampNum(improvementsPct.followUp, 0, 100) +
    clampNum(improvementsPct.retention, 0, 100)

  const currentSalesExact = (leadsMonthly * conversionCurrentPct) / 100
  const currentSalesRounded = Math.round(currentSalesExact)
  const leadsNonConverted = Math.max(0, leadsMonthly - currentSalesExact)
  const extraSalesExact = (leadsNonConverted * upliftOnNonConvertedPct) / 100
  // Conservative rounding: never overstate extra sales.
  const extraSalesRounded = Math.max(0, Math.floor(extraSalesExact))
  const newSalesExact = currentSalesExact + extraSalesExact
  const newSalesRounded = currentSalesRounded + extraSalesRounded
  const newConversionPct = (newSalesExact / leadsMonthly) * 100

  const currentRevenueMonthly = roundMoney(currentSalesExact * avgTicketEur)
  const newRevenueMonthly = roundMoney(newSalesExact * avgTicketEur)
  const extraRevenueMonthly = Math.max(0, newRevenueMonthly - currentRevenueMonthly)
  const extraRevenueYearly = extraRevenueMonthly * 12

  const setupCostEur = typeof raw.setupCostEur === "number" && Number.isFinite(raw.setupCostEur) ? Math.max(0, raw.setupCostEur) : null
  const monthlyCostEur = typeof raw.monthlyCostEur === "number" && Number.isFinite(raw.monthlyCostEur) ? Math.max(0, raw.monthlyCostEur) : null

  const roi3m = setupCostEur !== null && monthlyCostEur !== null ? computeRoiPercent(extraRevenueMonthly, setupCostEur, monthlyCostEur, 3) : null
  const roi6m = setupCostEur !== null && monthlyCostEur !== null ? computeRoiPercent(extraRevenueMonthly, setupCostEur, monthlyCostEur, 6) : null
  const roi12m = setupCostEur !== null && monthlyCostEur !== null ? computeRoiPercent(extraRevenueMonthly, setupCostEur, monthlyCostEur, 12) : null

  return {
    inputs: {
      leadsMonthly: Math.round(leadsMonthly),
      conversionCurrentPct: Math.round(conversionCurrentPct * 10) / 10,
      avgTicketEur: Math.round(avgTicketEur),
      improvementsPct: {
        capture: clampNum(improvementsPct.capture, 0, 100),
        aiAttention: clampNum(improvementsPct.aiAttention, 0, 100),
        followUp: clampNum(improvementsPct.followUp, 0, 100),
        retention: clampNum(improvementsPct.retention, 0, 100),
      },
      setupCostEur,
      monthlyCostEur,
    },
    result: {
      leadsNonConverted: Math.round(leadsNonConverted),
      upliftOnNonConvertedPct: Math.round(upliftOnNonConvertedPct),
      extraSalesExact,
      extraSalesRounded,
      currentSalesRounded,
      newSalesRounded,
      newConversionPct: Math.round(newConversionPct * 10) / 10,

      currentSalesExact,
      currentRevenueMonthly,

      newSalesExact,
      newRevenueMonthly,

      extraRevenueMonthly,
      extraRevenueYearly,

      setupCostEur,
      monthlyCostEur,
      roi3m,
      roi6m,
      roi12m,
    },
    note:
      "Estimacion orientativa (escenario) basada en leads, conversion y ticket. Los redondeos son conservadores. No es una promesa ni una garantia.",
  }
}

export interface RoiCalculation {
  inputs: RoiInputs
  result: RoiResult
  note: string
}

interface ClinicConfig {
  recoveryRate: number
  systemCost: number
  defaultPatients: number
  defaultTicket: number
  defaultMissedRate: number
}

export function getClinicConfig(type: ClinicType): ClinicConfig {
  switch (type) {
    case "small":
      return {
        recoveryRate: 0.65,
        systemCost: 179,
        defaultPatients: 120,
        defaultTicket: 55,
        defaultMissedRate: 35,
      }
    case "medium":
      return {
        recoveryRate: 0.7,
        systemCost: 199,
        defaultPatients: 250,
        defaultTicket: 65,
        defaultMissedRate: 30,
      }
    case "large":
      return {
        recoveryRate: 0.75,
        systemCost: 249,
        defaultPatients: 450,
        defaultTicket: 75,
        defaultMissedRate: 25,
      }
    case "specialized":
      return {
        recoveryRate: 0.6,
        systemCost: 229,
        defaultPatients: 180,
        defaultTicket: 95,
        defaultMissedRate: 30,
      }
  }
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function calcRoi(raw: Partial<RoiInputs>): RoiCalculation | null {
  if (!raw.clinicType) return null

  const cfg = getClinicConfig(raw.clinicType)
  const monthlyPatients = clampInt(raw.monthlyPatients ?? cfg.defaultPatients, 0, 20000)
  const avgTicket = clampInt(raw.avgTicket ?? cfg.defaultTicket, 0, 10000)
  const missedRate = clampInt(raw.missedRate ?? cfg.defaultMissedRate, 0, 100)

  if (monthlyPatients <= 0 || avgTicket <= 0 || missedRate <= 0) return null

  const missedPatients = Math.round((monthlyPatients * missedRate) / 100)
  const recoveredPatients = Math.round(missedPatients * cfg.recoveryRate)
  const monthlyRevenue = recoveredPatients * avgTicket
  const yearlyRevenue = monthlyRevenue * 12
  const systemCost = cfg.systemCost
  const roi = systemCost > 0 ? Math.round(((monthlyRevenue - systemCost) / systemCost) * 100) : 0
  const breakEvenDays = systemCost > 0 && monthlyRevenue > 0 ? Math.round(systemCost / (monthlyRevenue / 30)) : 0

  return {
    inputs: {
      clinicType: raw.clinicType,
      monthlyPatients,
      avgTicket,
      missedRate,
    },
    result: {
      missedPatients,
      recoveredPatients,
      monthlyRevenue,
      yearlyRevenue,
      systemCost,
      roi,
      breakEvenDays,
    },
    note:
      "Estimacion orientativa basada en los datos introducidos y un escenario de recuperacion. No es una garantia de resultado.",
  }
}
