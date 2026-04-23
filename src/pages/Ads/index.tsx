import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Ad, AdsResponse, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";

import AddAdComponent from "./components/AddAds";
import { useNavigate } from "react-router-dom";

function Ads() {
  const [data, setData] = useState<Ad[]>([]);

  const navigate = useNavigate();
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState("today");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  // const [selectedAdIds, setSelectedAdIds] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const fetchDta = async () => {
    const response = await api.get<AdsResponse>("/ads/all");
    setData((response as any).ads);
    console.log(typeof (response as any).ads);
  };

  useEffect(() => {
    fetchDta();
  }, []);

  function onIsOpenChange() {
    fetchDta();
  }

  // Handle export functionality
  // const handleExport = async () => {
  //   try {
  //     setIsExporting(true);

  //     let url = `/ads/proof-of-play/export`;
  //     const params = new URLSearchParams();

  //     // Add ad_id parameter
  //     // params.append("ad_id", selectedAdIds);
  //     params.append("ad_id", selectedAdId ?? "all");

  //     // Handle different filter types
  //     if (
  //       exportFilter === "today" ||
  //       exportFilter === "yesterday" ||
  //       exportFilter === "week" ||
  //       exportFilter === "month" ||
  //       exportFilter === "year" ||
  //       exportFilter === "all"
  //     ) {
  //       params.append("filter", exportFilter);
  //     } else if (exportFilter === "date_range") {
  //       if (exportStartDate) params.append("start_date", exportStartDate);
  //       if (exportEndDate) params.append("end_date", exportEndDate);
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

  //     // Generate filename based on filter and ad selection
  //     let filename = "ads-proof-of-play";
  //     if (exportFilter === "today") filename += "-today";
  //     else if (exportFilter === "yesterday") filename += "-yesterday";
  //     else if (exportFilter === "week") filename += "-week";
  //     else if (exportFilter === "month") filename += "-month";
  //     else if (exportFilter === "year") filename += "-year";
  //     else if (exportFilter === "all") filename += "-all";
  //     else if (exportFilter === "date_range")
  //       filename += `-${exportStartDate}-to-${exportEndDate}`;

  //     // if (selectedAdIds === "all") {
  //     //   filename += "-all-ads";
  //     // } else if (selectedAdIds.includes(",")) {
  //     //   filename += "-multiple-ads";
  //     // } else {
  //     //   filename += `-${selectedAdIds}`;
  //     // }

  //     if (!selectedAdId) {
  //       filename += "-all-ads";
  //     } else {
  //       filename += `-${selectedAdId}`;
  //     }

  //     const currentDate = new Date().toISOString().split("T")[0];
  //     filename += `-${currentDate}.xlsx`;

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
  //     // setSelectedAdIds("all");
  //     setSelectedAdId(null);

  //     toast.success("Ads proof of play exported successfully!");
  //     console.log("✅ Ads proof of play exported successfully");
  //   } catch (error: any) {
  //     console.error("Ads proof of play export failed:", error);

  //     // Handle specific error messages
  //     let errorMessage = "Ads proof of play export failed. Please try again.";

  //     if (error?.response?.data?.message) {
  //       const apiMessage = error.response.data.message;
  //       if (
  //         apiMessage === "No proof of play logs found for the specified ads"
  //       ) {
  //         errorMessage =
  //           "No proof of play data found for the selected ads and time period. Please try a different date range or ad selection.";
  //       } else {
  //         errorMessage = apiMessage;
  //       }
  //     } else if (error?.message) {
  //       errorMessage = error.message;
  //     }

  //     toast.error(errorMessage);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // ---------- Calculate dates ----------
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

      if (exportFilter === "week") {
        const start = new Date();
        start.setDate(today.getDate() - 7);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "month") {
        const start = new Date();
        start.setMonth(today.getMonth() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "year") {
        const start = new Date();
        start.setFullYear(today.getFullYear() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "all") {
        startDate = "2025-03-01";
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "date_range") {
        startDate = exportStartDate;
        endDate = exportEndDate;
      }

      // ---------- Create Export Job ----------
      const payload = {
        job_type: "PROOF_OF_PLAY",
        ad_id: selectedAdId ?? null,
        start_date: startDate,
        end_date: endDate,
      };

      // NEW API
      const response = await api.post("/exports", payload);

      /*
    // OLD API (commented)
    const response = await api.get(url, {
      responseType: "blob",
    });
    */

      toast.success("Export job created successfully!");

      setExportDialogOpen(false);

      // Reset form
      setExportFilter("today");
      setExportStartDate("");
      setExportEndDate("");
      setSelectedAdId(null);
      navigate("/all-exports");
    } catch (error: any) {
      console.error("Export job creation failed:", error);

      let errorMessage = "Export job failed. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Ads</p>
          <p className="text-sm text-muted-foreground">
            List of all ads and files
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Export Button */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export Proof of Play</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  Export Ads Proof of Play Data
                </DialogTitle>
                <div className="text-sm text-muted-foreground mt-2">
                  Export proof of play data for selected ads
                </div>
              </DialogHeader>
              <div className="space-y-4 md:space-y-6 py-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="adSelection">Ad Selection</Label>
                  <Select
                    value={selectedAdIds}
                    onValueChange={setSelectedAdIds}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ads to export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ads</SelectItem>
                      {data.map((ad) => (
                        <SelectItem key={ad.ad_id} value={ad.ad_id}>
                          {ad.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="exportFilter">Export Filter</Label>
                  <Select value={exportFilter} onValueChange={setExportFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today's Data</SelectItem>
                      <SelectItem value="yesterday">
                        Yesterday's Data
                      </SelectItem>
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

                {exportFilter === "date_range" && (
                  <div className="space-y-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium">
                      Date Range Selection
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exportStartDate">Start Date</Label>
                        <Input
                          id="exportStartDate"
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exportEndDate">End Date</Label>
                        <Input
                          id="exportEndDate"
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExportDialogOpen(false)}
                  className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
                >
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AddAdComponent onIsOpenChange={onIsOpenChange} />
        </div>
      </div>

      <Card>
        <CardContent className="sm:p-0 p-4 md:p-6">
          <div
            className="
            max-w-[350px]
            md:max-w-[calc(100vw-20rem)]
            relative
          "
          >
            {/* Mobile scroll hint */}
            <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
              Scroll →
            </div>
            {/* <DataTable
              data={data}
              columns={columns}
              filters={[
                { label: "Ad Name", value: "name" },
                { label: "ad_id", value: "ad_id" },
              ]}
              maxHeight="none"
              getRowCanSelect={(row) => {
                const ad = row as Ad;
                return ad.status !== "pending" && ad.status !== "processing";
              }}
            /> */}

            {selectedAdId && (
              <p className="text-sm text-muted-foreground">
                Selected Ad ID: {selectedAdId}
              </p>
            )}

            <DataTable
              data={data}
              columns={columns}
              filters={[
                { label: "Ad Name", value: "name" },
                { label: "ad_id", value: "ad_id" },
              ]}
              maxHeight="none"
              onRowSelectionChange={(rows) => {
                if (rows.length > 0) {
                  const ad = rows[0] as Ad;
                  setSelectedAdId(ad.ad_id);
                } else {
                  setSelectedAdId(null);
                }
              }}
              getRowCanSelect={(row) => {
                const ad = row as Ad;
                return ad.status !== "pending" && ad.status !== "processing";
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Ads;
