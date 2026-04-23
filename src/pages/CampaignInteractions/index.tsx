import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import {
  CampaignInteraction,
  CampaignInteractionResponse,
  columns,
  filters,
} from "./columns";
import { Card, CardContent } from "@/components/ui/card";

function CampaignInteractions() {
  const [data, setData] = useState<CampaignInteraction[]>([]);
  const fetchDta = async () => {
    const response = await api.get<CampaignInteractionResponse>(
      "/campaign/interactions",
    );
    setData(response.interactions);
  };
  useEffect(() => {
    fetchDta();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">
            Campaign Interactions
          </p>
          <p className="text-sm text-muted-foreground">
            List of all campaign interactions
          </p>
        </div>
      </div>

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
              columns={columns}
              filters={filters}
              maxHeight="none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignInteractions;
