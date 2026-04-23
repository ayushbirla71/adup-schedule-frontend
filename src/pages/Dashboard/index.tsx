// pages/Dashboard.tsx (or your file path)

"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity,
  Users,
  Calendar,
  Box,
  Rocket,
  TrendingUp,
  CalendarCheck,
  Server,
  Smartphone, // Import new icons
  AlertTriangleIcon,
  AlertCircle,
  AlertTriangle,
  SkipBack,
  Thermometer,
  HardDrive,
  Wifi,
  Zap,
  BarChart3,
  Play,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns"; // Import format

import { DateRangePicker } from "./components/DateRangePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import api from "@/api";
import { getRole } from "@/helpers";
import { PerformanceTablesCard } from "./components/PerformanceTables";
import { DashboardMap } from "./dashboardMap";

// Type for the overall stats fetched once
interface OverallStatsData {
  devices: number;
  deviceGroups: number;
  ads: number;
  clients?: number;
  schedules: number;
}

interface PerformanceOutlier {
  device_id: string;
  location: string;
  metric: string;
  value: string;
  severity: "critical" | "warning";
}

interface RecentEvent {
  id: number;
  event_type: string;
  timestamp: string;
  device: string;
  location: string;
}

// Type for the date-range sensitive KPIs
interface DynamicKpiData {
  totalImpressions: number;
  adsScheduledInRange: number;
  activeGroupsInRange: number;
  activeDevicesInRange: number;

  // health KPIs add
  networkIssues: number;
  storageIssues: number;
  deviceCrashes: number;
  diagnosticErrors: number;
  playbackErrors: number;

  performanceOutliers: PerformanceOutlier[]; // add
  recentEvents: RecentEvent[]; // add
}

// const performanceOutliers = [
//   {
//     id: 1,
//     location: "Delhi",
//     metric: "CPU Usage",
//     value: "94%",
//     severity: "critical",
//     device_id: "DEV-001",
//   },
//   {
//     id: 2,
//     location: "Mumbai",
//     metric: "RAM Free",
//     value: "125 MB",
//     severity: "warning",
//     device_id: "DEV-002",
//   },
//   {
//     id: 3,
//     location: "Bangalore",
//     metric: "Storage Free",
//     value: "245 MB",
//     severity: "warning",
//     device_id: "DEV-003",
//   },
//   {
//     id: 4,
//     location: "Hyderabad",
//     metric: "Network Latency",
//     value: "245ms",
//     severity: "critical",
//     device_id: "DEV-004",
//   },
// ];

// const recentErrors = [
//   {
//     id: 1,
//     event_type: "CRASH",
//     timestamp: "2 hours ago",
//     device: "DEV-045",
//     location: "Mumbai",
//   },
//   {
//     id: 2,
//     event_type: "OOM",
//     timestamp: "3 hours ago",
//     device: "DEV-089",
//     location: "Bangalore",
//   },
//   {
//     id: 3,
//     event_type: "NETWORK_ERROR",
//     timestamp: "5 hours ago",
//     device: "DEV-112",
//     location: "Delhi",
//   },
//   {
//     id: 4,
//     event_type: "STORAGE_FULL",
//     timestamp: "6 hours ago",
//     device: "DEV-067",
//     location: "Kolkata",
//   },
// ];

// const systemHealth = [
//   { metric: "Avg CPU Usage", value: "42%", normal: true },
//   { metric: "Avg RAM Available", value: "1.2 GB", normal: true },
//   { metric: "Network Health", value: "98%", normal: true },
//   { metric: "Storage Utilization", value: "72%", normal: false },
// ];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-50 border-l-4 border-red-500";
    case "warning":
      return "bg-amber-50 border-l-4 border-amber-500";
    default:
      return "bg-blue-50 border-l-4 border-blue-500";
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "CRASH":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case "OOM":
      return <Thermometer className="w-4 h-4 text-red-600" />;
    case "STORAGE_FULL":
      return <HardDrive className="w-4 h-4 text-amber-600" />;
    case "NETWORK_ERROR":
      return <Wifi className="w-4 h-4 text-orange-600" />;
    default:
      return <Zap className="w-4 h-4 text-slate-600" />;
  }
};

const Dashboard = () => {
  // State for overall stats (fetched once)
  const [overallStatsData, setOverallStatsData] =
    useState<OverallStatsData | null>(null);

  // State for the date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 13), // Default to last 14 days
    to: new Date(),
  });

  // State for the dynamic, date-range sensitive KPIs
  const [dynamicKpiData, setDynamicKpiData] = useState<DynamicKpiData | null>(
    null,
  );
  const [dynamicKpiLoading, setDynamicKpiLoading] = useState(false); // Start false, true when date changes
  const [dynamicKpiError, setDynamicKpiError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("last-7");
  const [systemHealth, setSystemHealth] = useState<any[]>([]);
  // const [role] = useState(getRole());

  // // Effect for fetching OVERALL stats (runs once)
  // useEffect(() => {
  //   const fetchOverallStats = async () => {
  //     setOverallStatsLoading(true);
  //     setOverallStatsError(null);
  //     try {
  //       // Use a specific endpoint that DOES NOT depend on date range
  //       const res = await api.get< OverallStatsData>("/dashboard/");
  //       console.log("Dashboard Overall Stats API response:", res.data);
  //       setOverallStatsData(res.data);
  //     } catch (error: any) {
  //       console.error("Error fetching dashboard overall stats:", error);
  //       setOverallStatsError(error.response?.data?.message || error.message || "Failed to load overall stats");
  //     } finally {
  //       setOverallStatsLoading(false);
  //     }
  //   };
  //   fetchOverallStats();
  // }, []); // Empty dependency array - runs once

  // Effect for fetching DYNAMIC KPIs based on DATE RANGE (runs when 'date' changes)
  useEffect(() => {
    const fetchDynamicKpis = async () => {
      // Don't fetch if date range is incomplete
      if (!date?.from || !date?.to) {
        setDynamicKpiData(null); // Clear previous data if range becomes invalid
        setDynamicKpiError(
          "Please select a valid date range for performance KPIs.",
        );
        setDynamicKpiLoading(false); // Ensure loading is off
        return;
      }

      setDynamicKpiLoading(true);
      setDynamicKpiError(null);

      const startDate = format(date.from, "yyyy-MM-dd");
      const endDate = format(date.to, "yyyy-MM-dd");
      const params = new URLSearchParams({ startDate, endDate });

      try {
        // Use the date-range sensitive stats endpoint
        const res = await api.get<DynamicKpiData>(
          `/dashboard/stats?${params.toString()}`,
        );

        setDynamicKpiData(res.data);
        setSystemHealth([
          {
            metric: "Avg CPU Usage",
            value: `${res.data.systemHealth.avgCpuUsage.toFixed(0)}%`,
            normal: res.data.systemHealth.avgCpuUsage < 70,
          },
          {
            metric: "Avg RAM Available",
            value: `${res.data.systemHealth.avgRamFree.toFixed(0)} MB`,
            normal: res.data.systemHealth.avgRamFree > 500,
          },
          {
            metric: "Storage Available",
            value: `${res.data.systemHealth.avgStorageFree.toFixed(0)} MB`,
            normal: res.data.systemHealth.avgStorageFree > 1000,
          },
          {
            metric: "Network Health",
            value: `${res.data.systemHealth.networkHealth}%`,
            normal: res.data.systemHealth.networkHealth > 90,
          },
        ]);
      } catch (error: any) {
        setDynamicKpiError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load performance KPIs",
        );
        setDynamicKpiData(null); // Clear data on error
      } finally {
        setDynamicKpiLoading(false);
      }
    };

    fetchDynamicKpis();
  }, [date]); // *** Dependency: re-run whenever 'date' changes ***

  // Loading state for the initial overall stats fetch
  // if (overallStatsLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
  //       <span className="ml-2 text-muted-foreground">Loading Dashboard...</span>
  //     </div>
  //   );
  // }

  // // Error state for the initial overall stats fetch
  // if (overallStatsError) {
  //   return <div className="p-6 text-center text-red-600">Error: {overallStatsError}</div>;
  // }

  // Should not happen if error handling is right, but good practice
  // if (!overallStatsData) {
  //   return <div className="p-6 text-center text-muted-foreground">No dashboard data available.</div>;
  // }

  // --- Render the Dashboard ---
  return (
    // <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
    //   {/* Header Section */}
    //   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    //     <div className="space-y-1">
    //       <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
    //       <p className="text-sm md:text-base text-muted-foreground">
    //         System statistics and performance details.
    //       </p>
    //     </div>
    //     <div className="w-full sm:w-auto">
    //       <DateRangePicker
    //         date={date}
    //         setDate={setDate}
    //         className="w-full sm:w-auto"
    //       />
    //     </div>
    //   </div>

    //   {/* Overall System Stats Cards Grid */}
    //   {/* <div>
    //     <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Overall System Totals</h2>
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
    //       <StatsCard title="Total Devices" value={overallStatsData.devices} icon={<Rocket className="h-4 w-4 text-muted-foreground" />} />
    //       <StatsCard title="Device Groups" value={overallStatsData.deviceGroups} icon={<Box className="h-4 w-4 text-muted-foreground" />} />
    //       <StatsCard title="Total Ads" value={overallStatsData.ads} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
    //       {role === "Admin" && <StatsCard title="Total Clients" value={overallStatsData.clients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />}
    //       <StatsCard title="Total Schedules" value={overallStatsData.schedules} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
    //     </div>
    //   </div> */}

    //   {/* Dynamic Performance KPI Section */}
    // <div className="space-y-4">
    //   <div>
    //     <h2 className="text-lg md:text-xl font-semibold mb-3 text-foreground">
    //       Performance Overview
    //     </h2>
    //     <p className="text-sm text-muted-foreground mb-4">
    //       Key metrics for the selected date range
    //     </p>
    //   </div>

    //   {/* Loading State */}
    //   {dynamicKpiLoading && (
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    //       {[...Array(4)].map(
    //         (
    //           _,
    //           i, // Render 4 skeleton cards
    //         ) => (
    //           <Card key={i} className="p-4 md:p-6">
    //             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
    //               <Skeleton className="h-4 w-3/5" />{" "}
    //               {/* Skeleton for title */}
    //               <Skeleton className="h-4 w-4" /> {/* Skeleton for icon */}
    //             </CardHeader>
    //             <CardContent className="p-0 pt-2">
    //               <Skeleton className="h-8 w-1/2" />{" "}
    //               {/* Skeleton for value */}
    //             </CardContent>
    //           </Card>
    //         ),
    //       )}
    //     </div>
    //   )}
    //   {/* Error State */}
    //   {!dynamicKpiLoading && dynamicKpiError && (
    //     <Alert variant="destructive" className="p-4 md:p-6">
    //       <AlertTriangleIcon className="h-4 w-4" />
    //       <AlertTitle className="text-sm md:text-base">
    //         Error Loading Performance KPIs
    //       </AlertTitle>
    //       <AlertDescription className="text-sm">
    //         {dynamicKpiError}
    //       </AlertDescription>
    //     </Alert>
    //   )}

    //   {/* Data State */}
    //   {!dynamicKpiLoading && !dynamicKpiError && dynamicKpiData && (
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    //       <StatsCard
    //         title="Total Impressions"
    //         value={dynamicKpiData.totalImpressions}
    //         icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
    //       />
    //       <StatsCard
    //         title="Ads Scheduled"
    //         value={dynamicKpiData.adsScheduledInRange}
    //         icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
    //       />
    //       <StatsCard
    //         title="Active Groups"
    //         value={dynamicKpiData.activeGroupsInRange}
    //         icon={<Server className="h-4 w-4 text-muted-foreground" />}
    //       />
    //       <StatsCard
    //         title="Active Devices"
    //         value={dynamicKpiData.activeDevicesInRange}
    //         icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
    //       />
    //     </div>
    //   )}

    //   {/* No Data State */}
    //   {!dynamicKpiLoading && !dynamicKpiError && !dynamicKpiData && (
    //     <div className="text-center py-8">
    //       <p className="text-sm md:text-base text-muted-foreground">
    //         No performance data available for the selected period.
    //       </p>
    //     </div>
    //   )}
    // </div>

    // {/* Map Section */}
    // <div className="space-y-3">
    //   <h2 className="text-xl font-semibold">Devices Location</h2>

    //   <Card className="p-4">
    //     <DashboardMap />
    //   </Card>
    // </div>

    //   {/* Performance Details Tables Card (passes date range down) */}
    //   <PerformanceTablesCard dateRange={date} />
    // </div>

    <div className="min-h-screen w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full ">
      <div className="">
        <div className="space-y-1 mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            System statistics and performance details.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* LEFT HALF - Filters + Map */}
          <div className="flex flex-col">
            {/* Header Section */}
            <div className="flex  items-start  gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <DateRangePicker
                  date={date}
                  setDate={setDate}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
            {/* Map Section */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Devices Location</h2>

              <Card className="p-4">
                <DashboardMap />
              </Card>
            </div>
          </div>
          {/* RIGHT HALF - Cards and Insights */}
          <div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 text-foreground">
                Performance Overview
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Key metrics for the selected date range
              </p>
            </div>
            <div className="flex flex-col space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Dynamic Performance KPI Section */}
              <div className="space-y-4">
                {/* Loading State */}
                {dynamicKpiLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 md:gap-6">
                    {[...Array(4)].map(
                      (
                        _,
                        i, // Render 4 skeleton cards
                      ) => (
                        <Card key={i} className="p-4 md:p-6">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                            <Skeleton className="h-4 w-3/5" />{" "}
                            {/* Skeleton for title */}
                            <Skeleton className="h-4 w-4" />{" "}
                            {/* Skeleton for icon */}
                          </CardHeader>
                          <CardContent className="p-0 pt-2">
                            <Skeleton className="h-8 w-1/2" />{" "}
                            {/* Skeleton for value */}
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                )}
                {/* Error State */}
                {!dynamicKpiLoading && dynamicKpiError && (
                  <Alert variant="destructive" className="p-4 md:p-6">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle className="text-sm md:text-base">
                      Error Loading Performance KPIs
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {dynamicKpiError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Data State */}
                {!dynamicKpiLoading && !dynamicKpiError && dynamicKpiData && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                      <StatsCard
                        title="Total Impressions"
                        value={dynamicKpiData.totalImpressions}
                        icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
                        bgColor="bg-blue-50"
                      />

                      <StatsCard
                        title="Ads Scheduled"
                        value={dynamicKpiData.adsScheduledInRange}
                        icon={
                          <CalendarCheck className="h-4 w-4 text-indigo-600" />
                        }
                        bgColor="bg-indigo-50"
                      />

                      {/* <StatsCard
                        title="Active Groups"
                        value={dynamicKpiData.activeGroupsInRange}
                        icon={<Server className="h-4 w-4 text-cyan-600" />}
                        bgColor="bg-cyan-50"
                      /> */}

                      <StatsCard
                        title="Active Devices"
                        value={dynamicKpiData.activeDevicesInRange}
                        icon={
                          <Smartphone className="h-4 w-4 text-purple-600" />
                        }
                        bgColor="bg-purple-50"
                      />

                      <StatsCard
                        title="Network Issues"
                        value={dynamicKpiData.networkIssues}
                        icon={<AlertCircle className="h-4 w-4 text-red-600" />}
                        bgColor="bg-red-50"
                      />

                      <StatsCard
                        title="Storage Issues"
                        value={dynamicKpiData.storageIssues}
                        icon={
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        }
                        bgColor="bg-amber-50"
                      />

                      <StatsCard
                        title="Device Crashes"
                        value={dynamicKpiData.deviceCrashes}
                        icon={<SkipBack className="h-4 w-4 text-rose-600" />}
                        bgColor="bg-rose-50"
                      />
                      <StatsCard
                        title="Diagnostic Errors"
                        value={dynamicKpiData.diagnosticErrors}
                        icon={
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        }
                        bgColor="bg-rose-50"
                      />
                      <StatsCard
                        title="Playback Errors"
                        value={dynamicKpiData.playbackErrors}
                        icon={
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        }
                        bgColor="bg-rose-50"
                      />
                    </div>
                    {/* Telemetry Insights - Consolidated */}
                    {systemHealth.length > 0 && (
                      <TelemetryInsights
                        dateRange={dateRange}
                        systemHealth={systemHealth}
                        performanceOutliers={dynamicKpiData.performanceOutliers}
                        recentErrors={dynamicKpiData?.recentEvents ?? []}
                      />
                    )}
                  </>
                )}

                {/* No Data State */}
                {!dynamicKpiLoading && !dynamicKpiError && !dynamicKpiData && (
                  <div className="text-center py-8">
                    <p className="text-sm md:text-base text-muted-foreground">
                      No performance data available for the selected period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Details Tables Card (passes date range down) */}
        <div className="mt-4">
          <PerformanceTablesCard dateRange={date} />
        </div>
      </div>
    </div>
  );
};

// Stats Card Component (accepts null/undefined value)
interface StatsCardProps {
  title: string;
  value: number | undefined | null;
  icon: React.ReactNode;
  bgColor?: string;
}
// const StatsCard = ({ title, value, icon }: StatsCardProps) => (
//   <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
//     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
//       <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
//         {title}
//       </CardTitle>
//       <div className="flex-shrink-0">{icon}</div>
//     </CardHeader>
//     <CardContent className="p-0 pt-2">
//       <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
//         {value != null ? value.toLocaleString() : "-"}
//       </div>
//     </CardContent>
//   </Card>
// );

const StatsCard = ({ title, value, icon, bgColor }: StatsCardProps) => (
  // <Card className="p-5 rounded-2xl border bg-white hover:shadow-lg transition-all duration-300">
  //   <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
  //     <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>

  //     <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted">
  //       {icon}
  //     </div>
  //   </CardHeader>

  //   <CardContent className="p-0">
  //     <div className="text-3xl font-bold">
  //       {value != null ? value.toLocaleString() : "-"}
  //     </div>
  //   </CardContent>
  // </Card>

  <Card className="bg-white rounded-xl border-slate-200 p-3 shadow-sm hover:shadow-md transition-all hover:border-slate-300">
    <CardContent className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-xl font-bold text-slate-900">
            {value != null ? value.toLocaleString() : "-"}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

function TelemetryInsights({
  dateRange,
  systemHealth,
  performanceOutliers,
  recentErrors,
}: {
  dateRange: string;
  systemHealth: any[];
  performanceOutliers: any;
  recentErrors: any;
}) {
  function parseLatLon(location: string) {
    const [lat, lon] = location.split(",").map(Number);
    return { lat, lon };
  }
  const [resolvedLocations, setResolvedLocations] = useState<
    Record<string, string>
  >({});

  async function getAddressFromCoordinates(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      return "Unknown Location";
    }
  }

  useEffect(() => {
    async function resolveAddresses() {
      const updates: Record<string, string> = {};

      for (const outlier of performanceOutliers) {
        if (!resolvedLocations[outlier.location]) {
          const { lat, lon } = parseLatLon(outlier.location);
          const address = await getAddressFromCoordinates(lat, lon);
          updates[outlier.location] = address;
        }
      }

      setResolvedLocations((prev) => ({ ...prev, ...updates }));
    }

    if (performanceOutliers.length > 0) {
      resolveAddresses();
    }
  }, [performanceOutliers]);
  function formatTimeAgo(date: string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  return (
    <div className="space-y-4">
      {/* System Health Summary */}
      <Card className="bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-slate-900 text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {systemHealth.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-600">{item.metric}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${item.normal ? "text-green-600" : "text-amber-600"}`}
                >
                  {item.value}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${item.normal ? "bg-green-500" : "bg-amber-500"}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Outliers */}
      <Card className="bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-slate-900 text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Performance Outliers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {performanceOutliers.length === 0 ? (
            <p className="text-xs text-slate-500">No outliers detected</p>
          ) : (
            performanceOutliers.map((outlier) => (
              <div
                key={outlier.id}
                className={`p-3 rounded text-xs ${getSeverityColor(outlier.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {resolvedLocations[outlier.location] ||
                        "Resolving location..."}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {outlier.metric}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{outlier.value}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {outlier.device_id}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Error Events */}
      <Card className="bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-slate-900 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {recentErrors.map((error) => (
            <div
              key={error.id}
              className="flex items-start gap-3 p-2 bg-slate-50 rounded border border-slate-200"
            >
              <div className="mt-1">{getEventIcon(error.event_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900">
                    {error.event_type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTimeAgo(error.timestamp)}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {error.device} •{" "}
                  {resolvedLocations[error.location] || "Resolving location..."}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
export default Dashboard;
