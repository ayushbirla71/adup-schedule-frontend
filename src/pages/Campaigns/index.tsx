import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import CampaignList from "./campaign-list";

export default function CampaignsPage() {
  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <h1 className="text-lg md:text-xl font-semibold">Campaigns</h1>
        <Link to="/campaigns/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add New Campaign</span>
            <span className="sm:hidden">Add Campaign</span>
          </Button>
        </Link>
      </div>
      <div className="w-full overflow-hidden">
        <CampaignList />
      </div>
    </div>
  );
}
