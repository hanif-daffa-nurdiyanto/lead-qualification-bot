import navLinks from "@/utils/navLinks"
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconTerminal2,
} from "@tabler/icons-react"
import { Button } from "../ui/button"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center border bg-primary text-primary-foreground">
              <IconTerminal2 className="size-5" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-wide">
              Nexora Consulting
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Senior engineering support for companies that need better systems,
            clearer delivery, and stronger technical foundations.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Navigate
          </p>
          <div className="mt-4 grid gap-3 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Connect
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="icon-sm">
              <a href="mailto:hello@nexora.dev" aria-label="Email">
                <IconMail />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon-sm">
              <a href="https://github.com" aria-label="GitHub">
                <IconBrandGithub />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon-sm">
              <a href="https://linkedin.com" aria-label="LinkedIn">
                <IconBrandLinkedin />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Nexora Consulting. All rights reserved.</p>
          <p>Strategy, engineering, cloud, and security consulting.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
