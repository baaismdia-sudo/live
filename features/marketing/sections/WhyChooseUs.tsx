import { SectionTitle } from "../components/SectionTitle";
import { FeatureCard } from "../components/FeatureCard";
import { WHY_CHOOSE_US } from "../data/content";

export function WhyChooseUs() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="Why TournamentLive" title="Built for organizers who'd rather run the tournament than the tech" />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {WHY_CHOOSE_US.map((item, i) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
