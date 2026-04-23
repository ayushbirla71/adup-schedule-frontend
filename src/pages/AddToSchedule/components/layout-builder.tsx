"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/pages/AddToSchedule/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  Smartphone,
  Monitor,
  GripVertical,
  Film,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Zone, Layout, ZoneType } from "@/lib/store";

interface LayoutBuilderProps {
  initialLayout?: Layout;
  onSave?: (layout: Layout) => void;
}

const presetLayouts = [
  {
    name: "Full Screen",
    zones: [
      {
        zone_id: "main",
        name: "Main",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: "#3b82f6",
        is_muted: true,
        content_type_allowed: "media" as ZoneType,
      },
    ],
  },
  {
    name: "Main + Sidebar",
    zones: [
      {
        zone_id: "main",
        name: "Main",
        x: 0,
        y: 0,
        width: 70,
        height: 100,
        color: "#3b82f6",
        is_muted: true,
        content_type_allowed: "media" as ZoneType,
      },
      {
        zone_id: "sidebar",
        name: "Sidebar",
        x: 70,
        y: 0,
        width: 30,
        height: 100,
        color: "#22c55e",
        is_muted: true,
        content_type_allowed: "widget" as ZoneType,
      },
    ],
  },
  {
    name: "L-Shape",
    zones: [
      {
        zone_id: "main",
        name: "Main",
        x: 0,
        y: 0,
        width: 70,
        height: 80,
        color: "#3b82f6",
        is_muted: true,
        content_type_allowed: "media" as ZoneType,
      },
      {
        zone_id: "sidebar",
        name: "Sidebar",
        x: 70,
        y: 0,
        width: 30,
        height: 80,
        color: "#22c55e",
        is_muted: true,
        content_type_allowed: "widget" as ZoneType,
      },
      {
        zone_id: "ticker",
        name: "Ticker",
        x: 0,
        y: 80,
        width: 100,
        height: 20,
        color: "#f59e0b",
        is_muted: true,
        content_type_allowed: "widget" as ZoneType,
      },
    ],
  },
  {
    name: "4-Zone Grid",
    zones: [
      {
        zone_id: "tl",
        name: "Top Left",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        color: "#3b82f6",
        is_muted: true,
        content_type_allowed: "media" as ZoneType,
      },
      {
        zone_id: "tr",
        name: "Top Right",
        x: 50,
        y: 0,
        width: 50,
        height: 50,
        color: "#22c55e",
        is_muted: true,
        content_type_allowed: "media" as ZoneType,
      },
      {
        zone_id: "bl",
        name: "Bottom Left",
        x: 0,
        y: 50,
        width: 50,
        height: 50,
        color: "#f59e0b",
        is_muted: true,
        content_type_allowed: "widget" as ZoneType,
      },
      {
        zone_id: "br",
        name: "Bottom Right",
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        color: "#ef4444",
        is_muted: true,
        content_type_allowed: "widget" as ZoneType,
      },
    ],
  },
];

const zoneColors = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function LayoutBuilder({ initialLayout, onSave }: LayoutBuilderProps) {
  const [layoutName, setLayoutName] = useState(initialLayout?.name || "");
  const [resolution, setResolution] = useState(
    initialLayout?.resolution || "1920x1080",
  );
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    initialLayout?.orientation || "landscape",
  );
  // const [zones, setZones] = useState<Zone[]>(
  //   initialLayout?.zones || presetLayouts[2].zones,
  // );
  const [zones, setZones] = useState<Zone[]>(
    // (initialLayout?.zones || presetLayouts[2].zones).map((z, i) => ({
    //   ...z,
    //   z_index: z.z_index ?? i + 1, // ✅ auto fix
    // })),
    (initialLayout?.zones || presetLayouts[2].zones).map((z: any, i) => ({
      ...z,
      z_index: z.z_index ?? i + 1,
    })),
  );
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const addZone = () => {
    const newZone: Zone = {
      zone_id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      color: zoneColors[zones.length % zoneColors.length],
      is_muted: true,
      content_type_allowed: "media",
      z_index: zones.length + 1,
    };
    setZones([...zones, newZone]);
    setSelectedZone(newZone.zone_id);
  };

  const removeZone = (zone_id: string) => {
    setZones(zones.filter((z) => z.zone_id !== zone_id));
    if (selectedZone === zone_id) setSelectedZone(null);
  };

  const updateZone = (zone_id: string, updates: Partial<Zone>) => {
    setZones(
      zones.map((z) => (z.zone_id === zone_id ? { ...z, ...updates } : z)),
    );
  };

  // const applyPreset = (preset: (typeof presetLayouts)[0]) => {
  //   setZones(preset.zones);
  //   setSelectedZone(null);
  // };
  const applyPreset = (preset: (typeof presetLayouts)[0]) => {
    setZones(
      preset.zones.map((z, i) => ({
        ...z,
        z_index: i + 1, // ✅ add this
      })),
    );
    setSelectedZone(null);
  };

  const handleSave = () => {
    if (!layoutName.trim()) return;
    const layout: Layout = {
      layout_id: initialLayout?.layout_id || "",
      client_id: "client-001",
      name: layoutName,
      resolution,
      orientation,
      zones,
      is_active: true,
      created_at: initialLayout?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSave?.(layout);
  };

  const canvasWidth = orientation === "landscape" ? 400 : 225;
  const canvasHeight = orientation === "landscape" ? 225 : 400;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Layout Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Layout Name</Label>
              <Input
                id="name"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
              />
            </div>
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                  <SelectItem value="3840x2160">3840x2160 (4K UHD)</SelectItem>
                  <SelectItem value="1366x768">1366x768 (HD)</SelectItem>
                  <SelectItem value="1280x720">1280x720 (HD Ready)</SelectItem>
                  <SelectItem value="1080x1920">
                    1080x1920 (Portrait Full HD)
                  </SelectItem>
                  <SelectItem value="2160x3840">
                    2160x3840 (Portrait 4K)
                  </SelectItem>
                  <SelectItem value="768x1366">
                    768x1366 (Portrait HD)
                  </SelectItem>
                  <SelectItem value="720x1280">
                    720x1280 (Portrait HD Ready)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orientation */}
          <div>
            <Label>Orientation</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={orientation === "landscape" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation("landscape")}
                className="flex-1"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Landscape
              </Button>
              <Button
                variant={orientation === "portrait" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation("portrait")}
                className="flex-1"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Portrait
              </Button>
            </div>
          </div>

          {/* Presets */}
          <div>
            <Label>Quick Presets</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {presetLayouts.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Zones List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Zones ({zones.length})</Label>
              <Button variant="outline" size="sm" onClick={addZone}>
                <Plus className="w-4 h-4 mr-1" />
                Add Zone
              </Button>
            </div>
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-2 space-y-2">
                {zones.map((zone) => (
                  <div
                    key={zone.zone_id}
                    onClick={() => setSelectedZone(zone.zone_id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors",
                      selectedZone === zone.zone_id &&
                        "bg-muted ring-2 ring-primary",
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="flex-1 text-sm">{zone.name}</span>
                    <Badge
                      variant={
                        zone.content_type_allowed === "media"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {zone.content_type_allowed === "media" ? (
                        <>
                          <Film className="w-3 h-3 mr-1" />
                          Media
                        </>
                      ) : (
                        <>
                          <LayoutGrid className="w-3 h-3 mr-1" />
                          Widget
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {zone.width}x{zone.height}%
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeZone(zone.zone_id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Zone Editor */}
          {selectedZone && (
            <div className="border rounded-md p-3 bg-muted/50">
              <Label className="mb-2 block">
                Edit Zone: {zones.find((z) => z.zone_id === selectedZone)?.name}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={
                      zones.find((z) => z.zone_id === selectedZone)?.name || ""
                    }
                    onChange={(e) =>
                      updateZone(selectedZone, { name: e.target.value })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Zone Type</Label>
                  <Select
                    value={
                      zones.find((z) => z.zone_id === selectedZone)
                        ?.content_type_allowed || "media"
                    }
                    onValueChange={(value: ZoneType) =>
                      updateZone(selectedZone, { content_type_allowed: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          Media (Ads, Carousels, Live)
                        </div>
                      </SelectItem>
                      <SelectItem value="widget">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="w-4 h-4" />
                          Widget (Clock, Weather, etc.)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-1 mt-1">
                    {zoneColors.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-6 h-6 rounded border-2",
                          zones.find((z) => z.zone_id === selectedZone)
                            ?.color === color
                            ? "border-foreground"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => updateZone(selectedZone, { color })}
                      />
                    ))}
                  </div>
                </div>
                <div />
                <div>
                  <Label className="text-xs">X (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      zones.find((z) => z.zone_id === selectedZone)?.x || 0
                    }
                    onChange={(e) =>
                      updateZone(selectedZone, { x: Number(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      zones.find((z) => z.zone_id === selectedZone)?.y || 0
                    }
                    onChange={(e) =>
                      updateZone(selectedZone, { y: Number(e.target.value) })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Width (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={
                      zones.find((z) => z.zone_id === selectedZone)?.width || 0
                    }
                    onChange={(e) =>
                      updateZone(selectedZone, {
                        width: Number(e.target.value),
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={
                      zones.find((z) => z.zone_id === selectedZone)?.height || 0
                    }
                    onChange={(e) =>
                      updateZone(selectedZone, {
                        height: Number(e.target.value),
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full"
            disabled={!layoutName.trim()}
          >
            Save Layout
          </Button>
        </CardContent>
      </Card>

      {/* Right: Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <div
              className="relative bg-black rounded-lg overflow-hidden shadow-lg"
              style={{ width: canvasWidth, height: canvasHeight }}
            >
              {zones.map((zone) => (
                <div
                  key={zone.zone_id}
                  onClick={() => setSelectedZone(zone.zone_id)}
                  className={cn(
                    "absolute flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer transition-all hover:opacity-90",
                    selectedZone === zone.zone_id &&
                      "ring-2 ring-white ring-offset-2 ring-offset-black",
                  )}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                    backgroundColor: zone.color,
                    zIndex: zone.z_index,
                  }}
                >
                  <span className="text-center px-1 truncate">{zone.name}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    {zone.content_type_allowed === "media" ? "Media" : "Widget"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {zones.map((zone) => (
              <Badge
                key={zone.zone_id}
                variant="outline"
                className="cursor-pointer"
                style={{ borderColor: zone.color, color: zone.color }}
                onClick={() => setSelectedZone(zone.zone_id)}
              >
                {zone.name} ({zone.content_type_allowed})
              </Badge>
            ))}
          </div>

          {/* Zone Type Summary */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Zone Summary</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                {
                  zones.filter((z) => z.content_type_allowed === "media").length
                }{" "}
                Media zones
              </span>
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-4 h-4" />
                {
                  zones.filter((z) => z.content_type_allowed === "widget")
                    .length
                }{" "}
                Widget zones
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
