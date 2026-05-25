import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/utils/motion"
import { testimonials } from "../data/home"
import { IconQuote } from "@tabler/icons-react"
import Image from "next/image"

const Testimonials = () => {
  return (
    <motion.section
      id="testimonials"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger}
      className="border-b bg-muted/40 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={fadeUp}
          className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Testimonials
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              Trusted by teams that need engineering momentum.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground lg:justify-self-end">
            Leaders bring us in when technical debt, unclear delivery, or
            scaling pressure starts slowing the business down.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <motion.article
              key={testimonial.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-80 flex-col justify-between border bg-card p-6"
            >
              <div>
                <IconQuote className="size-8 text-primary" />
                <p className="mt-6 text-lg leading-8 text-foreground">
                  “{testimonial.quote}”
                </p>
              </div>

              <div className="mt-8 border-t pt-5">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="mb-3 size-12 rounded-full object-cover"
                />
                <p className="font-semibold">{testimonial.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default Testimonials
