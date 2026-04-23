"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/api";

/* Fix marker icons */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface Device {
  device_id: string;
  device_name: string;
  location: string;
  status: string;
}

export interface DevicesResponse {
  devices: Device[];
}

const center: [number, number] = [22.5937, 78.9629];

/* parse device location safely */
const parseLatLng = (loc?: string): [number, number] | null => {
  if (!loc || loc === "unknown") return null;

  const parts = loc.split(",");
  if (parts.length !== 2) return null;

  const lat = Number(parts[0]);
  const lng = Number(parts[1]);

  if (!isFinite(lat) || !isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  return [lat, lng];
};

export const DashboardMap = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get<DevicesResponse>("/device/all");

        setDevices(res.devices || []);
      } catch (err) {
        console.error("Device API error", err);
      }
    };

    run();
  }, []);

  /* valid device coords */
  const deviceCoords = useMemo(() => {
    return devices
      .map((d) => {
        const coord = parseLatLng(d.location);
        if (!coord) return null;

        return {
          coord,
          name: d.device_name,
          status: d.status,
        };
      })
      .filter(Boolean) as {
      coord: [number, number];
      name: string;
      status: string;
    }[];
  }, [devices]);

  /* group devices by same location */
  const locationGroups = useMemo(() => {
    const map = new Map<
      string,
      { coord: [number, number]; devices: { name: string; status: string }[] }
    >();

    deviceCoords.forEach((d) => {
      const key = `${d.coord[0]},${d.coord[1]}`;

      if (!map.has(key)) {
        map.set(key, {
          coord: d.coord,
          devices: [],
        });
      }

      map.get(key)!.devices.push({
        name: d.name,
        status: d.status,
      });
    });

    return Array.from(map.values());
  }, [deviceCoords]);

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: 420, width: "100%", borderRadius: 16 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locationGroups.map((loc, i) => (
        <Marker key={i} position={loc.coord}>
          <Tooltip
            direction="top"
            offset={[0, -25]}
            opacity={1}
            className="device-tooltip"
          >
            <div className="w-44 rounded-xl overflow-hidden font-sans shadow-lg">
              {/* Status bar */}
              {(() => {
                const anyActive = loc.devices.some(
                  (d) => d.status?.toLowerCase() === "active",
                );
                return (
                  <div
                    className={`flex items-center gap-2 px-2 py-1 ${anyActive ? "bg-green-600" : "bg-slate-500"}`}
                  >
                    {/* Dot with ping animation when active */}
                    <span className="relative flex items-center justify-center w-2.5 h-2.5">
                      {anyActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex w-2 h-2 rounded-full border-2 ${anyActive ? "bg-green-300 border-green-400" : "bg-slate-300 border-slate-400"}`}
                      />
                    </span>

                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {anyActive ? "Active" : "Offline"}
                    </span>
                  </div>
                );
              })()}

              {/* Device rows */}
              <div className="bg-white divide-y divide-slate-100">
                {loc.devices.map((d, idx) => {
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 px-2 py-1"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-800 m-0 truncate">
                          {d.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
      <style>
        {`
              .device-tooltip {
                transform: translateX(-50%);
                left: 50% !important;
              }
              .leaflet-tooltip-top:before {
                left: 45% !important;
                transform: translateX(-45%);
              }
                /* 🔥 Force Leaflet BELOW sidebar */
              .leaflet-container {
                z-index: 0 !important;
              }

              .leaflet-pane,
              .leaflet-top,
              .leaflet-bottom,
              .leaflet-control,
              .leaflet-tooltip,
              .leaflet-popup {
                z-index: 0 !important;
              }
        `}
      </style>
    </MapContainer>
  );
};
