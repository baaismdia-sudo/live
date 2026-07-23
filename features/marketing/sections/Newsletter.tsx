import { SectionTitle } from "../components/SectionTitle";
import { NewsletterForm } from "../components/NewsletterForm";

export function Newsletter() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
        <SectionTitle eyebrow="Newsletter" title="Tips for running better tournaments" subtitle="One email a month. No spam, ever." />
        <div className="relative">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
