import type { RouteObject } from "react-router-dom";
import PublicSiteLayout from "../layouts/PublicSiteLayout";
import HomePage from "../pages/publicSite/HomePage";
import LiveIndexPage from "../pages/publicSite/LiveIndexPage";
import FixturesPage from "../pages/publicSite/FixturesPage";
import ResultsPage from "../pages/publicSite/ResultsPage";
import PointsTablePage from "../pages/publicSite/PointsTablePage";
import TeamsPage from "../pages/publicSite/TeamsPage";
import TeamDetailPage from "../pages/publicSite/TeamDetailPage";
import PlayersPage from "../pages/publicSite/PlayersPage";
import PlayerProfilePage from "../pages/publicSite/PlayerProfilePage";
import StatisticsPage from "../pages/publicSite/StatisticsPage";
import GalleryPage from "../pages/publicSite/GalleryPage";
import SponsorsPage from "../pages/publicSite/SponsorsPage";
import NewsPage from "../pages/publicSite/NewsPage";
import NewsArticlePage from "../pages/publicSite/NewsArticlePage";
import AboutPage from "../pages/publicSite/AboutPage";
import ContactPage from "../pages/publicSite/ContactPage";
import { PrivacyPolicyPage, TermsPage } from "../pages/publicSite/LegalPage";
import SearchPage from "../pages/publicSite/SearchPage";
import PublicNotFoundPage from "../pages/publicSite/NotFoundPage";

export const publicSiteRoutes: RouteObject[] = [
  {
    path: "/tournament/:slug",
    element: <PublicSiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "live", element: <LiveIndexPage /> },
      { path: "fixtures", element: <FixturesPage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "points-table", element: <PointsTablePage /> },
      { path: "teams", element: <TeamsPage /> },
      { path: "teams/:teamId", element: <TeamDetailPage /> },
      { path: "players", element: <PlayersPage /> },
      { path: "players/:playerId", element: <PlayerProfilePage /> },
      { path: "statistics", element: <StatisticsPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "sponsors", element: <SponsorsPage /> },
      { path: "news", element: <NewsPage /> },
      { path: "news/:articleSlug", element: <NewsArticlePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "privacy", element: <PrivacyPolicyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "*", element: <PublicNotFoundPage /> },
    ],
  },
];
