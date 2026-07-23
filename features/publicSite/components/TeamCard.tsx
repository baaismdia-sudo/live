import { Link } from "react-router-dom";
import { ShieldHalf } from "lucide-react";
import { motion } from "framer-motion";

interface Team {
  id: string; name: string; logo_url: string | null; coach_name: string | null; manager_name: string | null;
}

export function TeamCard({ team, slug, index = 0 }: { team: Team; slug: string; index?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
      <Link to={`/tournament/${slug}/teams/${team.id}`} className="block rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center transition-shadow hover:shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
          {team.logo_url ? <img src={team.logo_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <ShieldHalf size={24} className="text-[var(--color-muted)]" />}
        </div>
        <p className="font-medium text-[var(--color-heading)]">{team.name}</p>
        {team.coach_name && <p className="mt-1 text-xs text-[var(--color-muted)]">Coach: {team.coach_name}</p>}
      </Link>
    </motion.div>
  );
}
