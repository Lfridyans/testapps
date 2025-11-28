
export enum TrafficType {
  PASSENGER = 'PASSENGER',
  FLIGHT = 'FLIGHT',
}

export type AirportCode = 'ALL' | 'CGK' | 'DPS';

export type Page = 'PREDICTOR' | 'EXECUTIVE';

export interface DailyData {
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, etc.
  passengers: number;
  flights: number;
  isPeakDeparture?: boolean;
  isPeakReturn?: boolean;
  isHoliday?: boolean; // Natal or Tahun Baru
  description?: string;
}

export interface PredictionRequest {
  date: string;
  type: TrafficType;
  airportCode: AirportCode;
}

export interface PredictionResult {
  predictedValue: number;
  confidence: string;
  reasoning: string;
  comprehensiveAnalysis: string; // New field for macro analysis
  context: DailyData | null;
  airportCode: AirportCode;
}

// --- Executive Report Types ---

export interface MetricGrowth {
  value: string;
  growth: string; // e.g. "+5%" or "-4%"
  trend: 'up' | 'down';
  recovery?: string;
}

export interface TrafficHighlight {
  period: string;
  date: string;
  hDate: string; // e.g. "H-3"
  flight: MetricGrowth;
  pax: MetricGrowth;
  cargo: MetricGrowth;
  cgk: { flight: string; pax: string; cargo: string };
  dps: { flight: string; pax: string; cargo: string };
}

export interface AccumulationData {
  flight: { total: string; growth: string; recovery: string };
  pax: { total: string; growth: string; recovery: string };
  cargo: { total: string; growth: string; recovery: string };
}

export interface TopListItem {
  name: string;
  value: string;
}

export interface OperationalData {
  otp: { dom: string; int: string; all: string };
  loadFactor: { dom: string; int: string; all: string };
  slotUtilization: { dom: string; int: string; all: string };
  routes: { dom: string; int: string; all: string };
}

export interface IrregularityDetail {
  daily: string;
  branch: string;
  flightNo: string;
  kronologis: string;
  dampak: string;
  category: string;
  type: string;
}

export interface ExecutiveData {
  lastUpdated: string;
  highlightBefore: TrafficHighlight;
  highlightAfter: TrafficHighlight;
  accumulation: AccumulationData;
  topAirports: TopListItem[];
  topDestInt: TopListItem[];
  topDestDom: TopListItem[];
  operational: OperationalData;
  extraFlight: { plan: string; realization: string; percentage: string };
  opsCondition: { yesterdayRealization: { flight: string; pax: string }; todayPlan: { flight: string; pax: string } };
  irregularities: { 
    total: number; 
    topCause: string;
    details: IrregularityDetail[];
  };
}
