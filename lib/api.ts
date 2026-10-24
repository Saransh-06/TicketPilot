/**
 * Tatkal Assistant - Typed API Service & Demo Adapter Layer
 * Member 1: Frontend & UI Architecture
 * 
 * Supports both:
 * 1. FastAPI backend integration (TicketPilot API endpoints)
 * 2. Transparent, explicit Demo adapter with persistent client-side state
 * 
 * CRITICAL RULE: Never silently fallback to mock data on real API network error!
 */

import {
  Trip,
  TripCreateInput,
  TripUpdateInput,
  SchedulerOpeningInfo,
  TrainComparisonResult,
  BookingOutcomeRecord,
  UserSettings,
  ApiResponse,
  TravelClass,
} from './types';
import {
  INITIAL_DEMO_TRIPS,
  getDemoSchedulerStatus,
  DEMO_COMPARISONS,
  INITIAL_DEMO_HISTORY,
  DEFAULT_USER_SETTINGS,
} from './demo/demoData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

// Client-side demo storage keys
const DEMO_STORAGE_TRIPS = 'tatkal_assistant_demo_trips';
const DEMO_STORAGE_HISTORY = 'tatkal_assistant_demo_history';
const DEMO_STORAGE_SETTINGS = 'tatkal_assistant_demo_settings';

class ApiClient {
  private isDemo: boolean;
  private baseUrl: string;

  constructor() {
    this.isDemo = IS_DEMO_MODE || !API_BASE_URL;
    this.baseUrl = API_BASE_URL;
  }

  public isDemoActive(): boolean {
    return this.isDemo;
  }

  public setDemoMode(active: boolean) {
    this.isDemo = active;
  }

  // --- Storage Helpers for Demo State ---
  private getStoredDemoTrips(): Trip[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_TRIPS;
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_TRIPS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read demo trips from localStorage', e);
    }
    return INITIAL_DEMO_TRIPS;
  }

  private saveStoredDemoTrips(trips: Trip[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DEMO_STORAGE_TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Could not save demo trips to localStorage', e);
    }
  }

  private getStoredDemoHistory(): BookingOutcomeRecord[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_HISTORY;
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read demo history from localStorage', e);
    }
    return INITIAL_DEMO_HISTORY;
  }

  private saveStoredDemoHistory(history: BookingOutcomeRecord[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DEMO_STORAGE_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save demo history to localStorage', e);
    }
  }

  public resetDemoData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEMO_STORAGE_TRIPS);
    localStorage.removeItem(DEMO_STORAGE_HISTORY);
    localStorage.removeItem(DEMO_STORAGE_SETTINGS);
  }

  // --- Real HTTP Request Wrapper ---
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options?.headers || {}),
        },
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${res.status}`,
            message: body?.message || `Request failed with status ${res.status}: ${res.statusText}`,
            fieldErrors: body?.fieldErrors,
          },
          isDemoData: false,
        };
      }

      return {
        success: true,
        data: body?.data !== undefined ? body.data : body,
        isDemoData: false,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Network error reaching ${url}: ${errorMsg}`,
        },
        isDemoData: false,
      };
    }
  }

  // ==========================================
  // Trips Endpoints
  // ==========================================

  public async getTrips(): Promise<ApiResponse<Trip[]>> {
    if (this.isDemo) {
      return {
        success: true,
        data: this.getStoredDemoTrips(),
        isDemoData: true,
      };
    }
    return this.request<Trip[]>('/trips');
  }

  public async getTripById(id: string): Promise<ApiResponse<Trip>> {
    if (this.isDemo) {
      const trips = this.getStoredDemoTrips();
      const trip = trips.find(t => t.id === id);
      if (!trip) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: `Trip with ID '${id}' not found in demo records.` },
          isDemoData: true,
        };
      }
      return { success: true, data: trip, isDemoData: true };
    }
    return this.request<Trip>(`/trips/${id}`);
  }

  public async createTrip(input: TripCreateInput): Promise<ApiResponse<Trip>> {
    // Frontend validation
    if (input.sourceStation.trim().toLowerCase() === input.destStation.trim().toLowerCase()) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Origin and destination stations must be different.',
          fieldErrors: { destStation: 'Destination must differ from origin' },
        },
        isDemoData: this.isDemo,
      };
    }

    if (input.passengerCount < 1 || input.passengerCount > 4) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tatkal booking allows a maximum of 4 passengers per PNR.',
          fieldErrors: { passengerCount: 'Must be between 1 and 4 passengers' },
        },
        isDemoData: this.isDemo,
      };
    }

    if (this.isDemo) {
      const isAC = ['1A', '2A', '3A', '3E', 'CC', 'EC'].includes(input.travelClass);
      const newTrip: Trip = {
        ...input,
        id: `trip-demo-${Date.now()}`,
        isAC,
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const trips = [newTrip, ...this.getStoredDemoTrips()];
      this.saveStoredDemoTrips(trips);
      return { success: true, data: newTrip, isDemoData: true };
    }

    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async updateTrip(id: string, updates: TripUpdateInput): Promise<ApiResponse<Trip>> {
    if (this.isDemo) {
      const trips = this.getStoredDemoTrips();
      const idx = trips.findIndex(t => t.id === id);
      if (idx === -1) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: `Trip '${id}' not found.` },
          isDemoData: true,
        };
      }
      const existing = trips[idx];
      const isAC = updates.travelClass
        ? ['1A', '2A', '3A', '3E', 'CC', 'EC'].includes(updates.travelClass)
        : existing.isAC;

      const updated: Trip = {
        ...existing,
        ...updates,
        isAC,
        updatedAt: new Date().toISOString(),
      };
      trips[idx] = updated;
      this.saveStoredDemoTrips(trips);
      return { success: true, data: updated, isDemoData: true };
    }

    return this.request<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteTrip(id: string): Promise<ApiResponse<{ deletedId: string }>> {
    if (this.isDemo) {
      const trips = this.getStoredDemoTrips();
      const filtered = trips.filter(t => t.id !== id);
      this.saveStoredDemoTrips(filtered);
      return { success: true, data: { deletedId: id }, isDemoData: true };
    }

    return this.request<{ deletedId: string }>(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // Scheduler / Countdown Endpoints
  // ==========================================

  public async getSchedulerStatus(tripId: string): Promise<ApiResponse<SchedulerOpeningInfo>> {
    if (this.isDemo) {
      const trips = this.getStoredDemoTrips();
      const trip = trips.find(t => t.id === tripId) || trips[0];
      const status = trip
        ? getDemoSchedulerStatus(trip.isAC, trip.journeyDate)
        : getDemoSchedulerStatus(true, new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
      return { success: true, data: status, isDemoData: true };
    }

    return this.request<SchedulerOpeningInfo>(`/scheduler/trip/${tripId}`);
  }

  // ==========================================
  // Train Comparison & Recommendations
  // ==========================================

  public async getTrainComparisons(
  sourceStation: string,
  destStation: string,
  travelClass?: TravelClass
): Promise<ApiResponse<TrainComparisonResult[]>> {
  if (this.isDemo) {
    let list = DEMO_COMPARISONS['NDLS_BCT'] || [];
    if (travelClass) {
      list = list.filter(t => t.travelClass === travelClass);
    }
    return { success: true, data: list, isDemoData: true };
  }

  const travelDate = new Date();
  travelDate.setDate(travelDate.getDate() + 1);
  const formattedDate = [
    travelDate.getFullYear(),
    String(travelDate.getMonth() + 1).padStart(2, '0'),
    String(travelDate.getDate()).padStart(2, '0'),
  ].join('-');

  const response = await this.request<any>('/trains/compare', {
    method: 'POST',
    body: JSON.stringify({
      source_station: sourceStation,
      destination_station: destStation,
      travel_date: formattedDate,
      travel_class: travelClass,
      quota: 'TATKAL',
    }),
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      isDemoData: false,
    };
  }

  const payload = response.data as any;
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];

  const mapped: TrainComparisonResult[] = candidates.map((candidate: any) => {
    const durationMinutes = candidate.metadata?.duration_minutes;
    const fare = typeof candidate.fare === 'number' ? candidate.fare : 0;

    return {
      trainNumber: String(candidate.train_number ?? ''),
      trainName: candidate.train_name ?? 'Train name unavailable',
      originStation: sourceStation,
      destinationStation: destStation,
      departureTime: candidate.departure_time ?? 'Unavailable',
      arrivalTime: candidate.arrival_time ?? 'Unavailable',
      duration: typeof durationMinutes === 'number'
        ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
        : 'Unavailable',
      durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : 0,
      travelClass: (travelClass ?? candidate.available_classes?.[0] ?? '3A') as TravelClass,
      baseFare: fare,
      tatkalCharge: 0,
      totalFare: fare,
      availabilityStatus: candidate.availability_status ?? 'Availability unverified',
      dataProvenance: 'estimated',
      freshnessTimestamp: 'Source timestamp unavailable',
      recommendation: candidate.metadata?.is_selected
        ? {
            badge: 'TOP_RECOMMENDATION',
            reason: 'Selected by the train comparison ranking engine',
            engineProvenance: 'TicketPilot Comparison Engine',
          }
        : undefined,
    };
  });

  return {
    success: true,
    data: mapped,
    isDemoData: false,
  };
}

  // ==========================================
  // Booking Outcomes & History
  // ==========================================

  public async getBookingHistory(): Promise<ApiResponse<BookingOutcomeRecord[]>> {
    if (this.isDemo) {
      return { success: true, data: this.getStoredDemoHistory(), isDemoData: true };
    }
    return this.request<BookingOutcomeRecord[]>('/booking/history');
  }

  public async recordBookingOutcome(
    input: Omit<BookingOutcomeRecord, 'id' | 'isIndependentlyVerified' | 'recordedAt'>
  ): Promise<ApiResponse<BookingOutcomeRecord>> {
    if (this.isDemo) {
      const newRecord: BookingOutcomeRecord = {
        ...input,
        id: `booking-${Date.now()}`,
        isManuallyRecorded: true,
        isIndependentlyVerified: false,
        recordedAt: new Date().toISOString(),
      };
      const history = [newRecord, ...this.getStoredDemoHistory()];
      this.saveStoredDemoHistory(history);
      return { success: true, data: newRecord, isDemoData: true };
    }

    return this.request<BookingOutcomeRecord>('/booking/record', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==========================================
  // User Settings
  // ==========================================

  public async getSettings(): Promise<ApiResponse<UserSettings>> {
    if (this.isDemo) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(DEMO_STORAGE_SETTINGS);
        if (stored) {
          try {
            return { success: true, data: JSON.parse(stored), isDemoData: true };
          } catch {}
        }
      }
      return { success: true, data: DEFAULT_USER_SETTINGS, isDemoData: true };
    }
    return this.request<UserSettings>('/settings');
  }

  public async updateSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    if (this.isDemo) {
      const current = (await this.getSettings()).data || DEFAULT_USER_SETTINGS;
      const merged = { ...current, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_STORAGE_SETTINGS, JSON.stringify(merged));
      }
      return { success: true, data: merged, isDemoData: true };
    }

    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiClient();
