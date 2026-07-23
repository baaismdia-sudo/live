# Permission Matrix

Roles and permissions are stored in `roles`, `permissions`, and `role_permissions` —
editable from the Super Admin dashboard without a code deploy. The table below reflects
the seeded defaults; it is data, not a hardcoded rule set.

| Capability | Super Admin | Organizer | Manager | Scorekeeper | Commentator | Viewer | Guest |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage platform settings, plans, feature flags | ✅ | – | – | – | – | – | – |
| Suspend/manage any organizer account | ✅ | – | – | – | – | – | – |
| View platform-wide analytics | ✅ | own tournaments only | own (as staff) | – | – | – | – |
| Create a tournament | ✅ | ✅ | – | – | – | – | – |
| Edit tournament details/settings/theme | ✅ | ✅ (own) | ✅ (assigned) | – | – | – | – |
| Delete/archive a tournament | ✅ | ✅ (own) | – | – | – | – | – |
| Invite staff (manager/scorekeeper/commentator) | ✅ | ✅ (own) | ✅ (assigned) | – | – | – | – |
| Create/edit fixtures & matches | ✅ | ✅ | ✅ | – | – | – | – |
| Update live scores & match events | ✅ | ✅ | ✅ | ✅ (assigned matches) | – | – | – |
| Post live commentary | ✅ | ✅ | ✅ | – | ✅ (assigned matches) | – | – |
| Manage news/gallery/sponsors/testimonials | ✅ | ✅ | ✅ | – | – | – | – |
| Manage own billing/subscription | ✅ | ✅ | – | – | – | – | – |
| View a public, published tournament site | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View a draft (unpublished) tournament | ✅ | ✅ (own) | ✅ (assigned) | – | – | – | – |
| Read/write own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | – |

**Notes**

- "Manager", "Scorekeeper", and "Commentator" are *staff roles*: a profile with one of
  these roles has `profiles.organizer_id` set to the organizer account they work for.
  RLS resolves their effective scope through `effective_organizer_id()` and
  `is_tournament_staff()` (see `0011_auth_helper_functions.sql`), so a staff member only
  ever touches tournaments belonging to the organizer who invited them.
- A tournament that has passed `rental_ends_at` moves to `archived` via a scheduled
  Edge Function. Archived tournaments remain publicly readable but all staff write
  policies for that tournament are blocked at the database level (`status <> 'archived'`
  check in the `tournaments_staff_update` policy), so read-only enforcement holds even if
  a client bypasses the UI.
- Fine-grained permission codes (`tournament.create`, `match.score_update`, etc.) exist in
  `permissions`/`role_permissions` for cases where the app needs a yes/no check that isn't
  naturally expressible as a table-scoped RLS policy — e.g., showing/hiding a button in the
  UI. RLS remains the actual security boundary; `has_permission()` is a convenience layer
  on top, not a replacement.
