/**
 * seed_demo_users.ts
 *
 * Creates demo auth users + a full demo tournament so the app has data to
 * develop against. auth.users cannot be seeded with plain SQL (GoTrue owns
 * password hashing), so this script uses the Supabase Admin API instead.
 *
 * Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx seed_demo_users.ts
 * NEVER run this against production, and never commit a service role key.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getRoleId(name: string): Promise<string> {
  const { data, error } = await supabase.from("roles").select("id").eq("name", name).single();
  if (error || !data) throw new Error(`Role "${name}" not found — run seed.sql first.`);
  return data.id;
}

async function createAuthUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return data.user!;
}

async function main() {
  console.log("Seeding demo users and tournament...");

  // --- Super Admin -------------------------------------------------------
  const superAdminUser = await createAuthUser(
    "admin@tournamentlive.app",
    "ChangeMe!SuperAdmin123",
    "Platform Admin"
  );
  const superAdminRoleId = await getRoleId("super_admin");
  await supabase.from("profiles").update({ role_id: superAdminRoleId }).eq("id", superAdminUser.id);
  console.log("Created super admin:", superAdminUser.email);

  // --- Demo Organizer ------------------------------------------------------
  const organizerUser = await createAuthUser(
    "organizer@demo.tournamentlive.app",
    "ChangeMe!Organizer123",
    "Demo Organizer"
  );
  const organizerRoleId = await getRoleId("organizer");
  await supabase.from("profiles").update({ role_id: organizerRoleId }).eq("id", organizerUser.id);
  console.log("Created demo organizer:", organizerUser.email);

  // --- Demo Rental Plan reference -----------------------------------------
  const { data: plan } = await supabase.from("rental_plans").select("id").eq("slug", "1-week").single();

  // --- Demo Tournament -----------------------------------------------------
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .insert({
      organizer_id: organizerUser.id,
      rental_plan_id: plan?.id,
      name: "Kodungallur Premier Cup 2026",
      slug: "kodungallur-premier-cup-2026",
      sport: "Football",
      description: "An annual 7-a-side football tournament for local clubs.",
      status: "active",
      is_public: true,
      rental_starts_at: new Date().toISOString(),
      rental_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  if (tError) throw tError;
  console.log("Created demo tournament:", tournament.slug);

  await supabase.from("tournament_settings").insert({
    tournament_id: tournament.id,
    format: "groups_knockout",
    max_teams: 16,
    registration_open: true,
  });
  await supabase.from("website_themes").insert({ tournament_id: tournament.id });
  await supabase.from("site_settings").insert({
    tournament_id: tournament.id,
    site_title: "Kodungallur Premier Cup 2026",
    tagline: "The region's biggest 7-a-side football showdown",
  });
  await supabase.from("seo_settings").insert({
    tournament_id: tournament.id,
    meta_title: "Kodungallur Premier Cup 2026",
    meta_description: "Follow live scores, standings, and news for the Kodungallur Premier Cup 2026.",
  });
  await supabase.from("domains").insert({
    tournament_id: tournament.id,
    subdomain: "kodungallur-premier-cup-2026",
  });

  // --- Demo Groups & Teams --------------------------------------------------
  const { data: groupA } = await supabase
    .from("groups")
    .insert({ tournament_id: tournament.id, name: "Group A", sort_order: 1 })
    .select()
    .single();

  const teamNames = ["FC Kodungallur", "Thrissur Titans", "Cochin Crusaders", "Malabar United"];
  const teamIds: string[] = [];
  for (const name of teamNames) {
    const { data: team } = await supabase
      .from("teams")
      .insert({
        tournament_id: tournament.id,
        group_id: groupA!.id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        status: "approved",
      })
      .select()
      .single();
    teamIds.push(team!.id);

    // demo players per team
    for (let i = 1; i <= 5; i++) {
      await supabase.from("players").insert({
        team_id: team!.id,
        full_name: `${name} Player ${i}`,
        jersey_number: i,
        position: i === 1 ? "Goalkeeper" : "Forward",
      });
    }

    await supabase.from("standings").insert({
      tournament_id: tournament.id,
      group_id: groupA!.id,
      team_id: team!.id,
    });
  }

  // --- Demo Match -----------------------------------------------------------
  const { data: match } = await supabase
    .from("matches")
    .insert({
      tournament_id: tournament.id,
      home_team_id: teamIds[0],
      away_team_id: teamIds[1],
      status: "scheduled",
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      venue: "Kodungallur Municipal Stadium",
    })
    .select()
    .single();
  await supabase.from("live_scores").insert({ match_id: match!.id });

  // --- Demo Sponsor, Gallery placeholder, News ------------------------------
  await supabase.from("sponsors").insert({
    tournament_id: tournament.id,
    name: "Chocolush",
    tier: "gold",
    website_url: "https://chocolush.example.com",
  });

  await supabase.from("news").insert({
    tournament_id: tournament.id,
    author_id: organizerUser.id,
    title: "Registrations Now Open",
    slug: "registrations-now-open",
    excerpt: "Teams can now register for the 2026 edition.",
    content: "Full registration details and rules are available on the tournament site.",
    is_published: true,
    published_at: new Date().toISOString(),
  });

  console.log("Demo seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
