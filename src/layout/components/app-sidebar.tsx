"use client";

import * as React from "react";
import {
  SquareTerminal,
  Bot,
  BookOpen,
  QrCode,
  RotateCcw,
  Video,
  Globe,
  Monitor,
  Play,
  // Add any other icons you use here
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import api from "@/api";

// Maps icon string names from backend to actual React components
const iconMap: Record<string, React.ElementType> = {
  SquareTerminal,
  Bot,
  BookOpen,
  QrCode,
  RotateCcw,
  Video,
  Globe,
  Monitor,
  Play,
  // Add additional icon mappings here as needed
};

interface SidebarData {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  teams: Array<{ name: string; logo: string; plan: string }>;
  navMain: Array<{
    title: string;
    url: string;
    icon: string;
    items: Array<{ title: string; url: string }>;
  }>;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [rawData, setRawData] = React.useState<SidebarData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/user/data");
        setRawData(response);
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert string icon names from backend to actual components and compute isActive
  // const navMain = React.useMemo(() => {
  //   if (!rawData || !Array.isArray(rawData.navMain)) return [];
  //   return rawData.navMain.map((item) => ({
  //     ...item,
  //     isActive: location.pathname.startsWith(item.url),
  //     icon: iconMap[item.icon] || SquareTerminal,
  //   }));
  // }, [rawData, location.pathname]);
  const navMain = React.useMemo(() => {
    if (!rawData || !Array.isArray(rawData.navMain)) return [];

    return rawData.navMain.map((item) => {
      const isParentActive = location.pathname.startsWith(item.url);

      const updatedItems = item.items?.map((sub) => ({
        ...sub,
        isActive: location.pathname === sub.url,
      }));

      return {
        ...item,
        isActive: isParentActive,
        items: updatedItems,
        icon: iconMap[item.icon] || SquareTerminal,
      };
    });
  }, [rawData, location.pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {loading ? (
          <div className="px-4 py-2 font-medium">Loading teams...</div>
        ) : rawData?.teams ? (
          <TeamSwitcher teams={rawData.teams} />
        ) : (
          <div className="px-4 py-2 text-destructive">No teams found</div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {loading ? (
          <div className="px-4 text-muted-foreground">Loading menu...</div>
        ) : navMain.length > 0 ? (
          <NavMain items={navMain} />
        ) : (
          <div className="px-4 py-2 text-destructive">No menu items</div>
        )}
      </SidebarContent>

      <SidebarFooter>
        {loading ? (
          <div className="px-4 py-2">Loading user...</div>
        ) : rawData?.user ? (
          <NavUser user={rawData.user} />
        ) : (
          <div className="px-4 py-2 text-destructive">No user data</div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
