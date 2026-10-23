/**
 * Tatkal Assistant - Shared Type Definitions
 * Member 1: Frontend & UI Architecture
 * 
 * Strict typed contracts aligning with:
 * - Member 2 (Express Backend & SQLite Persistence)
 * - Member 3 (Scheduler & Opening Time Calculations)
 * - Member 4 (Comparison Engine & Train Availability)
 */

export type TravelClass = 
  | '1A'  // First AC
  | '2A'  // 2 Tier AC
  | '3A'  // 3 Tier AC
  | '3E'  // 3 AC Economy
  | 'CC'  // AC Chair Car
  | 'EC'  // Executive Chair Car
  | 'SL'  // Sleeper (Non-AC)
  | '2S'; // Second Sitting (Non-AC)

export type PreferenceChoice = 'balanced' | 'fastest' | 'cheapest';

export interface Trip {
  id: string;
  sourceStation: string;
  destStation: string;
  journeyDate: string; // YYYY-MM-DD
  travelClass: TravelClass;
  isAC: boolean;
  passengerCount: number; // 1 to 4 max under Tatkal rules
  preferredTrainNumber?: string;
  preferredTrainName?: string;
  fareVsDurationPreference: PreferenceChoice;
  preferredDepartureTime?: string;
  status: 'planned' | 'ready' | 'booked' | 'missed';
  createdAt: string;
  updatedAt: string;
}

export type TripCreateInput = Omit<Trip, 'id' | 'isAC' | 'createdAt' | 'updatedAt' | 'status'>;
export type TripUpdateInput = Partial<TripCreateInput> & { status?: Trip['status'] };

export type SchedulerWindowStatus = 'UPCOMING' | 'OPENING_SOON' | 'WINDOW_OPEN' | 'WINDOW_CLOSED';

export interface SchedulerOpeningInfo {
  openingTimestampIST: string; // ISO 8601 string representing IST instant
  targetClassType: 'AC' | 'NON_AC';
  openingTimeFormatted: string; // e.g., "10:00 AM IST" or "11:00 AM IST"
  status: SchedulerWindowStatus;
  isAuthoritative: boolean; // false indicates configured default fallback, true means Member 3 calculation
  sourceExplanation: string;
  remindersConfigured: boolean;
  trainOriginDepartureDate?: string;
  originDateNotice?: string;
}

export type DataFreshness = 'verified' | 'estimated' | 'stale' | 'unavailable';

export interface TrainComparisonResult {
  trainNumber: string;
  trainName: string;
  originStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  travelClass: TravelClass;
  baseFare: number;
  tatkalCharge: number;
  totalFare: number;
  availabilityStatus: string;
  dataProvenance: DataFreshness;
  freshnessTimestamp: string;
  recommendation?: {
    badge: 'TOP_RECOMMENDATION' | 'FASTEST' | 'VALUE_PICK' | 'BACKUP_OPTION';
    reason: string;
    engineProvenance: string; // e.g. "Member 4 Comparison Engine v1.0"
  };
}

export type BookingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'CONFIRMED' | 'FAILED' | 'UNKNOWN';

export interface BookingOutcomeRecord {
  id: string;
  tripId: string;
  trainNumber: string;
  trainName?: string;
  journeyDate: string;
  travelClass: TravelClass;
  status: BookingStatus;
  isManuallyRecorded: boolean;
  isIndependentlyVerified: boolean;
  pnr?: string;
  recordedAt: string;
  bookingTimestamp?: string;
  proofReference?: string;
  notes?: string;
}

export interface UserSettings {
  preferredClasses: TravelClass[];
  defaultPreference: PreferenceChoice;
  enableCountdownSeconds: boolean;
  schedulerNotificationsEnabled: boolean;
  reducedMotion: boolean;
  highContrastGlass: boolean;
  dataRetentionAcknowledged: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
  isDemoData?: boolean;
}
