import { Suspense, lazy } from "react";
import { Seo, OrganizationSchema } from "../../components/seo/Seo";
import { useTheme } from "../../contexts/ThemeContext";
import { AnnouncementBar } from "../../features/marketing/sections/AnnouncementBar";
import { Navbar } from "../../features/marketing/sections/Navbar";
import { Hero } from "../../features/marketing/sections/Hero";
import { TrustedBy } from "../../features/marketing/sections/TrustedBy";
import { Features } from "../../features/marketing/sections/Features";
import { Footer } from "../../features/marketing/sections/Footer";
import { PageLoader } from "../../components/ui/LoadingSpinner";

/**
 * Sections below the fold are code-split so the initial bundle only pays
 * for what's visible on load (Hero/Features render eagerly); everything
 * else streams in as the user scrolls, keeping first paint fast.
 */
const LiveDemo = lazy(() => import("../../features/marketing/sections/LiveDemo").then((m) => ({ default: m.LiveDemo })));
const HowItWorks = lazy(() => import("../../features/marketing/sections/HowItWorks").then((m) => ({ default: m.HowItWorks })));
const SupportedSports = lazy(() => import("../../features/marketing/sections/SupportedSports").then((m) => ({ default: m.SupportedSports })));
const WhyChooseUs = lazy(() => import("../../features/marketing/sections/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const WebsiteCustomizationShowcase = lazy(() =>
  import("../../features/marketing/sections/WebsiteCustomizationShowcase").then((m) => ({ default: m.WebsiteCustomizationShowcase }))
);
const LiveScoreShowcase = lazy(() => import("../../features/marketing/sections/LiveScoreShowcase").then((m) => ({ default: m.LiveScoreShowcase })));
const Screenshots = lazy(() => import("../../features/marketing/sections/Screenshots").then((m) => ({ default: m.Screenshots })));
const Pricing = lazy(() => import("../../features/marketing/sections/Pricing").then((m) => ({ default: m.Pricing })));
const Testimonials = lazy(() => import("../../features/marketing/sections/Testimonials").then((m) => ({ default: m.Testimonials })));
const Faq = lazy(() => import("../../features/marketing/sections/Faq").then((m) => ({ default: m.Faq })));
const BlogPreview = lazy(() => import("../../features/marketing/sections/BlogPreview").then((m) => ({ default: m.BlogPreview })));
const Newsletter = lazy(() => import("../../features/marketing/sections/Newsletter").then((m) => ({ default: m.Newsletter })));
const CtaSection = lazy(() => import("../../features/marketing/sections/CtaSection").then((m) => ({ default: m.CtaSection })));

function SectionFallback() {
  return <div className="h-40" aria-hidden="true" />;
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Seo
        title="TournamentLive — Rent a tournament website in minutes"
        description="Create a fully branded tournament website with live scores, fixtures, standings, and sponsors — no code required. Rent by the day, week, or month."
        path="/"
      />
      <OrganizationSchema />

      <AnnouncementBar />
      <Navbar isDark={theme === "dark"} onToggleDark={toggleTheme} />

      <main>
        <Hero />
        <TrustedBy />
        <Features />

        <Suspense fallback={<SectionFallback />}><LiveDemo /></Suspense>
        <Suspense fallback={<SectionFallback />}><HowItWorks /></Suspense>
        <Suspense fallback={<SectionFallback />}><SupportedSports /></Suspense>
        <Suspense fallback={<SectionFallback />}><WhyChooseUs /></Suspense>
        <Suspense fallback={<SectionFallback />}><WebsiteCustomizationShowcase /></Suspense>
        <Suspense fallback={<SectionFallback />}><LiveScoreShowcase /></Suspense>
        <Suspense fallback={<SectionFallback />}><Screenshots /></Suspense>
        <Suspense fallback={<SectionFallback />}><Pricing /></Suspense>
        <Suspense fallback={<SectionFallback />}><Testimonials /></Suspense>
        <Suspense fallback={<SectionFallback />}><Faq /></Suspense>
        <Suspense fallback={<SectionFallback />}><BlogPreview /></Suspense>
        <Suspense fallback={<SectionFallback />}><Newsletter /></Suspense>
        <Suspense fallback={<SectionFallback />}><CtaSection /></Suspense>
      </main>

      <Footer />
    </div>
  );
}
