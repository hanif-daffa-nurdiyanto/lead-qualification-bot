import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/utils/motion"
import { outcomes } from "../data/home"
import { IconCheck } from "@tabler/icons-react"

const Results = () => {
  return (
    <motion.section
      id="results"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger}
      className="border-b py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Results
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            Built for founders, CTOs, and operations teams.
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {outcomes.map((item) => (
            <motion.div
              key={item}
              variants={fadeUp}
              className="flex gap-4 border bg-card p-5"
            >
              <IconCheck className="mt-1 size-5 shrink-0 text-emerald-500" />
              <p className="leading-7 text-muted-foreground">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default Results
