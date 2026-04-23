import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  X,
} from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Device {
  device_id: string;
  device_name: string;
  group_id: string;
  android_id: string;
  location: string;
  status: string;
  registration_status: string;
  tags: string | null;
  pairing_code: string | null;
  last_synced: string;
  created_at: string;
  updated_at: string;
  DeviceGroup: {
    name: string;
    reg_code: string;
    group_id: string;
  };
}

interface ProofOfPlayLog {
  id: string;
  event_id: string;
  device_id: string;
  ad_id: string;
  schedule_id: string | null;
  start_time: string;
  end_time: string;
  duration_played_ms: number;
  created_at: string;
  updated_at: string;
}

interface DeviceEventLog {
  id: string;
  event_id: string;
  device_id: string;
  timestamp: string;
  event_type: string;
  payload: string;
  created_at: string;
  updated_at: string;
}

interface DeviceTelemetry {
  id: string;
  device_id: string;
  timestamp: string;
  cpu_usage: number;
  ram_free_mb: number;
  storage_free_mb: number | null;
  network_type: string | null;
  app_version_code: number | null;
  created_at: string;
  updated_at: string;
}

interface Schedule {
  schedule_id: string;
  start_time: string;
  end_time: string;
  Ad: {
    name: string;
  };
}

interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

interface DeviceDetailsResponse {
  device: Device;
  schedules: PaginatedResponse<Schedule>;
}

function DevicePage() {
  const { device_id } = useParams<{ device_id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [proofOfPlayLogs, setProofOfPlayLogs] = useState<ProofOfPlayLog[]>([]);
  const [deviceEventLogs, setDeviceEventLogs] = useState<DeviceEventLog[]>([]);
  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedules");

  // Pagination state for schedules
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [schedulesLimit, setSchedulesLimit] = useState(10);
  const [schedulesTotal, setSchedulesTotal] = useState(0);
  const [schedulesTotalPages, setSchedulesTotalPages] = useState(0);

  // Pagination state for proof of play logs
  const [proofOfPlayPage, setProofOfPlayPage] = useState(1);
  const [proofOfPlayLimit, setProofOfPlayLimit] = useState(10);
  const [proofOfPlayTotal, setProofOfPlayTotal] = useState(0);
  const [proofOfPlayTotalPages, setProofOfPlayTotalPages] = useState(0);

  // Pagination state for device event logs
  const [eventLogsPage, setEventLogsPage] = useState(1);
  const [eventLogsLimit, setEventLogsLimit] = useState(10);
  const [eventLogsTotal, setEventLogsTotal] = useState(0);
  const [eventLogsTotalPages, setEventLogsTotalPages] = useState(0);

  // Pagination state for device terminology
  const [terminologyPage, setTerminologyPage] = useState(1);
  const [terminologyLimit, setTerminologyLimit] = useState(10);
  const [terminologyTotal, setTerminologyTotal] = useState(0);
  const [terminologyTotalPages, setTerminologyTotalPages] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDevice, setEditedDevice] = useState(device);

  // Export dialog state for Proof of Play
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState("today");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Export dialog state for Event Logs
  const [eventLogsExportDialogOpen, setEventLogsExportDialogOpen] =
    useState(false);
  const [eventLogsExportFilter, setEventLogsExportFilter] = useState("today");
  const [eventLogsExportStartDate, setEventLogsExportStartDate] = useState("");
  const [eventLogsExportEndDate, setEventLogsExportEndDate] = useState("");
  const [isEventLogsExporting, setIsEventLogsExporting] = useState(false);

  // Export state for Full Device Details
  const [fullDeviceExportDialogOpen, setFullDeviceExportDialogOpen] =
    useState(false);
  const [fullDeviceExportFilter, setFullDeviceExportFilter] = useState("today");
  const [fullDeviceExportStartDate, setFullDeviceExportStartDate] =
    useState("");
  const [fullDeviceExportEndDate, setFullDeviceExportEndDate] = useState("");
  const [isFullDeviceExporting, setIsFullDeviceExporting] = useState(false);

  const handleChange = (field, value) => {
    setEditedDevice({ ...editedDevice, [field]: value });
  };

  const handleCancel = () => {
    setEditedDevice(device);
    setIsEditing(false);
  };

  const handleSave = () => {
    handleUpdateDeviceData();
  };

  const handleUpdateDeviceData = async () => {
    try {
      setLoading(true);

      // Collect editable fields
      const editableFields = [
        "device_on_time",
        "device_off_time",
        "device_resolution",
        "device_orientation",
      ];

      // Compare old (device) vs new (editedDevice)
      const updatedData = {};
      editableFields.forEach((field) => {
        if (editedDevice[field] !== device[field]) {
          updatedData[field] = editedDevice[field];
        }
      });

      // If nothing changed, skip request
      if (Object.keys(updatedData).length === 0) {
        console.log("No changes detected, skipping update");
        setIsEditing(false);
        return;
      }

      // Send only changed fields
      const response = await api.post(
        `/device/update/location/${device?.device_id}`,
        updatedData,
      );

      // Update local data and exit edit mode
      // setEditedDevice(response.data);
      setIsEditing(false);

      console.log("✅ Device updated successfully:", response.data);
    } catch (error) {
      console.error("❌ Failed to update device data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export function
  // const handleExport = async () => {
  //   try {
  //     setIsExporting(true);

  //     let url = "device/proof-of-play/export";
  //     const params = new URLSearchParams();

  //     // Handle different filter types
  //     if (
  //       exportFilter === "today" ||
  //       exportFilter === "yesterday" ||
  //       exportFilter === "full"
  //     ) {
  //       params.append("filter", exportFilter);
  //     } else if (exportFilter === "date_range") {
  //       // Date range export
  //       if (exportStartDate) params.append("start_date", exportStartDate);
  //       if (exportEndDate) params.append("end_date", exportEndDate);
  //     }

  //     // Always add the current device_id since it's mandatory
  //     if (device_id) {
  //       params.append("device_id", device_id);
  //     }

  //     // Build final URL
  //     if (params.toString()) {
  //       url += `?${params.toString()}`;
  //     }

  //     // Make API call to download file
  //     const response = await api.get(url, {
  //       responseType: "blob",
  //     });

  //     // Create download link
  //     const blob = new Blob([response as any], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;

  //     // Generate filename based on filter
  //     let filename = "proof-of-play-export";
  //     if (exportFilter === "today") filename += "-today";
  //     else if (exportFilter === "yesterday") filename += "-yesterday";
  //     else if (exportFilter === "full") filename += "-full";
  //     else if (exportFilter === "date_range")
  //       filename += `-${exportStartDate}-to-${exportEndDate}`;

  //     if (device_id) filename += `-device-${device_id}`;
  //     filename += ".xlsx";

  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);

  //     setExportDialogOpen(false);

  //     // Reset form
  //     setExportFilter("today");
  //     setExportStartDate("");
  //     setExportEndDate("");
  //   } catch (error) {
  //     console.error("Export failed:", error);
  //     alert("Export failed. Please try again.");
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let startDate = "";
      let endDate = "";

      const today = new Date();

      if (exportFilter === "today") {
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (exportFilter === "yesterday") {
        const d = new Date();
        d.setDate(today.getDate() - 1);
        startDate = d.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (exportFilter === "full") {
        startDate = "2025-03-01";
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "date_range") {
        startDate = exportStartDate;
        endDate = exportEndDate;
      }

      const payload = {
        job_type: "PROOF_OF_PLAY",
        device_id: device_id,
        start_date: startDate,
        end_date: endDate,
      };

      await api.post("/exports", payload);

      setExportDialogOpen(false);

      setExportFilter("today");
      setExportStartDate("");
      setExportEndDate("");

      toast.success("Export job created successfully!");
      navigate("/all-exports");
    } catch (error) {
      console.error("Export job failed:", error);
      toast.error(error?.message || "Export job failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Event Logs export
  // const handleEventLogsExport = async () => {
  //   try {
  //     setIsEventLogsExporting(true);

  //     let url = "/device/event-logs/export";
  //     const params = new URLSearchParams();

  //     // Handle different filter types
  //     if (
  //       eventLogsExportFilter === "today" ||
  //       eventLogsExportFilter === "yesterday" ||
  //       eventLogsExportFilter === "full"
  //     ) {
  //       params.append("filter", eventLogsExportFilter);
  //     } else if (eventLogsExportFilter === "date_range") {
  //       // Date range export
  //       if (eventLogsExportStartDate)
  //         params.append("start_date", eventLogsExportStartDate);
  //       if (eventLogsExportEndDate)
  //         params.append("end_date", eventLogsExportEndDate);
  //     }

  //     // Always add the current device_id since it's mandatory
  //     if (device_id) {
  //       params.append("device_id", device_id);
  //     }

  //     if (params.toString()) {
  //       url += `?${params.toString()}`;
  //     }

  //     const response = await api.get(url, {
  //       responseType: "blob",
  //     });

  //     const blob = new Blob([response as any], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;

  //     // Generate filename based on filter
  //     let filename = "event-logs-export";
  //     if (eventLogsExportFilter === "today") filename += "-today";
  //     else if (eventLogsExportFilter === "yesterday") filename += "-yesterday";
  //     else if (eventLogsExportFilter === "full") filename += "-full";
  //     else if (eventLogsExportFilter === "date_range")
  //       filename += `-${eventLogsExportStartDate}-to-${eventLogsExportEndDate}`;

  //     if (device_id) filename += `-device-${device_id}`;
  //     filename += ".xlsx";

  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);

  //     setEventLogsExportDialogOpen(false);

  //     // Reset form
  //     setEventLogsExportFilter("today");
  //     setEventLogsExportStartDate("");
  //     setEventLogsExportEndDate("");
  //   } catch (error) {
  //     console.error("Event Logs export failed:", error);
  //     alert("Event Logs export failed. Please try again.");
  //   } finally {
  //     setIsEventLogsExporting(false);
  //   }
  // };

  const handleEventLogsExport = async () => {
    try {
      setIsEventLogsExporting(true);

      let startDate = "";
      let endDate = "";

      const today = new Date();

      if (eventLogsExportFilter === "today") {
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (eventLogsExportFilter === "yesterday") {
        const d = new Date();
        d.setDate(today.getDate() - 1);
        startDate = d.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (eventLogsExportFilter === "full") {
        startDate = "2025-03-01";
        endDate = today.toISOString().split("T")[0];
      }

      if (eventLogsExportFilter === "date_range") {
        startDate = eventLogsExportStartDate;
        endDate = eventLogsExportEndDate;
      }

      const payload = {
        job_type: "DEVICE_EVENTS",
        device_id: device_id,
        start_date: startDate,
        end_date: endDate,
      };

      await api.post("/exports", payload);

      setEventLogsExportDialogOpen(false);

      setEventLogsExportFilter("today");
      setEventLogsExportStartDate("");
      setEventLogsExportEndDate("");

      toast.success("Event logs export job created!");
      navigate("/all-exports");
    } catch (error) {
      console.error("Event logs export failed:", error);
      toast.error(error.message || "Export job failed.");
    } finally {
      setIsEventLogsExporting(false);
    }
  };

  // Handle Full Device Details export
  // const handleFullDeviceExport = async () => {
  //   try {
  //     setIsFullDeviceExporting(true);

  //     let url = `/device/${device_id}/export-full-details`;
  //     const params = new URLSearchParams();

  //     // Handle different filter types
  //     if (
  //       fullDeviceExportFilter === "today" ||
  //       fullDeviceExportFilter === "yesterday" ||
  //       fullDeviceExportFilter === "week" ||
  //       fullDeviceExportFilter === "month" ||
  //       fullDeviceExportFilter === "year" ||
  //       fullDeviceExportFilter === "all"
  //     ) {
  //       params.append("filter", fullDeviceExportFilter);
  //     } else if (fullDeviceExportFilter === "date_range") {
  //       // Date range export
  //       if (fullDeviceExportStartDate)
  //         params.append("start_date", fullDeviceExportStartDate);
  //       if (fullDeviceExportEndDate)
  //         params.append("end_date", fullDeviceExportEndDate);
  //     }

  //     if (params.toString()) {
  //       url += `?${params.toString()}`;
  //     }

  //     const response = await api.get(url, {
  //       responseType: "blob",
  //     });

  //     const blob = new Blob([response as any], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;

  //     // Generate filename based on filter
  //     let filename = "full-device-details";
  //     if (fullDeviceExportFilter === "today") filename += "-today";
  //     else if (fullDeviceExportFilter === "yesterday") filename += "-yesterday";
  //     else if (fullDeviceExportFilter === "week") filename += "-week";
  //     else if (fullDeviceExportFilter === "month") filename += "-month";
  //     else if (fullDeviceExportFilter === "year") filename += "-year";
  //     else if (fullDeviceExportFilter === "all") filename += "-all";
  //     else if (fullDeviceExportFilter === "date_range")
  //       filename += `-${fullDeviceExportStartDate}-to-${fullDeviceExportEndDate}`;

  //     const deviceName = device?.device_name || "unknown-device";
  //     const sanitizedDeviceName = deviceName.replace(/[^a-zA-Z0-9-_]/g, "-");
  //     filename += `-${sanitizedDeviceName}.xlsx`;

  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);

  //     setFullDeviceExportDialogOpen(false);

  //     // Reset form
  //     setFullDeviceExportFilter("today");
  //     setFullDeviceExportStartDate("");
  //     setFullDeviceExportEndDate("");

  //     console.log("✅ Full device details exported successfully");
  //   } catch (error) {
  //     console.error("Full device details export failed:", error);
  //     alert("Full device details export failed. Please try again.");
  //   } finally {
  //     setIsFullDeviceExporting(false);
  //   }
  // };

  const handleFullDeviceExport = async () => {
    try {
      setIsFullDeviceExporting(true);

      let startDate = "";
      let endDate = "";

      const today = new Date();

      if (fullDeviceExportFilter === "today") {
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (fullDeviceExportFilter === "yesterday") {
        const d = new Date();
        d.setDate(today.getDate() - 1);
        startDate = d.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (fullDeviceExportFilter === "week") {
        const start = new Date();
        start.setDate(today.getDate() - 7);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (fullDeviceExportFilter === "month") {
        const start = new Date();
        start.setMonth(today.getMonth() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (fullDeviceExportFilter === "year") {
        const start = new Date();
        start.setFullYear(today.getFullYear() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (fullDeviceExportFilter === "all") {
        startDate = "2025-03-01";
        endDate = today.toISOString().split("T")[0];
      }

      if (fullDeviceExportFilter === "date_range") {
        startDate = fullDeviceExportStartDate;
        endDate = fullDeviceExportEndDate;
      }

      const payload = {
        job_type: "PROOF_OF_PLAY",
        device_id: device_id,
        start_date: startDate,
        end_date: endDate,
      };

      await api.post("/exports", payload);

      setFullDeviceExportDialogOpen(false);

      setFullDeviceExportFilter("today");
      setFullDeviceExportStartDate("");
      setFullDeviceExportEndDate("");

      toast.success("Full device export job created!");
      navigate("/all-exports");
    } catch (error) {
      console.error("Full device export failed:", error);
      toast.error(error.message || "Export job failed.");
    } finally {
      setIsFullDeviceExporting(false);
    }
  };
  useEffect(() => {
    if (!device_id) return;

    const fetchDeviceData = async () => {
      setLoading(true);
      try {
        // Fetch device details and schedules
        const deviceDetailsResponse: DeviceDetailsResponse = await api.get(
          `/device/${device_id}?page=${schedulesPage}&limit=${schedulesLimit}`,
        );
        setEditedDevice(deviceDetailsResponse.device);
        setDevice(deviceDetailsResponse.device);
        setSchedules(deviceDetailsResponse.schedules.data || []);
        setSchedulesTotal(deviceDetailsResponse.schedules.total);
        setSchedulesTotalPages(deviceDetailsResponse.schedules.totalPages);

        // Fetch proof of play logs
        const proofOfPlayResponse: PaginatedResponse<ProofOfPlayLog> =
          await api.get(
            `/device/${device_id}/proof-of-play-logs?page=${proofOfPlayPage}&limit=${proofOfPlayLimit}`,
          );
        setProofOfPlayLogs(proofOfPlayResponse.data || []);
        setProofOfPlayTotal(proofOfPlayResponse.total);
        setProofOfPlayTotalPages(proofOfPlayResponse.totalPages);

        // Fetch device event logs
        const eventLogsResponse: PaginatedResponse<DeviceEventLog> =
          await api.get(
            `/device/${device_id}/event-logs?page=${eventLogsPage}&limit=${eventLogsLimit}`,
          );
        setDeviceEventLogs(eventLogsResponse.data || []);
        setEventLogsTotal(eventLogsResponse.total);
        setEventLogsTotalPages(eventLogsResponse.totalPages);

        // Fetch device telemetry
        const telemetryResponse: PaginatedResponse<DeviceTelemetry> =
          await api.get(
            `/device/${device_id}/telemetry-logs?page=${terminologyPage}&limit=${terminologyLimit}`,
          );
        setDeviceTelemetry(telemetryResponse.data || []);
        setTerminologyTotal(telemetryResponse.total);
        setTerminologyTotalPages(telemetryResponse.totalPages);
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [
    device_id,
    schedulesPage,
    schedulesLimit,
    proofOfPlayPage,
    proofOfPlayLimit,
    eventLogsPage,
    eventLogsLimit,
    terminologyPage,
    terminologyLimit,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading device details...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-lg mb-4">Device not found</div>
        <Button onClick={() => navigate("/devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/devices")}
          className="w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Devices</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Global Export Button */}
        <Dialog
          open={fullDeviceExportDialogOpen}
          onOpenChange={setFullDeviceExportDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                Export Full Device Details
              </span>
              <span className="sm:hidden">Export Details</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Export Full Device Details</DialogTitle>
              <div className="text-sm text-muted-foreground mt-2">
                Exporting comprehensive data for:{" "}
                <span className="font-medium text-foreground">
                  {device?.device_name || "Unknown Device"}
                </span>
              </div>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullDeviceFilter">Export Filter</Label>
                <Select
                  value={fullDeviceExportFilter}
                  onValueChange={setFullDeviceExportFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today's Data</SelectItem>
                    <SelectItem value="yesterday">Yesterday's Data</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Historical Data</SelectItem>
                    <SelectItem value="date_range">
                      Custom Date Range
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fullDeviceExportFilter === "date_range" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium">Date Range Selection</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullDeviceStartDate">Start Date</Label>
                      <Input
                        id="fullDeviceStartDate"
                        type="date"
                        value={fullDeviceExportStartDate}
                        onChange={(e) =>
                          setFullDeviceExportStartDate(e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullDeviceEndDate">End Date</Label>
                      <Input
                        id="fullDeviceEndDate"
                        type="date"
                        value={fullDeviceExportEndDate}
                        onChange={(e) =>
                          setFullDeviceExportEndDate(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFullDeviceExportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleFullDeviceExport}
                disabled={
                  isFullDeviceExporting ||
                  (fullDeviceExportFilter === "date_range" &&
                    (!fullDeviceExportStartDate || !fullDeviceExportEndDate))
                }
              >
                {isFullDeviceExporting ? "Exporting..." : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device Information Card - Fixed at top */}
      {device && (
        <Card className="mb-6 shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-semibold">
              Device Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Section — Basic Info */}
              <div className="space-y-4 md:space-y-5 bg-gray-50 p-4 md:p-6 rounded-xl">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Device Name
                  </h4>
                  <p className="text-base md:text-lg font-semibold text-gray-900 break-words">
                    {device.device_name}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Device ID
                  </h4>
                  <p className="text-xs md:text-sm font-mono text-gray-800 break-all">
                    {device.device_id}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Group
                  </h4>
                  <p className="text-base font-semibold text-gray-900 break-words">
                    {device.DeviceGroup?.name || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Code: {device.DeviceGroup?.reg_code || "—"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      device.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      device.registration_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : device.registration_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.registration_status}
                  </span>
                </div>

                {device.tags &&
                typeof device.tags === "string" &&
                device.tags.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {device.tags.split(",").map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right Section — Technical Specs */}
              <div className="relative space-y-4 md:space-y-5 bg-gray-50 p-4 md:p-6 rounded-xl">
                {/* Edit Icon */}
                {/* <div className="absolute top-3 right-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <Pencil size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div> */}

                {/* Grid 1 — Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Type
                    </h4>
                    <p className="text-sm text-gray-900 capitalize break-words">
                      {(device as any).device_type || "—"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Model
                    </h4>
                    <p className="text-sm text-gray-900 break-words">
                      {(device as any).device_model || "—"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      OS
                    </h4>
                    <p className="text-sm text-gray-900 capitalize break-words">
                      {(device as any).device_os || "—"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      OS Version
                    </h4>
                    <p className="text-sm text-gray-900 break-words">
                      {(device as any).device_os_version || "—"}
                    </p>
                  </div>

                  {/* Orientation — Editable Dropdown */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Orientation
                    </h4>
                    {isEditing ? (
                      <select
                        value={(editedDevice as any)?.device_orientation || ""}
                        onChange={(e) =>
                          handleChange("device_orientation", e.target.value)
                        }
                        className="w-full border rounded-lg p-2 text-sm text-gray-900 capitalize"
                      >
                        <option value="">Select orientation</option>
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                        <option value="auto">Auto</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 capitalize break-words">
                        {(device as any).device_orientation || "—"}
                      </p>
                    )}
                  </div>

                  {/* Resolution — Editable Input */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Resolution
                    </h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={(editedDevice as any)?.device_resolution || ""}
                        onChange={(e) =>
                          handleChange("device_resolution", e.target.value)
                        }
                        className="w-full border rounded-lg p-2 text-sm text-gray-900"
                        placeholder="e.g. 1920x1080"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 break-words">
                        {(device as any).device_resolution || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid 2 — On/Off Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      On Time
                    </h4>
                    {isEditing ? (
                      <input
                        type="time"
                        value={(editedDevice as any)?.device_on_time || ""}
                        onChange={(e) =>
                          handleChange("device_on_time", e.target.value)
                        }
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {(device as any).device_on_time || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Off Time
                    </h4>
                    {isEditing ? (
                      <input
                        type="time"
                        value={(editedDevice as any)?.device_off_time || ""}
                        onChange={(e) =>
                          handleChange("device_off_time", e.target.value)
                        }
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {(device as any).device_off_time || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Location
                  </h4>
                  <p className="text-sm text-gray-900 break-words">
                    {device.location}
                  </p>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Last Synced
                    </h4>
                    <p className="text-xs text-gray-700 break-words">
                      {new Date(device.last_synced).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Created At
                    </h4>
                    <p className="text-xs text-gray-700 break-words">
                      {new Date(device.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Save / Cancel Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      <Check size={16} /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="schedules" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Schedules</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="proof-of-play" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Proof of Play</span>
            <span className="sm:hidden">Proof</span>
          </TabsTrigger>
          <TabsTrigger value="device-events" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Event Logs</span>
            <span className="sm:hidden">Events</span>
          </TabsTrigger>
          <TabsTrigger value="terminology" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Telemetry</span>
            <span className="sm:hidden">Telemetry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                Device Schedules
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Select
                  value={schedulesLimit.toString()}
                  onValueChange={(value) => {
                    setSchedulesLimit(Number(value));
                    setSchedulesPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  per page
                </span>
              </div>
            </CardHeader>
            <CardContent
              className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
"
            >
              {schedules.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Schedule ID
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Ad Name
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Start Time
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            End Time
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Duration
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules.map((schedule) => (
                          <TableRow key={schedule.schedule_id}>
                            <TableCell className="font-mono text-xs sm:text-sm break-all">
                              {schedule.schedule_id}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm break-words">
                              {schedule.Ad.name}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {new Date(schedule.start_time).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {new Date(schedule.end_time).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {Math.round(
                                (new Date(schedule.end_time).getTime() -
                                  new Date(schedule.start_time).getTime()) /
                                  (1000 * 60),
                              )}{" "}
                              min
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {(schedulesPage - 1) * schedulesLimit + 1} to{" "}
                      {Math.min(schedulesPage * schedulesLimit, schedulesTotal)}{" "}
                      of {schedulesTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchedulesPage(schedulesPage - 1)}
                        disabled={schedulesPage <= 1}
                        className="text-xs sm:text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        Page {schedulesPage} of {schedulesTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchedulesPage(schedulesPage + 1)}
                        disabled={schedulesPage >= schedulesTotalPages}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No schedules found for this device
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof-of-play" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                Proof of Play Log
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Dialog
                  open={exportDialogOpen}
                  onOpenChange={setExportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Export Proof of Play Data</DialogTitle>
                      <div className="text-sm text-muted-foreground mt-2">
                        Exporting data for:{" "}
                        <span className="font-medium text-foreground">
                          {device?.device_name || "Unknown Device"}
                        </span>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="filter">Export Filter</Label>
                        <Select
                          value={exportFilter}
                          onValueChange={setExportFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today's Data</SelectItem>
                            <SelectItem value="yesterday">
                              Yesterday's Data
                            </SelectItem>
                            <SelectItem value="full">
                              All Historical Data
                            </SelectItem>
                            <SelectItem value="date_range">
                              Custom Date Range
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {exportFilter === "date_range" && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium">
                            Date Range Selection
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="start_date">Start Date</Label>
                              <Input
                                id="start_date"
                                type="date"
                                value={exportStartDate}
                                onChange={(e) =>
                                  setExportStartDate(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end_date">End Date</Label>
                              <Input
                                id="end_date"
                                type="date"
                                value={exportEndDate}
                                onChange={(e) =>
                                  setExportEndDate(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExportDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleExport}
                        disabled={
                          isExporting ||
                          (exportFilter === "date_range" &&
                            (!exportStartDate || !exportEndDate))
                        }
                      >
                        {isExporting ? "Exporting..." : "Export"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Select
                  value={proofOfPlayLimit.toString()}
                  onValueChange={(value) => {
                    setProofOfPlayLimit(Number(value));
                    setProofOfPlayPage(1); // Reset to first page when changing limit
                  }}
                >
                  <SelectTrigger className="w-full sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  per page
                </span>
              </div>
            </CardHeader>
            <CardContent
              className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
"
            >
              {proofOfPlayLogs.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Ad ID
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Event ID
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Duration
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Start Time
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            End Time
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Schedule ID
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proofOfPlayLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium text-xs sm:text-sm break-all">
                              {log.ad_id}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-muted-foreground break-all">
                              {log.event_id}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {(log.duration_played_ms / 1000).toFixed(1)}s
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {new Date(log.start_time).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {new Date(log.end_time).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm break-all">
                              {log.schedule_id || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {(proofOfPlayPage - 1) * proofOfPlayLimit + 1} to{" "}
                      {Math.min(
                        proofOfPlayPage * proofOfPlayLimit,
                        proofOfPlayTotal,
                      )}{" "}
                      of {proofOfPlayTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProofOfPlayPage(proofOfPlayPage - 1)}
                        disabled={proofOfPlayPage <= 1}
                        className="text-xs sm:text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        Page {proofOfPlayPage} of {proofOfPlayTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProofOfPlayPage(proofOfPlayPage + 1)}
                        disabled={proofOfPlayPage >= proofOfPlayTotalPages}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No proof of play logs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device-events" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                Device Event Log
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Dialog
                  open={eventLogsExportDialogOpen}
                  onOpenChange={setEventLogsExportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Export Event Logs Data</DialogTitle>
                      <div className="text-sm text-muted-foreground mt-2">
                        Exporting data for:{" "}
                        <span className="font-medium text-foreground">
                          {device?.device_name || "Unknown Device"}
                        </span>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventLogsFilter">Export Filter</Label>
                        <Select
                          value={eventLogsExportFilter}
                          onValueChange={setEventLogsExportFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today's Data</SelectItem>
                            <SelectItem value="yesterday">
                              Yesterday's Data
                            </SelectItem>
                            <SelectItem value="full">
                              All Historical Data
                            </SelectItem>
                            <SelectItem value="date_range">
                              Custom Date Range
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {eventLogsExportFilter === "date_range" && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium">
                            Date Range Selection
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="eventLogsStartDate">
                                Start Date
                              </Label>
                              <Input
                                id="eventLogsStartDate"
                                type="date"
                                value={eventLogsExportStartDate}
                                onChange={(e) =>
                                  setEventLogsExportStartDate(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="eventLogsEndDate">End Date</Label>
                              <Input
                                id="eventLogsEndDate"
                                type="date"
                                value={eventLogsExportEndDate}
                                onChange={(e) =>
                                  setEventLogsExportEndDate(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEventLogsExportDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleEventLogsExport}
                        disabled={
                          isEventLogsExporting ||
                          (eventLogsExportFilter === "date_range" &&
                            (!eventLogsExportStartDate ||
                              !eventLogsExportEndDate))
                        }
                      >
                        {isEventLogsExporting ? "Exporting..." : "Export"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Select
                  value={eventLogsLimit.toString()}
                  onValueChange={(value) => {
                    setEventLogsLimit(Number(value));
                    setEventLogsPage(1); // Reset to first page when changing limit
                  }}
                >
                  <SelectTrigger className="w-full sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  per page
                </span>
              </div>
            </CardHeader>
            <CardContent
              className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
"
            >
              {deviceEventLogs.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Event ID</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Payload</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deviceEventLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.event_type}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.event_id}
                            </TableCell>
                            <TableCell>
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                                  {(() => {
                                    try {
                                      // If payload is already an object, stringify it
                                      if (typeof log.payload === "object") {
                                        return JSON.stringify(
                                          log.payload,
                                          null,
                                          2,
                                        );
                                      }
                                      // If payload is a string, try to parse and format it
                                      return JSON.stringify(
                                        JSON.parse(log.payload),
                                        null,
                                        2,
                                      );
                                    } catch {
                                      // If all else fails, convert to string
                                      return typeof log.payload === "string"
                                        ? log.payload
                                        : JSON.stringify(log.payload);
                                    }
                                  })()}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(eventLogsPage - 1) * eventLogsLimit + 1} to{" "}
                      {Math.min(eventLogsPage * eventLogsLimit, eventLogsTotal)}{" "}
                      of {eventLogsTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventLogsPage(eventLogsPage - 1)}
                        disabled={eventLogsPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {eventLogsPage} of {eventLogsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventLogsPage(eventLogsPage + 1)}
                        disabled={eventLogsPage >= eventLogsTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No device event logs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminology" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Device Telemetry</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={terminologyLimit.toString()}
                  onValueChange={(value) => {
                    setTerminologyLimit(Number(value));
                    setTerminologyPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </CardHeader>
            <CardContent
              className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
"
            >
              {deviceTelemetry.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>CPU Usage (%)</TableHead>
                          <TableHead>RAM Free (MB)</TableHead>
                          <TableHead>Storage Free (MB)</TableHead>
                          <TableHead>Network Type</TableHead>
                          <TableHead>App Version</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deviceTelemetry.map((telemetry) => (
                          <TableRow key={telemetry.id}>
                            <TableCell className="font-medium">
                              {new Date(telemetry.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {(telemetry.cpu_usage * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>{telemetry.ram_free_mb}</TableCell>
                            <TableCell>
                              {telemetry.storage_free_mb || "N/A"}
                            </TableCell>
                            <TableCell>
                              {telemetry.network_type || "N/A"}
                            </TableCell>
                            <TableCell>
                              {telemetry.app_version_code || "N/A"}
                            </TableCell>
                            <TableCell>
                              {new Date(telemetry.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(terminologyPage - 1) * terminologyLimit + 1} to{" "}
                      {Math.min(
                        terminologyPage * terminologyLimit,
                        terminologyTotal,
                      )}{" "}
                      of {terminologyTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTerminologyPage(terminologyPage - 1)}
                        disabled={terminologyPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {terminologyPage} of {terminologyTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTerminologyPage(terminologyPage + 1)}
                        disabled={terminologyPage >= terminologyTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No device telemetry found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DevicePage;
