"use client";

import { useState, useEffect } from "react";

import { LayoutBuilder } from "@/pages/AddToSchedule/components/layout-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/pages/AddToSchedule/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Layout,
  Code,
  Film,
  LayoutGrid,
} from "lucide-react";

import {
  getLayouts,
  saveLayout,
  deleteLayout,
  type Layout as LayoutType,
} from "@/lib/store";
import { toast } from "sonner";
import api from "@/api";

export default function ScreenLayoutPage() {
  const [layouts, setLayouts] = useState<LayoutType[]>([]);
  const [editingLayout, setEditingLayout] = useState<LayoutType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // useEffect(async() => {
  //   setLayouts(await getLayouts());
  // }, []);
  useEffect(() => {
    const fetchLayouts = async () => {
      const data = await getLayouts();
      console.log("data", data);
      setLayouts(data);
    };

    fetchLayouts();
  }, []);

  const handleSaveLayout = async (layout: LayoutType) => {
    saveLayout(layout);
    setLayouts(await getLayouts());
    setEditingLayout(null);
    setIsCreating(false);

    console.log("layout", layout);

    // toast({
    //   title: "Layout Saved",
    //   description: `Layout "${layout.name}" has been saved successfully.`,
    // })
    // toast.success(`Layout "${layout.name}" has been saved successfully.`);
  };

  const handleDeleteLayout = async (layoutId: string) => {
    deleteLayout(layoutId);
    setLayouts(await getLayouts());
    // toast({
    //   title: "Layout Deleted",
    //   description: "The layout has been deleted.",
    // })
    // toast.success("The layout has been deleted.");
  };

  const currentLayout =
    editingLayout || (isCreating ? null : layouts[0] || null);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            <h1 className="text-2xl font-semibold">Screen Layout</h1>
          </div>
          <Button
            onClick={() => {
              setIsCreating(true);
              setEditingLayout(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Layout
          </Button>
        </div>

        {/* Builder or Table */}
        {isCreating || editingLayout ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingLayout(null);
                }}
              >
                Back to List
              </Button>
              <span className="text-muted-foreground">
                {editingLayout
                  ? `Editing: ${editingLayout.name}`
                  : "Creating New Layout"}
              </span>
            </div>
            <LayoutBuilder
              initialLayout={editingLayout || undefined}
              onSave={handleSaveLayout}
            />
          </div>
        ) : (
          <>
            {/* Saved Layouts Table */}
            {layouts.length > 0 ? (
              <div className="rounded-md border bg-white mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Resolution</TableHead>
                      <TableHead>Orientation</TableHead>
                      <TableHead>Zones</TableHead>
                      <TableHead>Zone Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layouts.map((layout) => {
                      const mediaZones = layout.zones.filter(
                        (z) => z.content_type_allowed === "media",
                      ).length;
                      const widgetZones = layout.zones.filter(
                        (z) => z.content_type_allowed === "widget",
                      ).length;

                      return (
                        <TableRow key={layout.layout_id}>
                          <TableCell className="font-medium">
                            {layout.name}
                          </TableCell>
                          <TableCell>{layout.resolution}</TableCell>
                          <TableCell className="capitalize">
                            {layout.orientation}
                          </TableCell>
                          <TableCell>{layout.zones.length} zones</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {mediaZones > 0 && (
                                <Badge variant="default" className="text-xs">
                                  <Film className="w-3 h-3 mr-1" />
                                  {mediaZones} Media
                                </Badge>
                              )}
                              {widgetZones > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <LayoutGrid className="w-3 h-3 mr-1" />
                                  {widgetZones} Widget
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                layout.is_active ? "default" : "secondary"
                              }
                            >
                              {layout.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setEditingLayout(layout)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteLayout(layout.layout_id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md mb-6 bg-white">
                <Layout className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Layouts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first screen layout to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Layout
                </Button>
              </div>
            )}

            {/* JSON Console */}
            {currentLayout && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Layout JSON Structure
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJson(!showJson)}
                  >
                    {showJson ? "Hide" : "Show"} JSON
                  </Button>
                </CardHeader>
                {showJson && (
                  <CardContent>
                    <ScrollArea className="h-80">
                      <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
                        {JSON.stringify(currentLayout, null, 2)}
                      </pre>
                    </ScrollArea>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(currentLayout, null, 2),
                          );
                          // toast({ title: "Copied", description: "JSON copied to clipboard" })
                          toast.success("JSON copied to clipboard");
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
