import { fadeUp, stagger } from "@/utils/motion"
import { motion } from "framer-motion"
import { services } from "../data/home"

const Services = () => {
  return (
    <motion.section
      id="services"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="border-b py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div variants={fadeUp} className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Services
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
            Technical solutions that connect directly to business priorities.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <motion.article
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="border bg-card p-6"
              >
                <Icon className="size-7 text-primary" />
                <h3 className="mt-6 text-lg font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

export default Services
