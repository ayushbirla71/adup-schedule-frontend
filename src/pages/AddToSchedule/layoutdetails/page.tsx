"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import { Volume2, VolumeX } from "lucide-react";
import { useParams } from "react-router-dom";

export default function LayoutViewer() {
  const { layout_id } = useParams();
  const [layout, setLayout] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupContents, setGroupContents] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get(`/layout/shedule/get/${layout_id}`);

        console.log("schedule data:", res.data);

        const layoutData =
          res.data?.data?.layout || res.data?.layout || res.data?.data;

        const groupsData = res.data?.data?.groups || res.data?.groups || [];
        const groupContentsData =
          res.data?.data?.group_wise_data || res.data?.group_wise_data || [];

        setLayout(layoutData);
        setGroups(groupsData);
        setGroupContents(groupContentsData);

        // FIXED DEFAULT SELECTION
        if (groupsData.length > 0) {
          const firstGroupId = groupsData[0].group_id;

          const groupData = groupContentsData.find(
            (g: any) => g.group_id === firstGroupId,
          );

          setSelectedGroup(groupData);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchSchedule();
  }, []);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading layout...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen max-w-[350px] md:max-w-full">
      {/* ================== LAYOUT PREVIEW ================== */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Layout Preview</h2>

        <div className="bg-gray-200 p-10 flex justify-center">
          <div
            className="relative bg-gray-900 rounded-lg overflow-hidden"
            style={{
              width: layout.orientation === "landscape" ? 500 : 280,
              height: layout.orientation === "landscape" ? 280 : 500,
            }}
          >
            {layout.zones?.map((zone: any) => (
              <div
                key={zone.zone_id}
                className="absolute flex flex-col items-center justify-center text-white text-center px-2"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  backgroundColor: zone.color || "#333",
                }}
              >
                <span className="font-medium text-sm">{zone.name}</span>
                <span className="text-xs opacity-80">
                  {zone.content_type_allowed === "media"
                    ? "Media Zone"
                    : "Widget Zone"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================== GROUP DROPDOWN ================== */}
      <div className="mt-6 flex flex-col w-1/2">
        <label className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">
          Group
        </label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
          value={selectedGroup?.group_id || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            const groupData = groupContents.find(
              (g: any) => g.group_id === selectedId,
            );
            setSelectedGroup(groupData);
          }}
        >
          {groups.map((group: any) => (
            <option key={group.group_id} value={group.group_id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================== SCHEDULE BAR ================== */}
      {(() => {
        const schedule = selectedGroup?.schedules?.[0];

        return (
          <div className="mt-5 space-y-4">
            {/* Date + Slot Strip */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm">
              <svg
                className="w-3.5 h-3.5 text-gray-400 shrink-0"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M5 1.5v3M11 1.5v3M2 7h12" />
              </svg>
              <span className="font-medium text-gray-700">
                {schedule?.start_time
                  ? new Date(schedule.start_time).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "--"}
              </span>

              <span className="text-gray-300">→</span>

              <span className="font-medium text-gray-700">
                {schedule?.end_time
                  ? new Date(schedule.end_time).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "--"}
              </span>

              <span className="flex-1" />

              {schedule?.time_slots?.[0] && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3.5l2.5 1.5" />
                  </svg>
                  {schedule.time_slots[0].start} – {schedule.time_slots[0].end}
                </span>
              )}
            </div>

            {/* ================== ZONES GRID ================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {layout.zones.map((zone: any) => {
                const zoneData = schedule?.zones?.find(
                  (z: any) => z.zone_id === zone.zone_id,
                );
                const isMuted =
                  schedule?.zone_mute_settings?.[zone.zone_id] ?? false;

                return (
                  <div
                    key={zone.zone_id}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800">
                        {zone.name}
                      </h3>
                      {isMuted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs border border-gray-200">
                          <VolumeX size={11} />
                          muted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs border border-green-100">
                          <Volume2 size={11} />
                          active
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="px-3.5 py-3 space-y-2">
                      {zoneData?.content_items?.length > 0 ? (
                        zoneData.content_items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                {item.content_type}
                              </span>
                              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
                                {item.display_order}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item?.content_data.name}
                            </p>
                            <div className="flex flex-col gap-1 mt-1.5 text-xs text-blue-500">
                              {/* Date Time */}
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3 shrink-0"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <circle cx="8" cy="8" r="6" />
                                  <path d="M8 5v3.5l2 1.2" />
                                </svg>

                                {new Date(item.start_time).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                                {" – "}
                                {new Date(item.end_time).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>

                              {/* Time Slots */}
                              {item.time_slots?.length > 0 && (
                                <div className="text-[11px] text-gray-500 ml-4">
                                  Slots:{" "}
                                  {item.time_slots.map(
                                    (slot: any, i: number) => (
                                      <span key={i}>
                                        {slot.start} - {slot.end}
                                        {i < item.time_slots.length - 1 && ", "}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-center text-gray-300 py-4">
                          No content assigned
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
