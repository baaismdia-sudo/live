import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  id: string; full_name: string; photo_url: string | null; jersey_number: number | null; position: string | null; nationality: string | null;
}

export function PlayerCard({ player, slug, index = 0 }: { player: Player; slug: string; index?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * 0.04, 0.3) }}>
      <Link to={`/tournament/${slug}/players/${player.id}`} className="block rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center transition-shadow hover:shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
          {player.photo_url ? <img src={player.photo_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <User size={20} className="text-[var(--color-muted)]" />}
        </div>
        <p className="text-sm font-medium text-[var(--color-heading)]">{player.full_name}</p>
        <p className="text-xs text-[var(--color-muted)]">{[player.jersey_number && `#${player.jersey_number}`, player.position].filter(Boolean).join(" · ")}</p>
      </Link>
    </motion.div>
  );
}
