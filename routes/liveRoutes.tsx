import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "./guards";
import { RoleWorkspaceLayout } from "../layouts/RoleWorkspaceLayout";
import ScorekeeperMatchListPage from "../pages/scorekeeper/ScorekeeperMatchListPage";
import ScorekeeperMatchControlPage from "../pages/scorekeeper/ScorekeeperMatchControlPage";
import CommentatorMatchListPage from "../pages/commentator/CommentatorMatchListPage";
import CommentatorMatchPage from "../pages/commentator/CommentatorMatchPage";
import LiveMatchPage from "../pages/public/LiveMatchPage";

export const liveRoutes: RouteObject[] = [
  {
    path: "/scorekeeper",
    element: (
      <RequireAuth roles={["scorekeeper", "manager", "organizer"]}>
        <RoleWorkspaceLayout label="Scorekeeper" />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ScorekeeperMatchListPage /> },
      { path: ":id", element: <ScorekeeperMatchControlPage /> },
    ],
  },
  {
    path: "/commentator",
    element: (
      <RequireAuth roles={["commentator", "manager", "organizer"]}>
        <RoleWorkspaceLayout label="Commentator" />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <CommentatorMatchListPage /> },
      { path: ":id", element: <CommentatorMatchPage /> },
    ],
  },
  // Public — no auth required, matches the marketing/public-site pattern.
  { path: "/live/:id", element: <LiveMatchPage /> },
];
