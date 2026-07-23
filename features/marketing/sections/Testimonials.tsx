import { SectionTitle } from "../components/SectionTitle";
import { TestimonialCard } from "../components/TestimonialCard";
import { TESTIMONIALS } from "../data/content";

export function Testimonials() {
  return (
    <section className="bg-[var(--color-surface-alt)]/40 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Testimonials" title="Organizers who switched and stayed" />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.authorName} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
