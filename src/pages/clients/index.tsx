import api from "@/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BadgeDollarSign,
  Layers,
  Pencil,
  Plus,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipArrow,
} from "@radix-ui/react-tooltip";

interface Client {
  client_id: string;
  name: string;
  email: string;
  phoneNumber: number;
  adsCount: number;
  used_storage_bytes: number;
  Tier?: Tier;
}

interface Tier {
  tier_id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  storage_limit_bytes: string; // ← string from API
  max_devices: number;
  max_ads: number;
  is_active: boolean;
}

interface ClientsResponse {
  clients: Client[];
}

interface ClientInput {
  name: string;
  email: string;
  phoneNumber: number;
}

function Clients() {
  const [data, setData] = useState<Client[]>([]);
  const [client, setClient] = useState<ClientInput>({
    name: "",
    email: "",
    phoneNumber: 0,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    tier_name: "",
  });

  const [tiers, setTiers] = useState<Tier[]>([]);
  const fetchTiers = async () => {
    try {
      const response = await api.get("/tiers");
      setTiers(response);
    } catch (error) {
      console.error("Failed to fetch tiers", error);
    }
  };

  const fetchDta = async () => {
    const response = await api.get<ClientsResponse>("/ads/clients");
    setData(response?.clients);
  };

  useEffect(() => {
    fetchDta();
    fetchTiers();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const { name, email, phoneNumber } = client;

    // Email validation (basic format check)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Phone number validation (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.toString())) {
      alert("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    if (!name || !email || !phoneNumber) {
      alert("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/ads/create-client", client);
      fetchDta();
      setLoading(false);
      setOpen(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.message);
      console.error("error", error);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);

    setEditForm({
      name: client.name,
      email: client.email,
      phoneNumber: client.phone_number.toString(),
      tier_name: client?.Tier?.name || "",
    });

    setEditOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      await api.put(`/update-client/${selectedClient.client_id}`, {
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        tier_name: editForm.tier_name,
      });

      fetchDta();
      setEditOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + " GB";
    }
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + " MB";
    }
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    }
    return bytes + " Bytes";
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Clients</p>
          <p className="text-sm text-muted-foreground">List of all clients</p>
        </div>

        <div className="w-full sm:w-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <span className="hidden sm:inline">Create Client</span>
                <span className="sm:hidden">Create</span>
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent
              // className="
              //   max-w-[350px]
              //   md:max-w-[calc(100vw-20rem)]
              //   relative
              // "
              className="sm:max-w-md"
            >
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  Create Client
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={client?.name}
                    onChange={(e) =>
                      setClient({ ...client, name: e.target.value })
                    }
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={client?.email}
                    onChange={(e) =>
                      setClient({ ...client, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="number"
                    value={client?.phoneNumber}
                    onChange={(e) =>
                      setClient({
                        ...client,
                        phoneNumber: parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2" />
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* {data.map((client, index) => (
          <Card key={index} className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {client.name}
              </CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.adsCount}</div>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </CardContent>
          </Card>
        ))} */}
        {data.map((client, index) => {
          const usedBytes = Number(client.used_storage_bytes || 0);
          const limitBytes = Number(client?.Tier?.storage_limit_bytes || 0);

          const usedGB = (usedBytes / 1073741824).toFixed(2);
          const totalGB = (limitBytes / 1073741824).toFixed(2);
          const remainingGB = ((limitBytes - usedBytes) / 1073741824).toFixed(
            2,
          );

          // const usagePercent =
          //   limitBytes > 0 ? ((usedBytes / limitBytes) * 100).toFixed(1) : 0;

          // const usagePercent =
          //   limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;

          const usagePercentRaw =
            limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
          const usagePercent = Math.min(usagePercentRaw, 100);
          const remainingPercent = 100 - usagePercent;

          let barColor = "bg-blue-500";
          let borderColor = "";
          let errorMessage = "";

          if (usagePercentRaw >= 100) {
            barColor = "bg-red-500";
            borderColor = "border border-red-500";
            errorMessage = "Storage limit exceeded";
          } else if (remainingPercent <= 5) {
            barColor = "bg-red-500";
            borderColor = "border border-red-500";
            errorMessage = "Storage almost full";
          } else if (usagePercent >= 75) {
            barColor = "bg-orange-500";
          }

          return (
            <Card
              key={index}
              className={`col-span-1 bg-gray-100 ${borderColor}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {client.name}
                </CardTitle>
                <div className="flex items-center gap-2 cursor-pointer">
                  {/* <BadgeDollarSign className="h-4 w-4 text-muted-foreground" /> */}

                  <Layers className="h-4 w-4  text-muted-foreground" />

                  <Pencil
                    onClick={() => handleEditClient(client)}
                    className="h-4 w-4 ml-2"
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {/* Plan Name */}
                <p className="text-sm font-semibold">
                  Plan: {client?.Tier?.name || "No Plan"}
                </p>

                {/* Ads Count */}
                <div className="text-xl font-bold">{client.adsCount}</div>
                <p className="text-xs text-muted-foreground">Total Ads</p>

                {limitBytes > 0 && (
                  <TooltipProvider>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 flex overflow-hidden">
                      {/* Used */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`${barColor} h-2 cursor-pointer transition-all`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </TooltipTrigger>

                        <TooltipContent
                          side="top"
                          className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg"
                        >
                          Used: {formatBytes(usedBytes)}
                          <TooltipArrow className="fill-neutral-900" />
                        </TooltipContent>
                      </Tooltip>

                      {/* Remaining */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="bg-gray-200 h-2 cursor-pointer"
                            style={{ width: `${100 - usagePercent}%` }}
                          />
                        </TooltipTrigger>

                        <TooltipContent
                          side="top"
                          className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg"
                        >
                          Remaining: {formatBytes(limitBytes - usedBytes)}
                          <TooltipArrow className="fill-neutral-900" />
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}

                <div className="space-y-1 flex align-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {usagePercent.toFixed(1)}% Storage Used
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: {totalGB} GB
                  </p>
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> {errorMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                disabled
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phoneNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, phoneNumber: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tier</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={editForm.tier_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, tier_name: e.target.value })
                }
              >
                <option value="">Select Tier</option>

                {tiers
                  ?.filter((tier) => tier.is_active)
                  ?.map((tier) => {
                    const storageGB = (
                      Number(tier.storage_limit_bytes) / 1073741824
                    ).toFixed(0);

                    return (
                      <option key={tier.tier_id} value={tier.name}>
                        {tier.name} — {storageGB}GB — ₹{tier.price} /{" "}
                        {tier.billing_cycle} — {tier.max_ads} Ads
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Clients;
