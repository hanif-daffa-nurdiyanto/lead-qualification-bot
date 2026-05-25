import { IconArrowRight, IconTerminal2 } from "@tabler/icons-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import navLinks from "@/utils/navLinks"

const Header = ({ type = "landing" }: { type?: "landing" | "contact" }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center border bg-primary text-primary-foreground">
            <IconTerminal2 className="size-5" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-wide">
            Nexora Consulting
          </span>
        </Link>

        {type === "landing" && (
          <>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {navLinks.slice(0, 4).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Button asChild size="sm">
              <Link href="/start-project">
                Start a Project
                <IconArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </>
        )}

        {type === "contact" && (
          <Button asChild size="sm">
            <Link href="mailto:hello@nexora.dev">
              Contact US
              <IconArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>
    </motion.header>
  )
}

export default Header
