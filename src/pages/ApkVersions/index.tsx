// src/pages/ApkVersions.tsx
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table"; // Your existing DataTable component

import api from "@/api"; // Your API client
import { ApkVersion, columns } from "./columns";
import AddApkComponent from "./components/AddApkComponent";
import { Card, CardContent } from "@/components/ui/card";

interface ApkVersionsResponse {
  apk_versions: ApkVersion[]; // Assuming your API returns an object with an array under 'apk_versions'
}

function ApkVersionsPage() {
  const [data, setData] = useState<ApkVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const fetchApkVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: This assumes your API for fetching ALL APK versions is protected
      // and requires admin token, as discussed in the backend section.
      // Adjust '/api/v1/apk_versions' if your route is different.
      const response = await api.get<ApkVersionsResponse>("/apk_versions");
      setData(response.apk_versions); // Adjust based on your actual API response structure
    } catch (err: any) {
      console.error("Failed to fetch APK versions:", err);
      setError(err.message || "Failed to load APK versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApkVersions();
  }, []);

  // Callback to refetch data when an APK is added, edited, or deleted
  const handleDataChange = () => {
    fetchApkVersions();
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div>
          <p className="text-lg md:text-xl font-semibold">APK Versions</p>
          <p className="text-sm text-muted-foreground">
            Manage all Android application package versions.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <AddApkComponent onApkAdded={handleDataChange} />
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading APK versions...</p>
      )}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <Card>
          <CardContent className="p-4 md:p-6">
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
              <DataTable
                data={data}
                columns={columns} // Pass the callback to columns for actions
                filters={[{ label: "Version Name", value: "version_name" }]}
                maxHeight="none"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ApkVersionsPage;
