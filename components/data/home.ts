import {
  IconCloudCog,
  IconDeviceAnalytics,
  IconServerCog,
  IconShieldCheck,
} from "@tabler/icons-react"

const metrics = [
  { value: "42%", label: "average cycle-time reduction" },
  { value: "99.9%", label: "uptime target for critical workloads" },
  { value: "3x", label: "faster path from idea to release" },
]

const services = [
  {
    icon: IconServerCog,
    title: "System Modernization",
    description:
      "Architecture audits, incremental refactors, and stack migration plans that keep the business running.",
  },
  {
    icon: IconCloudCog,
    title: "Cloud & DevOps",
    description:
      "CI/CD pipelines, observability, autoscaling, backups, and environments your product team can trust.",
  },
  {
    icon: IconShieldCheck,
    title: "Security Review",
    description:
      "Application hardening, access reviews, threat modeling, and practical fixes your engineers can ship.",
  },
  {
    icon: IconDeviceAnalytics,
    title: "Product Engineering",
    description:
      "MVPs, operations dashboards, API integrations, and internal systems built cleanly from day one.",
  },
]

const process = [
  "Technical discovery and risk mapping",
  "A realistic 30-60-90 day roadmap",
  "Sprint execution with clear documentation",
  "Handover, training, and operating metrics",
]

const outcomes = [
  "Architecture becomes easier to reason about and maintain.",
  "Product delivery gains priorities, metrics, and clear ownership.",
  "Cloud spending becomes more controlled without sacrificing performance.",
  "Internal teams leave with documentation and knowledge transfer.",
]

const testimonials = [
  {
    quote:
      "Nexora helped us move from a fragile prototype to a production system with clear ownership, observability, and a release process the whole team understands.",
    name: "Maya Chen",
    role: "CTO, FintechScale",
    avatar: "/img/testimonials/image1.jpeg",
  },
  {
    quote:
      "The engagement was practical from day one. We got architectural clarity, a realistic migration plan, and hands-on support that unblocked our engineers.",
    name: "Daniel Hart",
    role: "VP Engineering, Logistiq",
    avatar: "/img/testimonials/image2.jpeg",
  },
  {
    quote:
      "They connected technical decisions to business impact. Our cloud bill dropped, deployment confidence improved, and incident response became far more predictable.",
    name: "Aisha Rahman",
    role: "Founder, OperateHQ",
    avatar: "/img/testimonials/image3.jpeg",
  },
]

export { metrics, services, process, outcomes, testimonials }
