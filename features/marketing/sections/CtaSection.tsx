import { motion } from "framer-motion";
import { Button } from "../components/Button";

export function CtaSection() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl bg-[var(--color-brand)] px-8 py-16 text-center text-white"
      >
        <h2 className="text-3xl font-semibold sm:text-4xl">Ready to run your next tournament online?</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Set up your branded tournament website in minutes — live scores, fixtures, and sponsors included.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/register" variant="secondary" size="lg" className="!bg-white !text-[var(--color-brand)]">
            Create tournament
          </Button>
          <Button href="/contact" variant="ghost" size="lg" className="!border-white/40 !text-white hover:!bg-white/10">
            Book a demo
          </Button>
          <Button href="/contact" variant="ghost" size="lg" className="!border-white/40 !text-white hover:!bg-white/10">
            Contact sales
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
