import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, PlusCircle, Trophy, ShieldHalf, User, CalendarDays, Swords, Radio,
  ListChecks, BarChart2, LineChart, Globe, Link2, Image, Handshake, Newspaper, Video,
  Bell, CreditCard, Receipt, TrendingUp, Settings, UserCircle, LifeBuoy, LogOut,
  MapPin, UserCog, Layers,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
}
export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const ORGANIZER_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Create Tournament", to: "/dashboard/tournaments/new", icon: PlusCircle },
      { label: "My Tournaments", to: "/dashboard/tournaments", icon: Trophy },
    ],
  },
  {
    title: "Competition",
    items: [
      { label: "Teams", to: "/dashboard/teams", icon: ShieldHalf },
      { label: "Players", to: "/dashboard/players", icon: User },
      { label: "Groups", to: "/dashboard/groups", icon: Layers },
      { label: "Fixtures", to: "/dashboard/fixtures", icon: CalendarDays },
      { label: "Matches", to: "/dashboard/matches", icon: Swords },
      { label: "Venues", to: "/dashboard/venues", icon: MapPin },
      { label: "Officials", to: "/dashboard/officials", icon: UserCog },
      { label: "Live Scores", to: "/dashboard/live-scores", icon: Radio },
      { label: "Results", to: "/dashboard/results", icon: ListChecks },
      { label: "Points Table", to: "/dashboard/points-table", icon: BarChart2 },
      { label: "Statistics", to: "/dashboard/statistics", icon: LineChart },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Website Builder", to: "/dashboard/website", icon: Globe },
      { label: "Custom Domain", to: "/dashboard/domain", icon: Link2 },
      { label: "Gallery", to: "/dashboard/gallery", icon: Image },
      { label: "Sponsors", to: "/dashboard/sponsors", icon: Handshake },
      { label: "News", to: "/dashboard/news", icon: Newspaper },
      { label: "Streaming", to: "/dashboard/streaming", icon: Video },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
      { label: "Subscription", to: "/dashboard/subscription", icon: CreditCard },
      { label: "Invoices", to: "/dashboard/invoices", icon: Receipt },
      { label: "Analytics", to: "/dashboard/analytics", icon: TrendingUp },
      { label: "Settings", to: "/dashboard/settings", icon: Settings },
      { label: "Profile", to: "/account/profile", icon: UserCircle },
      { label: "Help", to: "/dashboard/help", icon: LifeBuoy },
      { label: "Logout", to: "/logout", icon: LogOut },
    ],
  },
];
