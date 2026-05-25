"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  IconArrowLeft,
  IconArrowRight,
  IconEdit,
  IconRefresh,
  IconSend,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import Header from "./Header"
import Link from "next/link"

type LeadStatus = "Cold" | "Warm" | "Hot"

type LeadForm = {
  name: string
  email: string
  company: string
  industry: string
  painPoint: string
  budget: string
  timeline: string
}

type StepId =
  | "painPoint"
  | "industry"
  | "company"
  | "budget"
  | "timeline"
  | "name"
  | "email"

type LeadStep = {
  id: StepId
  field: keyof LeadForm
  title: string
  description: string
  inputType: "text" | "textarea" | "email" | "options"
  options?: string[]
}

type SubmitResult = {
  score: number
  status: LeadStatus
}

const SOURCE = "Start Project Page"

const initialForm: LeadForm = {
  name: "",
  email: "",
  company: "",
  industry: "",
  painPoint: "",
  budget: "",
  timeline: "",
}

const steps: LeadStep[] = [
  {
    id: "painPoint",
    field: "painPoint",
    title: "What should we help you solve?",
    description:
      "Describe the business problem, product idea, or system issue you want to move forward.",
    inputType: "textarea",
  },
  {
    id: "industry",
    field: "industry",
    title: "Which industry best matches your company?",
    description: "This helps us route your project to the right context.",
    inputType: "options",
    options: [
      "SaaS",
      "Finance",
      "Healthcare",
      "Logistics",
      "E-commerce",
      "Education",
      "Other",
    ],
  },
  {
    id: "company",
    field: "company",
    title: "What company is this for?",
    description: "Use your company or team name.",
    inputType: "text",
  },
  {
    id: "budget",
    field: "budget",
    title: "What budget range are you considering?",
    description: "A close estimate is enough for qualification.",
    inputType: "options",
    options: ["Under $2k", "$2k - $5k", "$5k - $15k", "$15k+", "Not sure yet"],
  },
  {
    id: "timeline",
    field: "timeline",
    title: "When do you want to start?",
    description: "Timeline helps us understand urgency and team availability.",
    inputType: "options",
    options: ["Immediately", "This month", "This quarter", "Not sure yet"],
  },
  {
    id: "name",
    field: "name",
    title: "Who should we contact?",
    description: "Add your name so our team can follow up personally.",
    inputType: "text",
  },
  {
    id: "email",
    field: "email",
    title: "Where should we send the next step?",
    description: "Use a valid work email if possible.",
    inputType: "email",
  },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labels: Record<keyof LeadForm, string> = {
  name: "Name",
  email: "Email",
  company: "Company",
  industry: "Industry",
  painPoint: "Project Need",
  budget: "Budget",
  timeline: "Timeline",
}

const LeadQualificationForm = () => {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<LeadForm>(initialForm)
  const [error, setError] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const fieldRef = useRef<HTMLElement | null>(null)

  const currentStep = steps[stepIndex]
  const progress = isReviewing
    ? 100
    : Math.round(((stepIndex + 1) / steps.length) * 100)

  useEffect(() => {
    if (isReviewing || result || currentStep.inputType === "options") {
      return
    }

    fieldRef.current?.focus()
  }, [currentStep.inputType, isReviewing, result, stepIndex])

  const updateField = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError("")
  }

  const validateStep = () => {
    const value = form[currentStep.field].trim()

    if (!value) {
      setError("Please complete this field before continuing.")
      return false
    }

    if (currentStep.field === "email" && !emailPattern.test(value)) {
      setError("Please enter a valid email address.")
      return false
    }

    return true
  }

  const goNext = () => {
    if (!validateStep()) {
      return
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1)
      return
    }

    setIsReviewing(true)
  }

  const goBack = () => {
    setError("")

    if (isReviewing) {
      setIsReviewing(false)
      return
    }

    setStepIndex((current) => Math.max(current - 1, 0))
  }

  const editStep = (id: StepId) => {
    const nextIndex = steps.findIndex((step) => step.id === id)
    setStepIndex(nextIndex)
    setIsReviewing(false)
    setError("")
  }

  const resetFlow = () => {
    setStepIndex(0)
    setForm(initialForm)
    setError("")
    setIsReviewing(false)
    setIsSubmitting(false)
    setResult(null)
  }

  const submitLead = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: SOURCE,
        }),
      })

      const payload = (await response.json()) as
        | { ok: true; lead: SubmitResult }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to submit lead." : payload.error)
      }

      setResult(payload.lead)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to submit lead."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isReviewing) {
      void submitLead()
      return
    }

    goNext()
  }

  if (result) {
    return (
      <>
        <Header type="contact" />
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid min-h-[calc(100svh-14rem)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Project qualified
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold text-balance sm:text-6xl">
                Your project brief has been sent to our team.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                We will get back to contact you within 24 hours.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={resetFlow}
                >
                  Start another project
                  <IconRefresh data-icon="inline-end" />
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/">CONTACT US DIRECTLY</Link>
                </Button>
              </div>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
              className="border bg-background p-5 shadow-2xl shadow-primary/10 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="border bg-card p-5">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Lead Score
                  </p>
                  <p className="mt-5 font-heading text-6xl font-semibold">
                    {result.score}
                  </p>
                </div>
                <div className="border bg-card p-5">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Status
                  </p>
                  <p className="mt-5 flex items-center gap-2 text-2xl font-semibold">
                    <IconCircleCheck className="size-6 text-emerald-500" />
                    {result.status}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="grid gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {labels[step.field]}
                    </span>
                    <span className="text-sm leading-6">{form[step.field]}</span>
                  </div>
                ))}
              </div>

             
            </motion.div> */}
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur"
      >
        <div className="mx-auto max-w-7xl border-b p-5 sm:p-6">
          <p className="flex-1 font-bold md:hidden">
            Tell us about your project
          </p>
          <div className="flex items-center justify-between gap-4">
            <p className="hidden flex-1 font-bold md:block">
              Tell us about your project
            </p>
            <div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isReviewing
                  ? "Review your brief before submission."
                  : `Step ${stepIndex + 1} of ${steps.length}`}
              </p>
            </div>
            <span className="flex-1 text-right font-heading text-3xl font-semibold">
              {progress}%
            </span>
          </div>
          <div className="mt-5 h-2 bg-muted">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </motion.header>
      <div className="mx-auto grid min-h-[calc(100svh-14rem)] max-w-7xl gap-10 lg:items-center">
        {/* <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Start a Project
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-balance sm:text-6xl">
            Tell us what you need. We will qualify the fit before the first
            call.
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Share the project context, budget, and timeline in a focused intake
            flow. The form sends your brief to the same qualification pipeline,
            without using the chat widget.
          </p>

          <div className="mt-8 grid gap-3 border-t pt-6 sm:grid-cols-3">
            {[
              ["2 min", "typical completion"],
              [`${completedFields}/${steps.length}`, "fields completed"],
              ["AI + rules", "qualification"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-heading text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className=""
        >
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {isReviewing ? (
              <div>
                <h2 className="font-heading text-3xl font-semibold">
                  Review project brief
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Confirm everything below before we submit it for
                  qualification.
                </p>

                <div className="mt-6 grid gap-3">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => editStep(step.id)}
                      className="grid gap-2 border bg-card p-4 text-left transition hover:border-primary"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                          {labels[step.field]}
                        </span>
                        <IconEdit className="size-4 text-muted-foreground" />
                      </span>
                      <span className="text-sm leading-6">
                        {form[step.field]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-heading text-3xl font-semibold text-balance">
                  {currentStep.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {currentStep.description}
                </p>

                <div className="mt-6">
                  {currentStep.inputType === "textarea" ? (
                    <textarea
                      ref={(node) => {
                        fieldRef.current = node
                      }}
                      value={form[currentStep.field]}
                      onChange={(event) =>
                        updateField(currentStep.field, event.target.value)
                      }
                      autoFocus
                      rows={7}
                      className="min-h-48 w-full resize-none border bg-card px-4 py-3 text-sm leading-6 transition outline-none focus:border-primary"
                    />
                  ) : currentStep.inputType === "options" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentStep.options?.map((option) => {
                        const isSelected = form[currentStep.field] === option

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              updateField(currentStep.field, option)
                            }
                            className={`min-h-13 border px-4 py-3 text-left text-sm font-semibold transition ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-card text-foreground hover:border-primary"
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      ref={(node) => {
                        fieldRef.current = node
                      }}
                      value={form[currentStep.field]}
                      onChange={(event) =>
                        updateField(currentStep.field, event.target.value)
                      }
                      type={currentStep.inputType}
                      autoFocus
                      className="h-12 w-full border bg-card px-4 text-sm transition outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm leading-6 text-destructive">{error}</p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={!isReviewing && stepIndex === 0}
              >
                <IconArrowLeft data-icon="inline-start" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isReviewing
                  ? isSubmitting
                    ? "Submitting..."
                    : "Submit project"
                  : "NEXT"}
                {isReviewing ? (
                  <IconSend data-icon="inline-end" />
                ) : (
                  <IconArrowRight data-icon="inline-end" />
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}

export default LeadQualificationForm
