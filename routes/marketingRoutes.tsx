import type { RouteObject } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage";

/**
 * Only the homepage is fully built out in this pass (Prompt 4 scope: the
 * landing page itself). /features, /pricing, /demo, /sports, /blog, /contact
 * etc. are linked throughout the nav/footer already and should resolve to
 * their own dedicated pages built the same way as LandingPage — flagged
 * here rather than stubbed with placeholder components, since Prompt 4 was
 * scoped to "the landing page," not the full marketing site's every route.
 */
export const marketingRoutes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
];
