import api from "@/api";
import { useEffect, useState } from "react";
import { AlertTriangle, Layers, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExportJob {
  job_id: string;
  job_type: string;
  client_id: string;
  device_id: string | null;
  ad_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  progress_percent: number;
  error_message: string | null;
  download_url: string | null;
  created_at: string;
}

function ExportDetails() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExports = async () => {
    try {
      const response = await api.get("/exports");

      const sorted = response.sort(
        (a: ExportJob, b: ExportJob) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setExports(sorted);
    } catch (error) {
      console.error("Failed to fetch exports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();

    const interval = setInterval(fetchExports, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading exports...
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <p className="text-lg md:text-xl font-semibold">Exports</p>
        <p className="text-sm text-muted-foreground">List of export jobs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((job, index) => {
          const progress = job.progress_percent || 0;

          let barColor = "bg-blue-500";
          let borderColor = "";
          let message = "";

          if (job.status === "FAILED") {
            barColor = "bg-red-500";
            borderColor = "border border-red-500";
            message = job.error_message || "Export failed";
          }

          if (job.status === "QUEUED") {
            barColor = "bg-yellow-500";
          }

          if (job.status === "COMPLETED") {
            barColor = "bg-green-500";
          }

          return (
            <Card
              key={index}
              className={`col-span-1 bg-gray-100 ${borderColor}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {job.job_type}
                </CardTitle>

                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm font-semibold">
                  Job ID: {job.job_id.slice(0, 8)}...
                </p>

                <p className="text-xs text-muted-foreground">
                  Status: {job.status}
                </p>

                <p className="text-xs text-muted-foreground">
                  Device: {job.device_id || "All Devices"}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${barColor} h-2 transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <p>{progress}% Completed</p>

                  <p>
                    {new Date(job.start_date).toLocaleDateString()} -{" "}
                    {new Date(job.end_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Download Button */}
                {progress === 100 && job.download_url && (
                  <Button
                    className="w-full"
                    onClick={() => handleDownload(job.download_url!)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Ready to Download
                  </Button>
                )}

                {message && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {message}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ExportDetails;
