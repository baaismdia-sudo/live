import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  imageEmoji: string;
}

export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-lg"
      >
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[var(--color-brand)]/10 to-[var(--color-accent)]/10 text-5xl">
          {post.imageEmoji}
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{post.category}</p>
          <h3 className="mt-2 font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-brand)]">
            {post.title}
          </h3>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">{post.date}</p>
        </div>
      </Link>
    </motion.div>
  );
}
