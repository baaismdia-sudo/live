import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { FadeInSection, SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { CountdownTimer } from "../../features/publicSite/components/CountdownTimer";
import { MatchCard } from "../../features/publicSite/components/MatchCard";
import { TeamCard } from "../../features/publicSite/components/TeamCard";
import { PlayerCard } from "../../features/publicSite/components/PlayerCard";
import { NewsCard } from "../../features/publicSite/components/NewsCard";
import { SponsorStrip } from "../../features/publicSite/components/SponsorStrip";

const DEFAULT_SECTIONS = [
  { key: "hero", visible: true }, { key: "quick_stats", visible: true }, { key: "live_matches", visible: true },
  { key: "upcoming_matches", visible: true }, { key: "latest_results", visible: true }, { key: "featured_teams", visible: true },
  { key: "featured_players", visible: true }, { key: "sponsors", visible: true }, { key: "news", visible: true }, { key: "gallery", visible: true },
];

export default function HomePage() {
  const { tournament, siteSettings } = useSiteContext();
  const [stats, setStats] = useState({ teams: 0, matches: 0, venues: 0 });
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    const matchSelect = "id, status, scheduled_at, home_score, away_score, home:teams!matches_home_team_id_fkey(name, logo_url), away:teams!matches_away_team_id_fkey(name, logo_url)";
    supabase.from("matches").select(matchSelect).eq("tournament_id", tournament.id).eq("status", "live").then(({ data }) => setLiveMatches(data ?? []));
    supabase.from("matches").select(matchSelect).eq("tournament_id", tournament.id).eq("status", "scheduled").order("scheduled_at").limit(4).then(({ data }) => setUpcomingMatches(data ?? []));
    supabase.from("matches").select(matchSelect).eq("tournament_id", tournament.id).eq("status", "completed").order("ended_at", { ascending: false }).limit(4).then(({ data }) => setResults(data ?? []));
    supabase.from("teams").select("id, name, logo_url, coach_name, manager_name").eq("tournament_id", tournament.id).is("deleted_at", null).limit(8).then(({ data }) => setTeams(data ?? []));
    supabase.from("players").select("id, full_name, photo_url, jersey_number, position, nationality, teams!inner(tournament_id)").eq("teams.tournament_id", tournament.id).is("deleted_at", null).limit(8).then(({ data }) => setPlayers(data ?? []));
    supabase.from("news").select("id, title, slug, excerpt, cover_image_url, published_at").eq("tournament_id", tournament.id).eq("is_published", true).order("published_at", { ascending: false }).limit(3).then(({ data }) => setNews(data ?? []));
    supabase.from("sponsors").select("id, name, logo_url, website_url, tier").eq("tournament_id", tournament.id).then(({ data }) => setSponsors(data ?? []));
    supabase.from("gallery").select("id, caption, media:media_library(file_url)").eq("tournament_id", tournament.id).order("sort_order").limit(8).then(({ data }) => setGalleryImages(data ?? []));

    Promise.all([
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("tournament_id", tournament.id).is("deleted_at", null),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("tournament_id", tournament.id),
    ]).then(([teamsCount, matchesCount]) => {
      setStats({ teams: teamsCount.count ?? 0, matches: matchesCount.count ?? 0, venues: 0 });
    });
  }, [tournament.id]);

  const sections = siteSettings?.homepage_sections?.length ? siteSettings.homepage_sections : DEFAULT_SECTIONS;
  const isVisible = (key: string) => sections.find((s) => s.key === key)?.visible !== false;

  const renderSection = (key: string) => {
    switch (key) {
      case "hero":
        return (
          <div key={key} className="relative overflow-hidden rounded-3xl p-8 text-white sm:p-12" style={{ background: "var(--gradient-brand)" }}>
            <div className="relative z-10">
              {tournament.season && <p className="text-sm font-medium uppercase tracking-wide text-white/80">{tournament.season} Season</p>}
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
                {tournament.name}
              </motion.h1>
              {tournament.description && <p className="mt-3 max-w-lg text-sm text-white/90">{tournament.description}</p>}
              {tournament.starts_at && new Date(tournament.starts_at) > new Date() && (
                <div className="mt-6"><CountdownTimer target={tournament.starts_at} /></div>
              )}
              <div className="mt-6 flex gap-3">
                <Link to={`/tournament/${tournament.slug}/fixtures`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-90">Explore Fixtures</Link>
                <Link to={`/tournament/${tournament.slug}/live`} className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">Live Matches</Link>
              </div>
            </div>
          </div>
        );
      case "quick_stats":
        return (
          <FadeInSection key={key} className="grid grid-cols-3 gap-4 text-center">
            <StatBox value={stats.teams} label="Teams" />
            <StatBox value={stats.matches} label="Matches" />
            <StatBox value={sponsors.length} label="Sponsors" />
          </FadeInSection>
        );
      case "live_matches":
        return liveMatches.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Live now" action={<Link to={`/tournament/${tournament.slug}/live`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid gap-3 sm:grid-cols-2">{liveMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          </FadeInSection>
        ) : null;
      case "upcoming_matches":
        return upcomingMatches.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Upcoming matches" action={<Link to={`/tournament/${tournament.slug}/fixtures`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid gap-3 sm:grid-cols-2">{upcomingMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          </FadeInSection>
        ) : null;
      case "latest_results":
        return results.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Latest results" action={<Link to={`/tournament/${tournament.slug}/results`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid gap-3 sm:grid-cols-2">{results.map((m) => <MatchCard key={m.id} match={m} />)}</div>
          </FadeInSection>
        ) : null;
      case "featured_teams":
        return teams.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Teams" action={<Link to={`/tournament/${tournament.slug}/teams`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{teams.map((t, i) => <TeamCard key={t.id} team={t} slug={tournament.slug} index={i} />)}</div>
          </FadeInSection>
        ) : null;
      case "featured_players":
        return players.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Players" action={<Link to={`/tournament/${tournament.slug}/players`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{players.map((p, i) => <PlayerCard key={p.id} player={p} slug={tournament.slug} index={i} />)}</div>
          </FadeInSection>
        ) : null;
      case "sponsors":
        return siteSettings?.show_sponsors !== false && sponsors.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Our sponsors" />
            <SponsorStrip sponsors={sponsors} />
          </FadeInSection>
        ) : null;
      case "news":
        return siteSettings?.show_news !== false && news.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Latest news" action={<Link to={`/tournament/${tournament.slug}/news`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid gap-4 sm:grid-cols-3">{news.map((n) => <NewsCard key={n.id} article={n} slug={tournament.slug} />)}</div>
          </FadeInSection>
        ) : null;
      case "gallery":
        return siteSettings?.show_gallery !== false && galleryImages.length > 0 ? (
          <FadeInSection key={key}>
            <SectionHeading title="Gallery" action={<Link to={`/tournament/${tournament.slug}/gallery`} className="text-sm text-[var(--color-primary)] hover:underline">View all</Link>} />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {galleryImages.slice(0, 8).map((g) => (
                <div key={g.id} className="aspect-square overflow-hidden rounded-lg">
                  {g.media?.file_url && <img src={g.media.file_url} alt={g.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />}
                </div>
              ))}
            </div>
          </FadeInSection>
        ) : null;
      default:
        return null;
    }
  };

  return <div className="space-y-12">{sections.filter((s) => isVisible(s.key)).map((s) => renderSection(s.key))}</div>;
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-2xl font-bold text-[var(--color-heading)]">{value}</p>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
    </div>
  );
}
