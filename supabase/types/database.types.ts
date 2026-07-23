/**
 * database.types.ts
 *
 * Hand-authored core types matching the schema in supabase/migrations/*.
 * Once the project is linked, run:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 *
 * ...and treat that CLI-generated file as the source of truth for every
 * table. This file is committed now so the app has types to build against
 * before the project is linked, and documents the shape every table below
 * follows (Row / Insert / Update), consistent with what the CLI produces.
 */

export type UserRoleName =
  | "super_admin"
  | "organizer"
  | "manager"
  | "scorekeeper"
  | "commentator"
  | "viewer"
  | "guest";

export type RentalDuration = "1_day" | "3_day" | "1_week" | "2_week" | "1_month" | "unlimited";
export type TournamentStatus = "draft" | "pending_payment" | "active" | "expiring" | "archived" | "suspended";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded" | "partially_refunded";
export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type TeamStatus = "pending" | "approved" | "rejected";
export type PlayerStatus = "active" | "injured" | "suspended";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type NotificationType = "info" | "warning" | "success" | "error" | "system";

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  role_id: string;
  organizer_id: string | null;
  status: "active" | "suspended" | "pending";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Role {
  id: string;
  name: UserRoleName;
  label: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface RentalPlan {
  id: string;
  name: string;
  slug: string;
  duration: RentalDuration;
  price_cents: number;
  currency: string;
  features: string[];
  max_teams: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organizer_id: string;
  plan_id: string;
  coupon_id: string | null;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  organizer_id: string;
  subscription_id: string | null;
  tournament_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  gateway_ref: string | null;
  coupon_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  organizer_id: string;
  rental_plan_id: string | null;
  subscription_id: string | null;
  name: string;
  slug: string;
  sport: string;
  season: string | null;
  description: string | null;
  status: TournamentStatus;
  cover_image_url: string | null;
  logo_url: string | null;
  is_public: boolean;
  timezone: string;
  starts_at: string | null;
  ends_at: string | null;
  rental_starts_at: string | null;
  rental_ends_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TournamentSettings {
  id: string;
  tournament_id: string;
  format: "knockout" | "round_robin" | "groups_knockout" | "league";
  max_teams: number | null;
  rules_text: string | null;
  registration_open: boolean;
  registration_deadline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: Record<string, string>;
  updated_at: string;
}

export interface WebsiteTheme {
  id: string;
  tournament_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  dark_mode_enabled: boolean;
  layout_variant: "classic" | "modern" | "minimal";
  custom_css: string | null;
  updated_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  group_id: string | null;
  name: string;
  slug: string;
  logo_url: string | null;
  manager_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  seed: number | null;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Player {
  id: string;
  team_id: string;
  full_name: string;
  jersey_number: number | null;
  position: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  is_captain: boolean;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Match {
  id: string;
  tournament_id: string;
  fixture_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  winner_team_id: string | null;
  status: MatchStatus;
  venue: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
}

export interface LiveScore {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  period: string | null;
  time_elapsed: string | null;
  is_live: boolean;
  last_updated_by: string | null;
  updated_at: string;
}

export interface Standing {
  id: string;
  tournament_id: string;
  group_id: string | null;
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  rank: number | null;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: "platinum" | "gold" | "silver" | "bronze";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  tournament_id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Generic row-shape helper. The full generated types file gives every
 * table Row/Insert/Update variants like this automatically; this alias
 * documents the same convention for the tables above until then.
 */
export type Insert<T> = Omit<T, "id" | "created_at" | "updated_at"> & { id?: string };
export type Update<T> = Partial<Insert<T>>;
