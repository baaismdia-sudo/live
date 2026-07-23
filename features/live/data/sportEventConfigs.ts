export interface QuickAction {
  eventType: string;
  label: string;
  icon: string;
  requiresPlayer?: boolean;
  scoreDelta?: number;      // added to the acting team's home/away score
  promptValue?: boolean;    // ask for a numeric value (e.g. runs, damage)
  tone?: "success" | "warning" | "danger" | "info";
}

export interface SportConfig {
  key: string;
  label: string;
  periods: string[];         // valid match_status progression specific to this sport's presentation
  quickActions: QuickAction[];
  statLabels: Record<string, string>;
}

export const FOOTBALL_CONFIG: SportConfig = {
  key: "football",
  label: "Football",
  periods: ["warm_up", "live", "half_time", "live", "extra_time", "penalty_shootout", "completed"],
  quickActions: [
    { eventType: "goal", label: "Goal", icon: "⚽", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "own_goal", label: "Own Goal", icon: "⚽", requiresPlayer: true, scoreDelta: 1, tone: "warning" },
    { eventType: "penalty_goal", label: "Penalty Goal", icon: "🎯", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "missed_penalty", label: "Missed Penalty", icon: "❌", requiresPlayer: true, tone: "warning" },
    { eventType: "assist", label: "Assist", icon: "🅰️", requiresPlayer: true, tone: "info" },
    { eventType: "yellow_card", label: "Yellow Card", icon: "🟨", requiresPlayer: true, tone: "warning" },
    { eventType: "red_card", label: "Red Card", icon: "🟥", requiresPlayer: true, tone: "danger" },
    { eventType: "second_yellow", label: "2nd Yellow → Red", icon: "🟨🟥", requiresPlayer: true, tone: "danger" },
    { eventType: "corner", label: "Corner", icon: "🚩", tone: "info" },
    { eventType: "free_kick", label: "Free Kick", icon: "🎯", tone: "info" },
    { eventType: "offside", label: "Offside", icon: "🚫", requiresPlayer: true, tone: "warning" },
    { eventType: "throw_in", label: "Throw In", icon: "↩️", tone: "info" },
    { eventType: "substitution", label: "Substitution", icon: "🔄", requiresPlayer: true, tone: "info" },
    { eventType: "injury", label: "Injury", icon: "🩹", requiresPlayer: true, tone: "warning" },
    { eventType: "var_review", label: "VAR Review", icon: "📺", tone: "info" },
  ],
  statLabels: { goals: "Goals", assists: "Assists", shots: "Shots", shots_on_target: "Shots on Target", tackles: "Tackles", interceptions: "Interceptions", saves: "Saves", yellow_cards: "Yellow Cards", red_cards: "Red Cards" },
};

export const CRICKET_CONFIG: SportConfig = {
  key: "cricket",
  label: "Cricket",
  periods: ["live", "break", "completed"],
  quickActions: [
    { eventType: "runs", label: "Dot Ball", icon: "0", requiresPlayer: true, promptValue: false, scoreDelta: 0, tone: "info" },
    { eventType: "runs", label: "Single", icon: "1", requiresPlayer: true, scoreDelta: 1, tone: "info" },
    { eventType: "runs", label: "Double", icon: "2", requiresPlayer: true, scoreDelta: 2, tone: "info" },
    { eventType: "runs", label: "Triple", icon: "3", requiresPlayer: true, scoreDelta: 3, tone: "info" },
    { eventType: "four", label: "Boundary (4)", icon: "🏏", requiresPlayer: true, scoreDelta: 4, tone: "success" },
    { eventType: "six", label: "Six", icon: "🏏", requiresPlayer: true, scoreDelta: 6, tone: "success" },
    { eventType: "wide", label: "Wide", icon: "↔️", scoreDelta: 1, tone: "warning" },
    { eventType: "no_ball", label: "No Ball", icon: "🚫", scoreDelta: 1, tone: "warning" },
    { eventType: "bye", label: "Bye", icon: "↪️", scoreDelta: 1, tone: "info" },
    { eventType: "leg_bye", label: "Leg Bye", icon: "↪️", scoreDelta: 1, tone: "info" },
    { eventType: "wicket", label: "Wicket (Bowled)", icon: "🎯", requiresPlayer: true, tone: "danger" },
    { eventType: "caught", label: "Caught", icon: "🙌", requiresPlayer: true, tone: "danger" },
    { eventType: "lbw", label: "LBW", icon: "🦵", requiresPlayer: true, tone: "danger" },
    { eventType: "run_out", label: "Run Out", icon: "🏃", requiresPlayer: true, tone: "danger" },
    { eventType: "stumping", label: "Stumped", icon: "🧤", requiresPlayer: true, tone: "danger" },
    { eventType: "hit_wicket", label: "Hit Wicket", icon: "🏏", requiresPlayer: true, tone: "danger" },
    { eventType: "drs_review", label: "DRS Review", icon: "📺", tone: "info" },
    { eventType: "over_complete", label: "Over Complete", icon: "🔁", tone: "info" },
  ],
  statLabels: { runs: "Runs", wickets_taken: "Wickets", fours: "Fours", sixes: "Sixes", catches: "Catches", run_outs: "Run Outs", stumpings: "Stumpings" },
};

export const VOLLEYBALL_CONFIG: SportConfig = {
  key: "volleyball",
  label: "Volleyball",
  periods: ["live", "break", "completed"],
  quickActions: [
    { eventType: "point", label: "Point", icon: "🏐", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "ace", label: "Ace", icon: "🎯", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "attack_point", label: "Attack Point", icon: "💥", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "service_error", label: "Service Error", icon: "❌", requiresPlayer: true, tone: "warning" },
    { eventType: "timeout", label: "Timeout", icon: "⏱️", tone: "info" },
    { eventType: "set_won", label: "Set Won", icon: "🏆", tone: "success" },
    { eventType: "rotation", label: "Rotation", icon: "🔄", tone: "info" },
  ],
  statLabels: { points: "Points", aces: "Aces", attack_points: "Attack Points" },
};

export const KABADDI_CONFIG: SportConfig = {
  key: "kabaddi",
  label: "Kabaddi",
  periods: ["live", "break", "completed"],
  quickActions: [
    { eventType: "raid_point", label: "Raid Point", icon: "🤾", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "bonus_point", label: "Bonus Point", icon: "⭐", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "touch_point", label: "Touch Point", icon: "✋", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "super_raid", label: "Super Raid", icon: "🔥", requiresPlayer: true, scoreDelta: 3, tone: "success" },
    { eventType: "super_tackle", label: "Super Tackle", icon: "🛡️", requiresPlayer: true, scoreDelta: 2, tone: "success" },
    { eventType: "all_out", label: "All Out", icon: "💯", scoreDelta: 2, tone: "success" },
    { eventType: "revival", label: "Revival", icon: "♻️", requiresPlayer: true, tone: "info" },
    { eventType: "timeout", label: "Timeout", icon: "⏱️", tone: "info" },
  ],
  statLabels: { raid_points: "Raid Points", tackle_points: "Tackle Points", touches: "Touches" },
};

export const BADMINTON_CONFIG: SportConfig = {
  key: "badminton",
  label: "Badminton",
  periods: ["live", "break", "completed"],
  quickActions: [
    { eventType: "point", label: "Point", icon: "🏸", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "smash_winner", label: "Smash Winner", icon: "💥", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "fault", label: "Fault", icon: "❌", requiresPlayer: true, tone: "warning" },
    { eventType: "challenge", label: "Challenge", icon: "📺", tone: "info" },
    { eventType: "game_won", label: "Game Won", icon: "🏆", tone: "success" },
  ],
  statLabels: { points: "Points", smash_winners: "Smash Winners" },
};

export const ESPORTS_CONFIG: SportConfig = {
  key: "esports",
  label: "Esports",
  periods: ["live", "break", "completed"],
  quickActions: [
    { eventType: "kill", label: "Kill", icon: "🎯", requiresPlayer: true, scoreDelta: 1, tone: "success" },
    { eventType: "death", label: "Death", icon: "💀", requiresPlayer: true, tone: "warning" },
    { eventType: "assist", label: "Assist", icon: "🤝", requiresPlayer: true, tone: "info" },
    { eventType: "knockout", label: "Knockout", icon: "🥊", requiresPlayer: true, tone: "success" },
    { eventType: "revive", label: "Revive", icon: "💉", requiresPlayer: true, tone: "info" },
    { eventType: "round_won", label: "Round Won", icon: "🏆", scoreDelta: 1, tone: "success" },
    { eventType: "damage", label: "Damage Dealt", icon: "💢", requiresPlayer: true, promptValue: true, tone: "info" },
  ],
  statLabels: { kills: "Kills", deaths: "Deaths", assists: "Assists", knockouts: "Knockouts", revives: "Revives" },
};

export const ESPORTS_GAMES = ["eFootball", "BGMI", "PUBG", "Free Fire", "Valorant", "Custom Game"];

export const SPORT_CONFIGS: Record<string, SportConfig> = {
  football: FOOTBALL_CONFIG,
  cricket: CRICKET_CONFIG,
  volleyball: VOLLEYBALL_CONFIG,
  kabaddi: KABADDI_CONFIG,
  badminton: BADMINTON_CONFIG,
  esports: ESPORTS_CONFIG,
};

export function getSportConfig(sportName: string): SportConfig {
  const normalized = sportName.toLowerCase().trim();
  return SPORT_CONFIGS[normalized] ?? FOOTBALL_CONFIG;
}
