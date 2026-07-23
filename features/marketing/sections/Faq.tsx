import { SectionTitle } from "../components/SectionTitle";
import { FAQAccordion } from "../components/FAQAccordion";
import { FaqSchema } from "../../../components/seo/Seo";
import { FAQS } from "../data/content";

export function Faq() {
  return (
    <section className="px-6 py-24">
      <FaqSchema items={FAQS} />
      <div className="mx-auto max-w-2xl">
        <SectionTitle eyebrow="FAQ" title="Questions organizers ask us" />
        <div className="mt-10">
          <FAQAccordion items={FAQS} />
        </div>
      </div>
    </section>
  );
}
