import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Globe, Home, Navigation, PanelBottom, Palette, Ticket, CreditCard,
  Users, ShieldCheck, KeyRound, Building2, Trophy, Dumbbell, ShieldHalf, User, Swords,
  Radio, Newspaper, Image, Handshake, FileText, BookOpen, HelpCircle, MessageSquareQuote,
  Megaphone, Bell, Mail, Wallet, BadgePercent, Receipt, BarChart3, FileBarChart,
  LifeBuoy, Inbox, FolderOpen, Link2, ShieldAlert, Flag, Webhook, DatabaseBackup,
  Settings, History, Activity, UserCircle, LogOut, MessageCircle,
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

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  { title: "Overview", items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }] },
  {
    title: "Website",
    items: [
      { label: "Website Builder", to: "/admin/website-builder", icon: Globe },
      { label: "Homepage Builder", to: "/admin/homepage-builder", icon: Home },
      { label: "Navigation Builder", to: "/admin/navigation-builder", icon: Navigation },
      { label: "Footer Builder", to: "/admin/footer-builder", icon: PanelBottom },
      { label: "Theme Manager", to: "/admin/themes", icon: Palette },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Rental Plans", to: "/admin/rental-plans", icon: Ticket },
      { label: "Rental Enquiries", to: "/admin/rental-enquiries", icon: MessageCircle },
      { label: "Subscriptions", to: "/admin/subscriptions", icon: CreditCard },
      { label: "Coupons", to: "/admin/coupons", icon: BadgePercent },
      { label: "Taxes", to: "/admin/taxes", icon: Receipt },
      { label: "Payment Settings", to: "/admin/payment-settings", icon: Wallet },
    ],
  },
  {
    title: "People & Access",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Roles", to: "/admin/roles", icon: ShieldCheck },
      { label: "Permissions", to: "/admin/permissions", icon: KeyRound },
      { label: "Organizers", to: "/admin/organizers", icon: Building2 },
    ],
  },
  {
    title: "Competition",
    items: [
      { label: "Tournaments", to: "/admin/tournaments", icon: Trophy },
      { label: "Sports", to: "/admin/sports", icon: Dumbbell },
      { label: "Teams", to: "/admin/teams", icon: ShieldHalf },
      { label: "Players", to: "/admin/players", icon: User },
      { label: "Matches", to: "/admin/matches", icon: Swords },
      { label: "Live Scores", to: "/admin/live-scores", icon: Radio },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "News", to: "/admin/news", icon: Newspaper },
      { label: "Gallery", to: "/admin/gallery", icon: Image },
      { label: "Sponsors", to: "/admin/sponsors", icon: Handshake },
      { label: "CMS", to: "/admin/cms", icon: FileText },
      { label: "Blog", to: "/admin/blog", icon: BookOpen },
      { label: "FAQ", to: "/admin/faq", icon: HelpCircle },
      { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "Advertisements", to: "/admin/advertisements", icon: Megaphone },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Email Templates", to: "/admin/email-templates", icon: Mail },
      { label: "Support Tickets", to: "/admin/support-tickets", icon: LifeBuoy },
      { label: "Contact Messages", to: "/admin/contact-messages", icon: Inbox },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", to: "/admin/reports", icon: FileBarChart },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Media Library", to: "/admin/media-library", icon: FolderOpen },
      { label: "Domains", to: "/admin/domains", icon: Link2 },
      { label: "Custom Domains", to: "/admin/custom-domains", icon: ShieldAlert },
      { label: "Feature Flags", to: "/admin/feature-flags", icon: Flag },
      { label: "API Keys", to: "/admin/api-keys", icon: KeyRound },
      { label: "Webhook Logs", to: "/admin/webhook-logs", icon: Webhook },
      { label: "Backup & Restore", to: "/admin/backup", icon: DatabaseBackup },
      { label: "System Settings", to: "/admin/system-settings", icon: Settings },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: History },
      { label: "Activity Logs", to: "/admin/activity-logs", icon: Activity },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: "/account/profile", icon: UserCircle },
      { label: "Logout", to: "/logout", icon: LogOut },
    ],
  },
];
