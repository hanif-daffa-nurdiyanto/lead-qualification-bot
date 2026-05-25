"use client"

import {
  Header,
  Hero,
  Services,
  Process,
  Results,
  Testimonials,
  Contacts,
  Footer,
  ChatBotWidget,
} from "components/sections"

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Header />
      <Hero />
      <Services />
      <Process />
      <Results />
      <Testimonials />
      <Contacts />
      <Footer />
      <ChatBotWidget />
    </main>
  )
}
