import { motion } from "framer-motion";

export interface Testimonial {
  authorName: string;
  authorRole: string;
  message: string;
  rating: number;
  avatarInitial: string;
  verified?: boolean;
}

export function TestimonialCard({ testimonial, index = 0 }: { testimonial: Testimonial; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div className="mb-3 flex text-[var(--color-warning)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} aria-hidden="true">{i < testimonial.rating ? "★" : "☆"}</span>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-text)]">"{testimonial.message}"</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 font-semibold text-[var(--color-brand)]">
          {testimonial.avatarInitial}
        </div>
        <div>
          <p className="flex items-center gap-1 text-sm font-medium text-[var(--color-text)]">
            {testimonial.authorName}
            {testimonial.verified && <span className="text-xs text-[var(--color-success)]" title="Verified">✓</span>}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{testimonial.authorRole}</p>
        </div>
      </div>
    </motion.div>
  );
}
