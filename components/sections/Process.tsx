import { fadeUp, stagger } from "@/utils/motion"
import { motion } from "framer-motion"
import { process } from "../data/home"

const Process = () => {
  return (
    <motion.section
      id="process"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger}
      className="border-b bg-muted/40 py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={fadeUp}>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Process
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            Turn technical friction into a measurable execution plan.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Every engagement starts with business context, team constraints, and
            the technical reality. The outcome is not just advice, but shipped
            systems, useful documentation, and a delivery rhythm your team can
            continue.
          </p>
        </motion.div>

        <div className="grid gap-3">
          {process.map((item, index) => (
            <motion.div
              key={item}
              variants={fadeUp}
              whileHover={{ x: 6 }}
              className="flex items-center gap-4 border bg-background p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="font-medium">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default Process
