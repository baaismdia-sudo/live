import { SectionTitle } from "../components/SectionTitle";
import { BlogCard } from "../components/BlogCard";
import { Button } from "../components/Button";
import { BLOG_POSTS } from "../data/content";

export function BlogPreview() {
  return (
    <section className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="From the blog" title="Guides for running a better tournament" />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {BLOG_POSTS.map((p, i) => (
            <BlogCard key={p.slug} post={p} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button to="/blog" variant="ghost">Read all posts</Button>
        </div>
      </div>
    </section>
  );
}
