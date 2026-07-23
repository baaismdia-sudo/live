import { SectionTitle } from "../components/SectionTitle";
import { FeatureCard } from "../components/FeatureCard";
import { FEATURES } from "../data/content";

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Features"
          title="Everything a tournament website needs"
          subtitle="Built for organizers, scorekeepers, and fans — all in one platform."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
