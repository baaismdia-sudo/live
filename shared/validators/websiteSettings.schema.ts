import { z } from "zod";

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Must be a valid hex color");

export const websiteThemeSchema = z.object({
  tournamentId: z.string().uuid(),
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  fontHeading: z.string().trim().min(1).max(60),
  fontBody: z.string().trim().min(1).max(60),
  darkModeEnabled: z.boolean().default(true),
  layoutVariant: z.enum(["classic", "modern", "minimal"]).default("classic"),
  customCss: z.string().trim().max(20000).optional(),
});

export type WebsiteThemeInput = z.infer<typeof websiteThemeSchema>;

export const siteSettingsSchema = z.object({
  tournamentId: z.string().uuid(),
  siteTitle: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  faviconUrl: z.string().url().optional(),
  showSponsors: z.boolean().default(true),
  showGallery: z.boolean().default(true),
  showNews: z.boolean().default(true),
  showLiveStream: z.boolean().default(false),
  footerText: z.string().trim().max(300).optional(),
  maintenanceMode: z.boolean().default(false),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const seoSettingsSchema = z.object({
  tournamentId: z.string().uuid(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  ogImageUrl: z.string().url().optional(),
  keywords: z.array(z.string().trim()).max(20).optional(),
  canonicalUrl: z.string().url().optional(),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
