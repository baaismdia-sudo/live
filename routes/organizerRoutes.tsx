import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "./guards";
import OrganizerLayout from "../layouts/OrganizerLayout";
import DashboardHomePage from "../pages/organizer/DashboardHomePage";
import TournamentWizardPage from "../pages/organizer/TournamentWizardPage";
import MyTournamentsPage from "../pages/organizer/MyTournamentsPage";
import TournamentDetailPage from "../pages/organizer/TournamentDetailPage";
import TeamsPage from "../pages/organizer/TeamsPage";
import PlayersPage from "../pages/organizer/PlayersPage";
import PlayerProfilePage from "../pages/organizer/PlayerProfilePage";
import FixturesPage from "../pages/organizer/FixturesPage";
import MatchesPage from "../pages/organizer/MatchesPage";
import SponsorsPage from "../pages/organizer/SponsorsPage";
import GalleryPage from "../pages/organizer/GalleryPage";
import NewsPage from "../pages/organizer/NewsPage";
import WebsiteSettingsPage from "../pages/organizer/WebsiteSettingsPage";
import CustomDomainPage from "../pages/organizer/CustomDomainPage";
import SubscriptionPage from "../pages/organizer/SubscriptionPage";
import RentalEnquiryPage from "../pages/organizer/RentalEnquiryPage";
import InvoicesPage from "../pages/organizer/InvoicesPage";
import OrganizerSettingsPage from "../pages/organizer/OrganizerSettingsPage";
import HelpCenterPage from "../pages/organizer/HelpCenterPage";
import VenuesPage from "../pages/organizer/VenuesPage";
import OfficialsPage from "../pages/organizer/OfficialsPage";
import GroupsPage from "../pages/organizer/GroupsPage";
import PointsTablePage from "../pages/organizer/PointsTablePage";
import LiveScoresOverviewPage from "../pages/organizer/LiveScoresOverviewPage";
import ResultsPage from "../pages/organizer/ResultsPage";
import ComingSoonPage from "../pages/admin/ComingSoonPage";

// Statistics, Streaming (management UI), Notifications, and Analytics
// depend on a tracking/streaming-management pipeline not yet built.
const DEFERRED_PATHS = ["statistics", "streaming", "notifications", "analytics", "support"];

export const organizerRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <RequireAuth roles={["organizer", "manager"]}>
        <OrganizerLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "tournaments/new", element: <TournamentWizardPage /> },
      { path: "tournaments", element: <MyTournamentsPage /> },
      { path: "tournaments/:id", element: <TournamentDetailPage /> },
      { path: "teams", element: <TeamsPage /> },
      { path: "players", element: <PlayersPage /> },
      { path: "players/:id", element: <PlayerProfilePage /> },
      { path: "fixtures", element: <FixturesPage /> },
      { path: "matches", element: <MatchesPage /> },
      { path: "sponsors", element: <SponsorsPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "news", element: <NewsPage /> },
      { path: "website", element: <WebsiteSettingsPage /> },
      { path: "domain", element: <CustomDomainPage /> },
      { path: "subscription", element: <SubscriptionPage /> },
      { path: "subscription/enquire", element: <RentalEnquiryPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "settings", element: <OrganizerSettingsPage /> },
      { path: "help", element: <HelpCenterPage /> },
      { path: "venues", element: <VenuesPage /> },
      { path: "officials", element: <OfficialsPage /> },
      { path: "groups", element: <GroupsPage /> },
      { path: "points-table", element: <PointsTablePage /> },
      { path: "live-scores", element: <LiveScoresOverviewPage /> },
      { path: "results", element: <ResultsPage /> },
      ...DEFERRED_PATHS.map((path) => ({ path, element: <ComingSoonPage /> })),
    ],
  },
];
