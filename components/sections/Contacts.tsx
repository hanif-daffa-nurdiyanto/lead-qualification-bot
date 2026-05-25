import { motion } from "framer-motion"
import { IconArrowRight } from "@tabler/icons-react"
import { Button } from "../ui/button"

const Contacts = () => {
  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 border bg-foreground p-6 text-background sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-70">
              Ready to start?
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              Tell us the technical challenge you want to solve.
            </h2>
            <p className="mt-4 max-w-2xl leading-8 opacity-75">
              In the first session, we help map the priorities, risks, and first
              move that will create the most business impact.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <a href="mailto:hello@nexora.dev">
              hello@nexora.dev
              <IconArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

export default Contacts
