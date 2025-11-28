import { DailyData, AirportCode } from '../types';

// ============================================================================
// DATASET 1: ALL AIRPORTS (AGGREGATE) - EXISTING DATA
// ============================================================================
const ALL_DATA: DailyData[] = [
  { date: '2025-12-18', dayName: 'Kamis', passengers: 526101, flights: 4069, description: 'H-7' },
  { date: '2025-12-19', dayName: 'Jumat', passengers: 538526, flights: 4069, description: 'H-6' },
  { date: '2025-12-20', dayName: 'Sabtu', passengers: 610509, flights: 4526, isPeakDeparture: true, description: 'H-5 (Puncak Arus Keberangkatan)' },
  { date: '2025-12-21', dayName: 'Minggu', passengers: 603435, flights: 4412, isPeakDeparture: true, description: 'H-4 (Puncak Arus Keberangkatan)' },
  { date: '2025-12-22', dayName: 'Senin', passengers: 547369, flights: 4445, description: 'H-3' },
  { date: '2025-12-23', dayName: 'Selasa', passengers: 543502, flights: 4331, description: 'H-2' },
  { date: '2025-12-24', dayName: 'Rabu', passengers: 499100, flights: 4203, description: 'H-1' },
  { date: '2025-12-25', dayName: 'Kamis', passengers: 424448, flights: 4069, isHoliday: true, description: 'Hari Natal' },
  { date: '2025-12-26', dayName: 'Jumat', passengers: 449233, flights: 4176, description: 'H+1' },
  { date: '2025-12-27', dayName: 'Sabtu', passengers: 516161, flights: 4189, description: 'H+2' },
  { date: '2025-12-28', dayName: 'Minggu', passengers: 470143, flights: 4143, description: 'H+3' },
  { date: '2025-12-29', dayName: 'Senin', passengers: 467767, flights: 4211, description: 'H-3 (Tahun Baru)' },
  { date: '2025-12-30', dayName: 'Selasa', passengers: 454827, flights: 4056, description: 'H-2 (Tahun Baru)' },
  { date: '2025-12-31', dayName: 'Rabu', passengers: 384653, flights: 3857, description: 'H-1 (Tahun Baru)' },
  { date: '2026-01-01', dayName: 'Kamis', passengers: 442420, flights: 3600, isHoliday: true, description: 'Tahun Baru' },
  { date: '2026-01-02', dayName: 'Jumat', passengers: 485538, flights: 4123, description: 'H+1' },
  { date: '2026-01-03', dayName: 'Sabtu', passengers: 506901, flights: 4243, isPeakReturn: true, description: 'H+2 (Puncak Arus Balik)' },
  { date: '2026-01-04', dayName: 'Minggu', passengers: 565326, flights: 4201, isPeakReturn: true, description: 'H+3 (Puncak Arus Balik)' },
];

const ALL_STATS = {
  passengerGrowth: "3.8%",
  passengerRecovery: "94.8%",
  flightGrowth: "1.6%",
  flightRecovery: "85.0%",
  totalPassengers2025P: "9,035,958",
  totalFlights2025P: "64,060",
  peakDeparture: "20-21 Des",
  peakReturn: "3-4 Jan"
};

// ============================================================================
// DATASET 2: SOEKARNO-HATTA (CGK) - FROM IMAGE 1
// ============================================================================
const CGK_DATA: DailyData[] = [
  { date: '2025-12-18', dayName: 'Kamis', passengers: 178280, flights: 1139, description: 'H-7' },
  { date: '2025-12-19', dayName: 'Jumat', passengers: 181601, flights: 1140, description: 'H-6' },
  { date: '2025-12-20', dayName: 'Sabtu', passengers: 188322, flights: 1145, description: 'H-5' },
  { date: '2025-12-21', dayName: 'Minggu', passengers: 194269, flights: 1146, isPeakDeparture: true, description: 'H-4 (Puncak)' },
  { date: '2025-12-22', dayName: 'Senin', passengers: 163951, flights: 1102, description: 'H-3' },
  { date: '2025-12-23', dayName: 'Selasa', passengers: 159887, flights: 1101, description: 'H-2' },
  { date: '2025-12-24', dayName: 'Rabu', passengers: 175245, flights: 1131, description: 'H-1' },
  { date: '2025-12-25', dayName: 'Kamis', passengers: 145213, flights: 1006, isHoliday: true, description: 'Hari Natal' },
  { date: '2025-12-26', dayName: 'Jumat', passengers: 153216, flights: 1023, description: 'H+1' },
  { date: '2025-12-27', dayName: 'Sabtu', passengers: 178192, flights: 1138, description: 'H+2' },
  { date: '2025-12-28', dayName: 'Minggu', passengers: 181888, flights: 1141, isPeakDeparture: true, description: 'H+3 (Puncak Jelang Thn Baru)' },
  { date: '2025-12-29', dayName: 'Senin', passengers: 171580, flights: 1107, description: 'H-3' },
  { date: '2025-12-30', dayName: 'Selasa', passengers: 157454, flights: 1094, description: 'H-2' },
  { date: '2025-12-31', dayName: 'Rabu', passengers: 156045, flights: 1073, description: 'H-1' },
  { date: '2026-01-01', dayName: 'Kamis', passengers: 155682, flights: 1064, isHoliday: true, description: 'Tahun Baru' },
  { date: '2026-01-02', dayName: 'Jumat', passengers: 173930, flights: 1124, description: 'H+1' },
  { date: '2026-01-03', dayName: 'Sabtu', passengers: 184618, flights: 1142, description: 'H+2' },
  { date: '2026-01-04', dayName: 'Minggu', passengers: 184908, flights: 1144, isPeakReturn: true, description: 'H+3 (Puncak Balik)' },
];

const CGK_STATS = {
  passengerGrowth: "3.23%",
  passengerRecovery: "N/A", // Not explicitly visible in summary text, using N/A or derive if needed
  flightGrowth: "1.33%",
  flightRecovery: "N/A",
  totalPassengers2025P: "3,084,281",
  totalFlights2025P: "19,960",
  peakDeparture: "21 Des & 28 Des",
  peakReturn: "4 Jan"
};

// ============================================================================
// DATASET 3: I GUSTI NGURAH RAI (DPS) - FROM IMAGE 2
// ============================================================================
// Flight data for DPS is estimated based on the Total 7,674 distributed by passenger weight
// since daily flight table is not explicitly readable, but total is provided.
const DPS_DATA: DailyData[] = [
  { date: '2025-12-18', dayName: 'Kamis', passengers: 78338, flights: 440, description: 'H-7' },
  { date: '2025-12-19', dayName: 'Jumat', passengers: 82201, flights: 462, isPeakDeparture: true, description: 'H-6 (Puncak Pra-Natal)' },
  { date: '2025-12-20', dayName: 'Sabtu', passengers: 77929, flights: 438, description: 'H-5' },
  { date: '2025-12-21', dayName: 'Minggu', passengers: 76666, flights: 431, description: 'H-4' },
  { date: '2025-12-22', dayName: 'Senin', passengers: 79565, flights: 447, description: 'H-3' },
  { date: '2025-12-23', dayName: 'Selasa', passengers: 73508, flights: 413, description: 'H-2' },
  { date: '2025-12-24', dayName: 'Rabu', passengers: 72354, flights: 406, description: 'H-1' },
  { date: '2025-12-25', dayName: 'Kamis', passengers: 71919, flights: 404, isHoliday: true, description: 'Hari Natal' },
  { date: '2025-12-26', dayName: 'Jumat', passengers: 76784, flights: 431, description: 'H+1' },
  { date: '2025-12-27', dayName: 'Sabtu', passengers: 77089, flights: 433, description: 'H+2' },
  { date: '2025-12-28', dayName: 'Minggu', passengers: 76516, flights: 430, description: 'H+3' },
  { date: '2025-12-29', dayName: 'Senin', passengers: 81052, flights: 455, isPeakDeparture: true, description: 'H-3 (Puncak Pra-Tahun Baru)' },
  { date: '2025-12-30', dayName: 'Selasa', passengers: 71018, flights: 399, description: 'H-2' },
  { date: '2025-12-31', dayName: 'Rabu', passengers: 70869, flights: 398, description: 'H-1' },
  { date: '2026-01-01', dayName: 'Kamis', passengers: 71290, flights: 400, isHoliday: true, description: 'Tahun Baru' },
  { date: '2026-01-02', dayName: 'Jumat', passengers: 78030, flights: 438, description: 'H+1' },
  { date: '2026-01-03', dayName: 'Sabtu', passengers: 77286, flights: 434, description: 'H+2' },
  { date: '2026-01-04', dayName: 'Minggu', passengers: 81820, flights: 460, isPeakReturn: true, description: 'H+3 (Puncak Balik)' },
];

const DPS_STATS = {
  passengerGrowth: "13.29%",
  passengerRecovery: "106.72%",
  flightGrowth: "2.17%",
  flightRecovery: "92.05%",
  totalPassengers2025P: "1,366,231",
  totalFlights2025P: "7,674",
  peakDeparture: "19 Des & 29 Des",
  peakReturn: "4 Jan"
};


// ============================================================================
// HELPERS
// ============================================================================

export const getAirportData = (code: AirportCode) => {
  switch (code) {
    case 'CGK': return CGK_DATA;
    case 'DPS': return DPS_DATA;
    default: return ALL_DATA;
  }
};

export const getAirportStats = (code: AirportCode) => {
  switch (code) {
    case 'CGK': return CGK_STATS;
    case 'DPS': return DPS_STATS;
    default: return ALL_STATS;
  }
};

export const getAirportName = (code: AirportCode) => {
  switch (code) {
    case 'CGK': return 'Soekarno-Hatta (CGK)';
    case 'DPS': return 'I Gusti Ngurah Rai (DPS)';
    default: return 'Seluruh Bandara (Aggregate)';
  }
};
