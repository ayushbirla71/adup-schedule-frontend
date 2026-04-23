import { useEffect, useState } from "react";
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { userColumns, User } from "./columns";
import AddUsers from "./components/add";
import { Card, CardContent } from "@/components/ui/card";

function Users() {
  const [data, setData] = useState<User[]>([]);

  const fetchData = async () => {
    const response = await api.get("/user/all");
    setData(response.users);
  };

  // Initial data fetch when the component is mounted
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when a user is added
  const onIsOpenChange = () => {
    fetchData();
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div>
          <p className="text-lg md:text-xl font-semibold">Users</p>
          <p className="text-sm text-muted-foreground">List of all users</p>
        </div>
        <div className="w-full sm:w-auto">
          {/* Pass onIsOpenChange to AddUsers so it can trigger a data refresh */}
          <AddUsers onIsOpenChange={onIsOpenChange} />
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
              columns={userColumns}
              filters={[{ label: "Name", value: "name" }]}
              maxHeight="none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;
