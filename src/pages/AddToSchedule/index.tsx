import React, { useEffect, useState, useCallback } from "react";

// ✅ UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

// ✅ Styles
// import "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// ✅ Data Table & Columns
import { DataTable } from "@/components/data-table";
import { adcolumns, Ad } from "./components/ad-columns";
import {
  devicecolumns,
  DeviceGroup,
  DevicesGroupsResponse,
} from "./components/device-columns";

// ✅ API & Types
import api from "@/api";
import { Device, DevicesResponse } from "../Devices/columns";
// import DateRangePicker from 'react-date-range';
// import { DateRangePicker } from "@/components/ui/date-range-picker";
// import { DateRangePicker } from 'react-date-range';
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleAddPage from "./add/page";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function AddToSchedule() {
  const [dateRange, setDateRange] = useState<Value>([new Date(), new Date()]);
  const [devicesData, setDevicesData] = useState<DeviceGroup[]>([]);
  const [adsData, setAdsData] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [plays, setPlays] = useState("360");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Advanced scheduling states
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]); // Default: Monday to Friday (backend format: 0=Sunday, 6=Saturday)
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: "06:00", end: "10:00" },
    { start: "18:00", end: "22:00" },
  ]);
  const [showAdvancedScheduling, setShowAdvancedScheduling] = useState(false);

  // Helper functions for advanced scheduling
  // Backend expects: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const toggleWeekday = (dayIndex: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort(),
    );
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [...prev, { start: "09:00", end: "17:00" }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    );
  };

  // New state for content type selection
  const [contentType, setContentType] = useState<
    "ad" | "carousel" | "live_content"
  >("ad");
  const [carouselsData, setCarouselsData] = useState<any[]>([]);
  const [liveContentData, setLiveContentData] = useState<any[]>([]);
  const [selectedCarousel, setSelectedCarousel] = useState<any | null>(null);
  const [selectedLiveContent, setSelectedLiveContent] = useState<any | null>(
    null,
  );

  const [isSingleDay, setIsSingleDay] = useState(true);
  const totalDays = isSingleDay
    ? 1
    : startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 0;

  const handleScheduleContent = async () => {
    setLoading(true);
    try {
      const selectedContent =
        contentType === "ad"
          ? selectedAd
          : contentType === "carousel"
            ? selectedCarousel
            : selectedLiveContent;

      if (startDate && endDate && selectedContent && selectedDevices) {
        // Prepare data based on content type
        const data: any = {
          content_type: contentType,
          groups: selectedDevices.map((group) => group.group_id),
          start_time: startDate,
          end_time: endDate,
          total_duration: plays,
          priority: 1,
          weekdays: showAdvancedScheduling
            ? selectedWeekdays
            : [0, 1, 2, 3, 4, 5, 6], // All days if not advanced (0=Sunday, 6=Saturday)
          time_slots: showAdvancedScheduling
            ? timeSlots
            : [{ start: "00:00", end: "23:59" }], // All day if not advanced
        };

        // Add the appropriate content ID based on type
        if (contentType === "ad") {
          data.ad_id = selectedAd?.ad_id;
        } else if (contentType === "carousel") {
          data.content_id = selectedCarousel?.carousel_id;
        } else if (contentType === "live_content") {
          data.content_id = selectedLiveContent?.live_content_id;
        }

        console.log("Scheduling data:", data);
        await api.post("/schedule/add_v2", data);
        navigate("/schedule");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // const totalDays =
  //   startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0; // Include start date

  // ✅ Fetch Ads Data
  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        const response = await api.get("/ads/all");
        setAdsData(response.data?.ads || (response as any).ads || []);
        console.log("-----", response.data?.ads || (response as any).ads);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    const fetchCarouselsData = async () => {
      try {
        const response = await api.get("/carousel/all");
        setCarouselsData(response.data || []);
        console.log("Carousels:", response.data);
      } catch (error) {
        console.error("Error fetching carousel:", error);
      }
    };

    const fetchLiveContentData = async () => {
      try {
        const response = await api.get("/live-content/all");
        setLiveContentData(response.data || []);
        console.log("Live content:", response.data);
      } catch (error) {
        console.error("Error fetching live content:", error);
      }
    };

    const fetchDevicesData = async () => {
      try {
        const response = await api.get<DevicesGroupsResponse>(
          "/device/fetch-groups",
        );
        setDevicesData(response.groups);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchAdsData();
    fetchCarouselsData();
    fetchLiveContentData();
    fetchDevicesData();

    console.log(adsData);
  }, []);
  useEffect(() => {
    console.log(adsData);
  }, [adsData]);

  // ✅ Stable event handlers
  const handleSelectedAd = useCallback((rows: Ad[]) => {
    setSelectedAd(rows[0] || null);
  }, []);

  const handleSelectedDevices = useCallback((rows: Device[]) => {
    setSelectedDevices(rows);
  }, []);

  const MyDateRangePicker = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isSingleDay,
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={startDate ? startDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setStartDate(date);
              if (isSingleDay) setEndDate(date); // If single-day mode, endDate = startDate
            }}
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
          />
        </div>

        {!isSingleDay && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate ? endDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setEndDate(e.target.value ? new Date(e.target.value) : null)
              }
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
        Content Scheduling
      </h1>

      {/* Content Type Selection */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Content Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={contentType}
            onValueChange={(value: "ad" | "carousel" | "live_content") => {
              setContentType(value);
              // Reset selections when changing content type
              setSelectedAd(null);
              setSelectedCarousel(null);
              setSelectedLiveContent(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ad">Advertisements</SelectItem>
              <SelectItem value="carousel">Carousels</SelectItem>
              <SelectItem value="live_content">Live Content</SelectItem>
              <SelectItem value="screen_layouts">Screen Layouts</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {contentType !== "screen_layouts" && (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 w-full">
          {/* ✅ Select Content */}
          <Card className="w-full min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Select{" "}
                {contentType === "ad"
                  ? "Ad"
                  : contentType === "carousel"
                    ? "Carousel"
                    : "Live Content"}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              <div className="relative">
                {/* Mobile scroll hint */}
                <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
                  Scroll →
                </div>

                {contentType === "ad" && (
                  <DataTable
                    data={adsData}
                    columns={adcolumns}
                    filters={[{ label: "Ad Name", value: "name" }]}
                    onRowSelectionChange={handleSelectedAd}
                    maxHeight="40vh"
                    getRowCanSelect={(row) => {
                      const ad = row as Ad;
                      return (
                        ad.status !== "pending" && ad.status !== "processing"
                      );
                    }}
                  />
                )}

                {contentType === "carousel" && (
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {carouselsData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No carousel available
                      </p>
                    ) : (
                      carouselsData.map((carousel) => (
                        <div
                          key={carousel.carousel_id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedCarousel?.carousel_id ===
                            carousel.carousel_id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedCarousel(carousel)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{carousel.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {carousel.items?.length || 0} items
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {carousel.status === "active"
                                ? "Active"
                                : "Inactive"}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {contentType === "live_content" && (
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {liveContentData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No live content available
                      </p>
                    ) : (
                      liveContentData.map((content) => (
                        <div
                          key={content.live_content_id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedLiveContent?.live_content_id ===
                            content.live_content_id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedLiveContent(content)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{content.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {content.content_type} •{" "}
                                {content.duration === 0
                                  ? "Indefinite"
                                  : `${content.duration}s`}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {content.channel && (
                                <Badge
                                  variant={
                                    content.channel.status === "live"
                                      ? "default"
                                      : content.channel.status === "idle"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  Channel: {content.channel.status}
                                </Badge>
                              )}

                              <Badge
                                variant={
                                  content.status === "active"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {content.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ✅ Select Device */}
          <Card className="w-full min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Select Group
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              <div className="relative">
                {/* Mobile scroll hint */}
                <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
                  Scroll →
                </div>
                <DataTable
                  data={devicesData}
                  columns={devicecolumns}
                  filters={[{ label: "Name", value: "name" }]}
                  onRowSelectionChange={handleSelectedDevices}
                  maxHeight="40vh"
                />
              </div>
            </CardContent>
          </Card>
          {/* </div> */}

          {/* ✅ Date Range Picker */}
          <Card className="lg:col-span-2">
            <CardHeader className="space-y-4">
              <CardTitle className="text-base md:text-lg">
                Schedule Configuration
              </CardTitle>

              {/* Mobile: Stacked Layout, Desktop: Horizontal Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                {/* Date Selection Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Select Date</span>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isSingleDay}
                          onChange={(e) => {
                            setIsSingleDay(e.target.checked);
                            if (e.target.checked && startDate)
                              setEndDate(startDate);
                          }}
                          className="rounded"
                        />
                        <span>Single Day</span>
                      </label>
                    </div>
                  </div>

                  <MyDateRangePicker
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    isSingleDay={isSingleDay}
                  />
                </div>

                {/* Plays Selection Section */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    No. of Plays per Day
                  </span>
                  <Select onValueChange={setPlays} defaultValue="360">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="No. of Plays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Plays</SelectLabel>
                        <SelectItem value="360">360</SelectItem>
                        <SelectItem value="720">720</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Scheduling Card */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="advanced-scheduling"
                            checked={showAdvancedScheduling}
                            onCheckedChange={(checked) =>
                              setShowAdvancedScheduling(!!checked)
                            }
                          />
                          <Label
                            htmlFor="advanced-scheduling"
                            className="text-sm font-medium"
                          >
                            Advanced Scheduling
                          </Label>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure specific days and time slots for content
                        playback
                      </p>
                    </div>
                  </CardHeader>

                  {showAdvancedScheduling && (
                    <CardContent className="space-y-6">
                      {/* Weekdays Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Weekdays
                          </Label>
                          <div className="text-xs text-muted-foreground">
                            {selectedWeekdays.length} day
                            {selectedWeekdays.length !== 1 ? "s" : ""} selected
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                          {weekdayNames.map((day, index) => {
                            const dayIndex = index; // Use 0-6 format (0=Sunday, 6=Saturday)
                            const isSelected =
                              selectedWeekdays.includes(dayIndex);
                            return (
                              <Button
                                key={day}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleWeekday(dayIndex)}
                                className={`h-8 sm:h-10 text-xs font-medium min-w-0 px-1 sm:px-3 ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <span className="hidden sm:inline">
                                  {day.slice(0, 3)}
                                </span>
                                <span className="sm:hidden">
                                  {day.slice(0, 1)}
                                </span>
                              </Button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWeekdays([1, 2, 3, 4, 5])}
                            className="h-7 sm:h-8 text-xs px-2 sm:px-3 flex-1 sm:flex-none min-w-0"
                          >
                            Weekdays
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWeekdays([0, 6])}
                            className="h-7 sm:h-8 text-xs px-2 sm:px-3 flex-1 sm:flex-none min-w-0"
                          >
                            Weekends
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedWeekdays([0, 1, 2, 3, 4, 5, 6])
                            }
                            className="h-7 sm:h-8 text-xs px-2 sm:px-3 flex-1 sm:flex-none min-w-0"
                          >
                            All Days
                          </Button>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Time Slots
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTimeSlot}
                            className="h-8 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Slot
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="border rounded-lg bg-muted/30"
                            >
                              {/* Mobile Layout */}
                              <div className="sm:hidden p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    Slot {index + 1}
                                  </Badge>
                                  {timeSlots.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTimeSlot(index)}
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      Start Time
                                    </Label>
                                    <Input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          index,
                                          "start",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full h-9"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      End Time
                                    </Label>
                                    <Input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          index,
                                          "end",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full h-9"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Desktop Layout */}
                              <div className="hidden sm:flex items-center gap-3 p-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      Start
                                    </Label>
                                    <Input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          index,
                                          "start",
                                          e.target.value,
                                        )
                                      }
                                      className="w-28 h-8"
                                    />
                                  </div>
                                  <div className="flex items-center justify-center pt-5">
                                    <span className="text-sm text-muted-foreground">
                                      →
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      End
                                    </Label>
                                    <Input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          index,
                                          "end",
                                          e.target.value,
                                        )
                                      }
                                      className="w-28 h-8"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Slot {index + 1}
                                  </Badge>
                                  {timeSlots.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTimeSlot(index)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTimeSlots([{ start: "09:00", end: "17:00" }])
                            }
                            className="h-8 text-xs justify-center"
                          >
                            Business Hours
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTimeSlots([
                                { start: "06:00", end: "10:00" },
                                { start: "18:00", end: "22:00" },
                              ])
                            }
                            className="h-8 text-xs justify-center"
                          >
                            Peak Hours
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTimeSlots([{ start: "00:00", end: "23:59" }])
                            }
                            className="h-8 text-xs justify-center"
                          >
                            All Day
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Schedule Button */}
                <div className="flex justify-end lg:justify-start">
                  <Button
                    size="lg"
                    onClick={handleScheduleContent}
                    disabled={
                      selectedDevices.length < 1 ||
                      (contentType === "ad" && !selectedAd) ||
                      (contentType === "carousel" && !selectedCarousel) ||
                      (contentType === "live_content" &&
                        !selectedLiveContent) ||
                      !startDate ||
                      !endDate
                    }
                    className="w-full sm:w-auto"
                  >
                    Schedule{" "}
                    {contentType === "ad"
                      ? "Ad"
                      : contentType === "carousel"
                        ? "Carousel"
                        : "Live Content"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Schedule Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {(contentType === "ad" && selectedAd) ||
                  (contentType === "carousel" && selectedCarousel) ||
                  (contentType === "live_content" && selectedLiveContent) ? (
                    <span>
                      <span className="font-semibold text-foreground">
                        {contentType === "ad"
                          ? selectedAd?.name
                          : contentType === "carousel"
                            ? selectedCarousel?.name
                            : selectedLiveContent?.name}
                      </span>{" "}
                      (
                      {contentType === "ad"
                        ? "Ad"
                        : contentType === "carousel"
                          ? "Carousel"
                          : "Live Content"}
                      ) will be scheduled for{" "}
                      <span className="font-semibold text-foreground">
                        {plays}
                      </span>{" "}
                      plays per day on{" "}
                      <span className="font-semibold text-foreground">
                        {selectedDevices.length}
                      </span>{" "}
                      group{selectedDevices.length !== 1 ? "s" : ""} for{" "}
                      <span className="font-semibold text-foreground">
                        {totalDays}
                      </span>{" "}
                      {totalDays === 1 ? "day" : "days"}
                      {showAdvancedScheduling && (
                        <>
                          {" "}
                          on{" "}
                          <span className="font-semibold text-foreground">
                            {selectedWeekdays
                              .map((d) => weekdayNames[d].slice(0, 3))
                              .join(", ")}
                          </span>{" "}
                          during{" "}
                          <span className="font-semibold text-foreground">
                            {timeSlots
                              .map((slot) => `${slot.start}-${slot.end}`)
                              .join(", ")}
                          </span>
                        </>
                      )}
                      .
                    </span>
                  ) : (
                    `Please select ${contentType === "ad" ? "an ad" : contentType === "carousel" ? "a carousel" : "live content"}, device group(s), and date range to see the schedule summary.`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {contentType === "screen_layouts" && <ScheduleAddPage />}
    </div>
  );
}

export default AddToSchedule;
