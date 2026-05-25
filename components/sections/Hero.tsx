import { motion } from "framer-motion"
import { Button } from "../ui/button"
import {
  IconArrowRight,
  IconBrandGithub,
  IconChartBar,
  IconCheck,
  IconLock,
  IconRocket,
} from "@tabler/icons-react"
import { fadeUp, stagger } from "@/utils/motion"
import { metrics } from "../data/home"

const Hero = () => {
  return (
    <section className="overflow-hidden border-b">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mb-6 inline-flex items-center gap-2 border bg-muted px-3 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              <IconSparkles className="size-4 text-primary" />
              IT consulting for teams that need to move faster
            </motion.div> */}

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-heading text-5xl font-semibold tracking-normal text-balance sm:text-6xl lg:text-7xl"
          >
            Build digital systems that are stable, fast, and ready to scale.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
          >
            We help companies clean up architecture, accelerate engineering
            delivery, and turn product ideas into systems teams can operate with
            confidence.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <a href="#contact">
                Book a Free Consultation
                <IconArrowRight data-icon="inline-end" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#services">Explore Services</a>
            </Button>
          </motion.div>

          <motion.div
            variants={stagger}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-10 grid gap-4 border-t pt-6 sm:grid-cols-3"
          >
            {metrics.map((metric) => (
              <motion.div key={metric.label} variants={fadeUp}>
                <div className="font-heading text-3xl font-semibold">
                  {metric.value}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 36, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="border bg-card shadow-2xl shadow-primary/10"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 bg-destructive" />
                <span className="size-2.5 bg-amber-400" />
                <span className="size-2.5 bg-emerald-500" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Live Delivery Ops
              </span>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-4">
                <div className="border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Release Health
                    </span>
                    <IconLock className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    {[54, 78, 64, 90, 72, 96].map((height, index) => (
                      <motion.span
                        key={height + index}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{
                          duration: 0.7,
                          delay: 0.45 + index * 0.08,
                          ease: "easeOut",
                        }}
                        className="w-full bg-primary"
                      />
                    ))}
                  </div>
                </div>

                <div className="border bg-background p-4">
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Sprint Focus
                  </span>
                  <div className="mt-4 space-y-3">
                    {["API Gateway", "Data Pipeline", "Access Control"].map(
                      (item) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.65 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="flex size-5 items-center justify-center bg-emerald-500 text-white">
                            <IconCheck className="size-3.5" />
                          </span>
                          {item}
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border bg-primary p-5 text-primary-foreground">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
                        System Readiness
                      </p>
                      <p className="mt-4 font-heading text-5xl font-semibold">
                        92
                      </p>
                    </div>
                    <IconChartBar className="size-10 opacity-80" />
                  </div>
                  <div className="mt-6 h-2 bg-primary-foreground/20">
                    <motion.div
                      initial={{ width: 0 }}
                      // animate={{ width: "92%" }}
                      transition={{ duration: 0.9, delay: 0.5 }}
                      className="h-full bg-primary-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border bg-background p-4">
                    <IconRocket className="size-5 text-primary" />
                    <p className="mt-5 text-2xl font-semibold">18 days</p>
                    <p className="text-sm text-muted-foreground">
                      to first release
                    </p>
                  </div>
                  <div className="border bg-background p-4">
                    <IconBrandGithub className="size-5 text-primary" />
                    <p className="mt-5 text-2xl font-semibold">124</p>
                    <p className="text-sm text-muted-foreground">
                      pull requests reviewed
                    </p>
                  </div>
                </div>

                <div className="border bg-background p-4">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Incident Response
                  </p>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {[
                      "bg-emerald-500",
                      "bg-emerald-500",
                      "bg-primary",
                      "bg-amber-400",
                      "bg-emerald-500",
                    ].map((color, index) => (
                      <motion.span
                        key={color + index}
                        initial={{ opacity: 0, scaleY: 0.4 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.7 + index * 0.08,
                        }}
                        className={`h-12 origin-bottom ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
export default Hero
