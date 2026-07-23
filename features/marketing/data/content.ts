export const FEATURES = [
  { icon: "⚡", title: "Live Score", description: "Real-time score updates that push to every visitor instantly via Supabase Realtime." },
  { icon: "🏆", title: "Tournament Builder", description: "Set up knockouts, round robins, or groups-plus-knockout formats in minutes." },
  { icon: "📅", title: "Fixture Generator", description: "Auto-generate a full fixture list from your team count and format." },
  { icon: "📊", title: "Points Table", description: "Standings recalculate automatically as results come in." },
  { icon: "📈", title: "Statistics", description: "Track goals, cards, points, and per-player performance." },
  { icon: "🎙️", title: "Commentary", description: "Post live text commentary alongside the score feed." },
  { icon: "🎨", title: "Website Builder", description: "No-code editor for your tournament's public site — no developer needed." },
  { icon: "🌗", title: "Themes", description: "Switch colors, fonts, and layout variants instantly, with dark mode built in." },
  { icon: "🤝", title: "Sponsors", description: "A dedicated sponsor showcase with tiered logo placement." },
  { icon: "🖼️", title: "Gallery", description: "Upload and organize match-day photos in a polished gallery." },
  { icon: "📰", title: "News", description: "Publish articles and announcements straight from your dashboard." },
  { icon: "📡", title: "Live Streaming", description: "Embed a YouTube or custom stream next to the live scoreboard." },
  { icon: "🔔", title: "Notifications", description: "Keep your team and viewers updated with in-app alerts." },
  { icon: "📉", title: "Analytics", description: "See page views and engagement for every tournament site." },
  { icon: "🌐", title: "Custom Domains", description: "Point your own domain at your tournament site." },
  { icon: "🗓️", title: "Rental Plans", description: "Rent by the day, week, or month — pay only for the time you need." },
  { icon: "💳", title: "Payment Integration", description: "Secure checkout with Razorpay and Stripe support." },
  { icon: "🔄", title: "Realtime Updates", description: "Every visitor sees the same live state, no refresh needed." },
  { icon: "⚽", title: "Multi Sport Support", description: "Football, cricket, kabaddi, esports, and more — one platform." },
  { icon: "🛡️", title: "Role Management", description: "Organizer, manager, scorekeeper, and commentator roles out of the box." },
];

export const SPORTS = [
  { icon: "⚽", name: "Football" },
  { icon: "🏏", name: "Cricket" },
  { icon: "🏀", name: "Basketball" },
  { icon: "🏐", name: "Volleyball" },
  { icon: "🤾", name: "Kabaddi" },
  { icon: "🏸", name: "Badminton" },
  { icon: "♟️", name: "Chess" },
  { icon: "🎮", name: "Esports" },
  { icon: "🎾", name: "Tennis" },
  { icon: "🏓", name: "Table Tennis" },
  { icon: "🏑", name: "Hockey" },
  { icon: "🏃", name: "Athletics" },
  { icon: "➕", name: "Custom Sport" },
];

export const HOW_IT_WORKS = [
  { step: 1, icon: "📝", title: "Register", description: "Create your organizer account in under a minute." },
  { step: 2, icon: "🏆", title: "Create Tournament", description: "Name your tournament, pick a sport and rental duration." },
  { step: 3, icon: "🎨", title: "Customize Website", description: "Pick colors, fonts, and layout — no code required." },
  { step: 4, icon: "👥", title: "Add Teams", description: "Register teams and rosters, or let teams self-register." },
  { step: 5, icon: "📅", title: "Generate Fixtures", description: "One click builds your full match schedule." },
  { step: 6, icon: "🚀", title: "Go Live", description: "Publish your site on your free subdomain or custom domain." },
  { step: 7, icon: "⚡", title: "Update Scores", description: "Scorekeepers push live updates from any device." },
  { step: 8, icon: "🔗", title: "Share Website", description: "Send the link to players, fans, and sponsors." },
];

export const WHY_CHOOSE_US = [
  { icon: "⚡", title: "Fast", description: "Built on Supabase's edge network for sub-second updates." },
  { icon: "🔄", title: "Realtime", description: "Every score update reaches every viewer instantly." },
  { icon: "🚫💻", title: "No Coding", description: "Everything is configured through the dashboard." },
  { icon: "💰", title: "Affordable", description: "Plans starting at a fraction of a custom website's cost." },
  { icon: "🔒", title: "Secure", description: "Row-level security on every table, every request." },
  { icon: "☁️", title: "Cloud Hosted", description: "No servers to manage — we handle uptime and scaling." },
  { icon: "🔍", title: "SEO Friendly", description: "Every tournament site ships with proper meta tags out of the box." },
  { icon: "📱", title: "Responsive", description: "Looks great from a phone in the stands to a press-box monitor." },
  { icon: "🏷️", title: "White Label Ready", description: "Your brand, your domain, your sponsors — front and center." },
];

export const TESTIMONIALS = [
  { authorName: "Arjun Menon", authorRole: "Organizer, Kodungallur Premier Cup", message: "We had our tournament site live in an afternoon. The live scoring alone saved us a dozen WhatsApp groups.", rating: 5, avatarInitial: "A", verified: true },
  { authorName: "Priya Nair", authorRole: "Sports Coordinator, Malabar Sports Club", message: "Our sponsors love having a dedicated page. Renewal was a no-brainer after our first tournament.", rating: 5, avatarInitial: "P", verified: true },
  { authorName: "Rohan Das", authorRole: "Organizer, Cochin Corporate League", message: "The points table updates itself. That used to be someone's entire weekend job.", rating: 4, avatarInitial: "R", verified: true },
];

export const FAQS = [
  { question: "How does rental work?", answer: "Pick a duration — from 1 day to unlimited — pay once, and your tournament site is live for that period. You can renew anytime before or after it expires." },
  { question: "Can I customize my website?", answer: "Yes. Colors, fonts, layout, logo, banners, and which sections appear are all editable from your dashboard — no code required." },
  { question: "Can I use my own domain?", answer: "Yes, on 1-month and Unlimited plans you can connect a custom domain in addition to your free subdomain." },
  { question: "Can I update live scores?", answer: "Yes. Organizers, managers, and invited scorekeepers can push live score and event updates from any device." },
  { question: "Can I renew my rental?", answer: "Yes, you can renew before expiry to keep your site active, or renew an archived site later to bring it back online." },
  { question: "Can I stream live?", answer: "Yes, you can embed a YouTube or custom live stream directly on your tournament's match page." },
  { question: "Can I manage multiple tournaments?", answer: "Yes, your organizer dashboard supports as many tournaments as you'd like to run, each with its own rental and settings." },
  { question: "Can I export data?", answer: "Yes, teams, players, and results can all be exported from your dashboard at any time." },
];

export const BLOG_POSTS = [
  { slug: "no-code-tournament-sites", title: "Why organizers are ditching custom-built tournament sites", category: "Product", date: "Jul 2026", imageEmoji: "🏆" },
  { slug: "live-scoring-best-practices", title: "5 tips for smoother live scoring on match day", category: "Guide", date: "Jun 2026", imageEmoji: "⚡" },
  { slug: "sponsor-showcase-ideas", title: "Getting the most out of your sponsor showcase", category: "Growth", date: "Jun 2026", imageEmoji: "🤝" },
];

export const STATS = [
  { value: 10000, suffix: "+", label: "Matches Hosted" },
  { value: 1000000, suffix: "+", label: "Live Score Views" },
  { value: 500, suffix: "+", label: "Organizers" },
  { value: 100, suffix: "+", label: "Cities" },
];

export const TRUSTED_BY = ["Kodungallur Sports Council", "Malabar Sports Club", "Cochin Corporate League", "Thrissur Youth Federation", "Calicut Athletics Trust"];

export const SCREENSHOTS = [
  { title: "Dashboard", emoji: "🖥️" },
  { title: "Tournament Page", emoji: "🏆" },
  { title: "Live Match", emoji: "⚡" },
  { title: "Points Table", emoji: "📊" },
  { title: "Statistics", emoji: "📈" },
  { title: "Team Page", emoji: "👥" },
  { title: "Player Page", emoji: "🧑" },
  { title: "Gallery", emoji: "🖼️" },
];
