import api from "@/api";
import { AdsResponse } from "@/pages/Ads/columns";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types
export type ZoneType = "media" | "widget";

export interface Zone {
  zone_id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  is_muted: boolean;
  content_type_allowed: ZoneType;
  z_index: number;
}

export interface Layout {
  layout_id: string;
  client_id: string;
  name: string;
  resolution: string;
  orientation: "portrait" | "landscape";
  zones: Zone[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ad {
  ad_id: string;
  name: string;
  client_name: string;
  status: "completed" | "pending" | "processing";
  url: string;
  duration: number;
  updated_at: string;
}

export interface Carousel {
  carousel_id: string;
  name: string;
  client_name: string;
  slides: number;
  duration: number;
  status: "completed" | "pending";
}

export interface LiveContent {
  live_id: string;
  name: string;
  stream_url: string;
  status: "active" | "inactive";
  type: "youtube" | "rtsp" | "hls";
}

export interface Widget {
  widget_id: string;
  name: string;
  type:
    | "clock"
    | "weather"
    | "news_ticker"
    | "date"
    | "logo"
    | "qr_code"
    | "social_feed"
    | "countdown";
  description: string;
  icon: string;
  configurable: boolean;
}

export interface ContentItem {
  id: string;
  content_id: string;
  content_type: "ad" | "carousel" | "live" | "widget";
  name: string;
  client_name?: string;
  duration: number;
  display_order: number;
  start_time?: string;
  end_time?: string;
  // ✅ NEW
  // start_time_date?: string; // ISO date (global range)
  // end_time_date?: string;

  // ✅ NEW
  widget_config?: Record<string, any>;

  time_slots?: { start: string; end: string }[];
}

export interface ZoneContent {
  zone_id: string;
  content_type_allowed: ZoneType;
  // For media zones
  content_items?: ContentItem[];
  // For widget zones
  selected_widgets?: string[]; // widget_ids

  widget_schedule_start?: string;
  widget_schedule_end?: string;
}

export interface ScheduleConfig {
  schedule_id: string;
  content_id: string;
  name: string;
  // Global time settings
  schedule_date_type: "today" | "specific_date" | "one_week" | "one_month";
  start_time: string;
  end_time: string;
  time_slots: { start: string; end: string }[];
  // Zone configurations
  zone_contents: ZoneContent[];
  zone_mute_settings: { [zoneId: string]: boolean };
  // Group assignment
  selected_groups: string[];
  // Status
  status: "draft" | "scheduled" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface DeviceGroup {
  group_id: string;
  name: string;
  device_count: number;
  capacity: number;
  orientation: "portrait" | "landscape";
}

export interface PlaylistItem {
  id: string;
  content_id: string;
  content_type: "ad" | "carousel" | "live";
  name: string;
  duration: number;
  display_order: number;
  start_time?: string; // HH:mm format
  end_time?: string; // HH:mm format
}

export interface Playlist {
  playlist_id: string;
  client_id: string;
  name: string;
  items: PlaylistItem[];
  total_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneAssignment {
  assignment_id: string;
  layout_id: string;
  zone_id: string;
  playlist_id: string;
  created_at: string;
  updated_at: string;
}

export interface LayoutSchedule {
  id: string;
  layout_id: string;
  timeSlots: { start: string; end: string }[];
  created_at: string;
  updated_at: string;
}

// Default Widgets
export const defaultWidgets: Widget[] = [
  {
    widget_id: "widget-clock",
    name: "Digital Clock",
    type: "clock",
    description: "Display current time in digital format",
    icon: "Clock",
    configurable: true,
  },
  {
    widget_id: "widget-weather",
    name: "Weather",
    type: "weather",
    description: "Show current weather conditions",
    icon: "Cloud",
    configurable: true,
  },
  {
    widget_id: "widget-news",
    name: "News Ticker",
    type: "news_ticker",
    description: "Scrolling news headlines",
    icon: "Newspaper",
    configurable: true,
  },
  {
    widget_id: "widget-date",
    name: "Date Display",
    type: "date",
    description: "Show current date",
    icon: "Calendar",
    configurable: true,
  },
  {
    widget_id: "widget-logo",
    name: "Company Logo",
    type: "logo",
    description: "Display company branding",
    icon: "Image",
    configurable: true,
  },
  {
    widget_id: "widget-qr",
    name: "QR Code",
    type: "qr_code",
    description: "Display scannable QR code",
    icon: "QrCode",
    configurable: true,
  },
  {
    widget_id: "widget-social",
    name: "Social Feed",
    type: "social_feed",
    description: "Show social media updates",
    icon: "Share2",
    configurable: true,
  },
  {
    widget_id: "widget-countdown",
    name: "Countdown Timer",
    type: "countdown",
    description: "Countdown to specific event",
    icon: "Timer",
    configurable: true,
  },
];

// Sample Data
export const sampleAds: Ad[] = [
  {
    ad_id: "ad-001",
    name: "ad96-promofull",
    client_name: "Aparna",
    status: "completed",
    url: "dd243a8e-7de4-4a90-8c99-514fdeee7825-best-1080x1920.mp4",
    duration: 82,
    updated_at: "10/19/2025, 12:27:59 PM",
  },
  {
    ad_id: "ad-002",
    name: "gggg",
    client_name: "LOTUS",
    status: "completed",
    url: "3469691f-a333-4971-a2a9-c7cfc3c33f17-best-1080x1920.mp4",
    duration: 80,
    updated_at: "7/2/2025, 7:53:06 PM",
  },
  {
    ad_id: "ad-003",
    name: "DDApplicationKit",
    client_name: "ADUP",
    status: "completed",
    url: "82173ad4-b112-4cb2-acac-8faaaa029955-best-2160x3840.mp4",
    duration: 21,
    updated_at: "6/15/2025, 10:27:10 AM",
  },
  {
    ad_id: "ad-004",
    name: "prime vertical",
    client_name: "ADUP",
    status: "completed",
    url: "dbc05563-0489-4ed8-b2e2-b55651df3e2a-best-2160x2880.mp4",
    duration: 30,
    updated_at: "6/14/2025, 11:57:03 PM",
  },
  {
    ad_id: "ad-005",
    name: "Test2",
    client_name: "Demo",
    status: "completed",
    url: "2ad247e9-af60-4285-baa8-dd73ef1508b0-best-1600x1000.jpeg",
    duration: 29,
    updated_at: "6/19/2025, 4:08:15 AM",
  },
  {
    ad_id: "ad-006",
    name: "detailing",
    client_name: "ADUP",
    status: "completed",
    url: "0e10b356-8977-4451-838a-126ac762f7f3-best-480x848.mp4",
    duration: 28,
    updated_at: "7/10/2025, 7:00:32 PM",
  },
];

export const sampleCarousels: Carousel[] = [
  {
    carousel_id: "car-001",
    name: "Summer Sale Banner",
    client_name: "RetailMax",
    slides: 5,
    duration: 45,
    status: "completed",
  },
  {
    carousel_id: "car-002",
    name: "Product Showcase",
    client_name: "TechStore",
    slides: 8,
    duration: 60,
    status: "completed",
  },
  {
    carousel_id: "car-003",
    name: "Restaurant Menu",
    client_name: "FoodHub",
    slides: 10,
    duration: 90,
    status: "completed",
  },
];

export const sampleLiveContent: LiveContent[] = [
  {
    live_id: "live-001",
    name: "News Channel Stream",
    stream_url: "https://stream.example.com/news",
    status: "active",
    type: "hls",
  },
  {
    live_id: "live-002",
    name: "Sports Live",
    stream_url: "https://youtube.com/watch?v=sports123",
    status: "active",
    type: "youtube",
  },
  {
    live_id: "live-003",
    name: "Corporate Channel",
    stream_url: "rtsp://192.168.1.100/stream",
    status: "inactive",
    type: "rtsp",
  },
];

export const sampleGroups: DeviceGroup[] = [
  {
    group_id: "grp-001",
    name: "TRISHUL-B2",
    device_count: 1,
    capacity: 85,
    orientation: "landscape",
  },
  {
    group_id: "grp-002",
    name: "Ramaswamy horizontal",
    device_count: 2,
    capacity: 72,
    orientation: "landscape",
  },
  {
    group_id: "grp-003",
    name: "Vivera WGL",
    device_count: 2,
    capacity: 65,
    orientation: "landscape",
  },
  {
    group_id: "grp-004",
    name: "Reception",
    device_count: 1,
    capacity: 90,
    orientation: "portrait",
  },
  {
    group_id: "grp-005",
    name: "Mall Kiosk",
    device_count: 3,
    capacity: 55,
    orientation: "portrait",
  },
  {
    group_id: "grp-006",
    name: "LEPL",
    device_count: 0,
    capacity: 0,
    orientation: "landscape",
  },
];

// Storage functions
const LAYOUTS_KEY = "digital_signage_layouts";
const SCHEDULES_KEY = "digital_signage_schedules";
const PLAYLISTS_KEY = "digital_signage_playlists";
const ZONE_ASSIGNMENTS_KEY = "digital_signage_zone_assignments";
const LAYOUT_SCHEDULES_KEY = "digital_signage_layout_schedules";

// export function getLayouts(): Layout[] {
//   if (typeof window === "undefined") return [];
//   const data = localStorage.getItem(LAYOUTS_KEY);

//   return data ? JSON.parse(data) : [];
// }
export async function getLayouts(): Promise<Layout[]> {
  try {
    const res = await api.get("/layout/templates");

    console.log("res", res.data);

    // ✅ Assuming API response:
    // { status: true, data: [...] }

    return res.data || [];
  } catch (error) {
    console.error("Error fetching layouts:", error);
    return [];
  }
}

// export function saveLayout(layout: Layout): void {
//   const layouts = getLayouts();
//   const existingIndex = layouts.findIndex(
//     (l) => l.layout_id === layout.layout_id,
//   );
//   if (existingIndex >= 0) {
//     layouts[existingIndex] = layout;
//   } else {
//     layouts.push(layout);
//   }
//   localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
// }

// export async function saveLayout(layout: Layout): Promise<void> {
//   try {
//     const res = await api.post("/layout/template", layout);

//     toast.success(res?.data?.message || "Layout Saved successfully");
//   } catch (error) {
//     console.error("Save failed:", error);
//     toast.error(error?.message || "Saved locally but API failed ❌");
//   }
// }

export async function saveLayout(layout: Layout): Promise<void> {
  try {
    let res;

    if (layout.layout_id && layout.layout_id !== "") {
      // ✅ EDIT (UPDATE)
      res = await api.put(`/layout/template/${layout.layout_id}`, layout);
    } else {
      // ✅ CREATE
      res = await api.post("/layout/template", layout);
    }

    toast.success(res?.data?.message || "Layout saved successfully");
  } catch (error: any) {
    console.error("Save failed:", error);
    toast.error(error?.message || "Something went wrong ❌");
  }
}

// export function deleteLayout(layoutId: string): void {
//   const layouts = getLayouts().filter((l) => l.layout_id !== layoutId);
//   localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
// }

export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    const res = await api.delete(`/layout/template/${layoutId}`);
    toast.success(res?.data?.message || "Layout Deleted successfully");
  } catch (error: any) {
    console.error("Delete failed:", error);
    toast.error(error?.message || "Deleted locally but API failed ❌");
  }
}

export function getSchedules(): ScheduleConfig[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

// export function saveSchedule(schedule: ScheduleConfig): void {
//   const schedules = getSchedules();
//   const existingIndex = schedules.findIndex(
//     (s) => s.schedule_id === schedule.schedule_id,
//   );
//   if (existingIndex >= 0) {
//     schedules[existingIndex] = schedule;
//   } else {
//     schedules.push(schedule);
//   }
//   localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
// }

export async function saveSchedule(schedule: ScheduleConfig) {
  try {
    const res = await api.post("/layout/schedule", schedule);

    console.log("Schedule saved:", res.data);

    toast.success(res?.data?.message || "Schedule saved successfully");
  } catch (error: any) {
    console.error("Error saving schedule:", error);
    toast.error(error?.message || "Something went wrong ❌");
  }
}

export function deleteSchedule(scheduleId: string): void {
  const schedules = getSchedules().filter((s) => s.schedule_id !== scheduleId);
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// Helper function to calculate time in minutes from HH:mm
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes to HH:mm
export function minutesToTime(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Playlist functions
export function getPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PLAYLISTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlaylist(playlist: Playlist): void {
  const playlists = getPlaylists();
  const existingIndex = playlists.findIndex(
    (p) => p.playlist_id === playlist.playlist_id,
  );
  if (existingIndex >= 0) {
    playlists[existingIndex] = playlist;
  } else {
    playlists.push(playlist);
  }
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export function deletePlaylist(playlistId: string): void {
  const playlists = getPlaylists().filter((p) => p.playlist_id !== playlistId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

// Zone Assignment functions
export function getZoneAssignments(): ZoneAssignment[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ZONE_ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveZoneAssignment(assignment: ZoneAssignment): void {
  const assignments = getZoneAssignments();
  const existingIndex = assignments.findIndex(
    (a) => a.assignment_id === assignment.assignment_id,
  );
  if (existingIndex >= 0) {
    assignments[existingIndex] = assignment;
  } else {
    assignments.push(assignment);
  }
  localStorage.setItem(ZONE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function deleteZoneAssignment(assignmentId: string): void {
  const assignments = getZoneAssignments().filter(
    (a) => a.assignment_id !== assignmentId,
  );
  localStorage.setItem(ZONE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

// Layout Schedule functions
export function getLayoutSchedules(): LayoutSchedule[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LAYOUT_SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLayoutSchedule(schedule: LayoutSchedule): void {
  const schedules = getLayoutSchedules();
  const existingIndex = schedules.findIndex((s) => s.id === schedule.id);
  if (existingIndex >= 0) {
    schedules[existingIndex] = schedule;
  } else {
    schedules.push(schedule);
  }
  localStorage.setItem(LAYOUT_SCHEDULES_KEY, JSON.stringify(schedules));
}

export function deleteLayoutSchedule(scheduleId: string): void {
  const schedules = getLayoutSchedules().filter((s) => s.id !== scheduleId);
  localStorage.setItem(LAYOUT_SCHEDULES_KEY, JSON.stringify(schedules));
}
