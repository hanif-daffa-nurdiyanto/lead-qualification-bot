"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  IconChevronDown,
  IconMessageChatbot,
  IconSend,
  IconUser,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

type LeadForm = {
  name: string
  email: string
  company: string
  industry: string
  painPoint: string
  budget: string
  timeline: string
}

type ChatMessage = {
  id: string
  from: "bot" | "lead"
  text: string
}

type ChatbotPayload =
  | {
      ok: true
      reply: string
      lead: LeadForm
      isComplete: boolean
      fieldProgress: Record<keyof LeadForm, boolean>
      missingFields: Array<keyof LeadForm>
    }
  | { ok: false; error: string }

const SOURCE = "Landing Page Chatbot"

const initialForm: LeadForm = {
  name: "",
  email: "",
  company: "",
  industry: "",
  painPoint: "",
  budget: "",
  timeline: "",
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    from: "bot",
    text: "Hi, I'm Nexa, tell me about the project you want to build or improve.",
  },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getFieldProgress = (lead: LeadForm) => ({
  name: Boolean(lead.name),
  email: emailPattern.test(lead.email),
  company: Boolean(lead.company),
  industry: Boolean(lead.industry),
  painPoint: Boolean(lead.painPoint),
  budget: Boolean(lead.budget),
  timeline: Boolean(lead.timeline),
})

const getMissingFields = (lead: LeadForm) => {
  const progress = getFieldProgress(lead)

  return (Object.keys(progress) as Array<keyof LeadForm>).filter(
    (field) => !progress[field]
  )
}

const isCompleteLead = (lead: LeadForm) => getMissingFields(lead).length === 0

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [form, setForm] = useState<LeadForm>(initialForm)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [isBotThinking, setIsBotThinking] = useState(false)
  const hasSubmittedRef = useRef(false)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      })
    }

    scrollToBottom()
    const animationFrame = requestAnimationFrame(scrollToBottom)
    const timeout = window.setTimeout(scrollToBottom, 260)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [error, isBotThinking, isOpen, messages.length])

  const submitLead = async (lead: LeadForm) => {
    setError("")
    console.info("[ChatBotWidget] Submitting lead to Airtable", {
      fieldProgress: getFieldProgress(lead),
      missingFields: getMissingFields(lead),
    })

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...lead,
          source: SOURCE,
        }),
      })

      const payload = (await response.json()) as
        | { ok: true; lead: { score: number; status: string } }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to submit lead." : payload.error)
      }

      console.info("[ChatBotWidget] Lead submitted to Airtable", {
        score: payload.lead.score,
        status: payload.lead.status,
      })

      return
    } catch (caughtError) {
      hasSubmittedRef.current = false
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to submit lead."
      )
      console.error("[ChatBotWidget] Airtable submit failed", {
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to submit lead.",
        fieldProgress: getFieldProgress(lead),
        missingFields: getMissingFields(lead),
      })
      setMessages((current) => [
        ...current,
        {
          id: `submit-error-${Date.now()}`,
          from: "bot",
          text: "I have the details, but something went wrong while sending them. Please try again in a moment.",
        },
      ])
    }
  }

  const askBot = async (nextMessages: ChatMessage[]) => {
    setIsBotThinking(true)
    setError("")

    try {
      const response = await fetch("/api/chatbot-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ from, text }) => ({ from, text })),
          lead: form,
        }),
      })

      const payload = (await response.json()) as ChatbotPayload

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to continue chat." : payload.error)
      }

      setForm(payload.lead)
      console.info("[ChatBotWidget] Lead field progress", {
        fieldProgress: payload.fieldProgress,
        missingFields: payload.missingFields,
        isCompleteFromApi: payload.isComplete,
        isCompleteLocally: isCompleteLead(payload.lead),
      })
      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          from: "bot",
          text: payload.reply,
        },
      ])
      setIsBotThinking(false)

      if (
        (payload.isComplete || isCompleteLead(payload.lead)) &&
        !hasSubmittedRef.current
      ) {
        hasSubmittedRef.current = true
        await submitLead(payload.lead)
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to continue chat."
      )
      setMessages((current) => [
        ...current,
        {
          id: `chat-error-${Date.now()}`,
          from: "bot",
          text: "Sorry, I could not process that. Please send the message again.",
        },
      ])
    } finally {
      setIsBotThinking(false)
    }
  }

  const handleSubmitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = draft.trim()

    if (!text || isBotThinking) {
      return
    }

    const leadMessage: ChatMessage = {
      id: `lead-${Date.now()}`,
      from: "lead",
      text,
    }
    const nextMessages = [...messages, leadMessage]

    setMessages(nextMessages)
    setDraft("")
    void askBot(nextMessages)
  }

  return (
    <div className="fixed right-4 bottom-6 z-80 sm:right-6 sm:bottom-10">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-97.5 overflow-hidden border bg-card shadow-2xl shadow-primary/20"
          >
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
                  <IconMessageChatbot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Nexa</p>
                  <p className="text-xs text-muted-foreground">
                    Nexora Assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <IconX className="size-4" />
              </button>
            </div>

            <div
              ref={chatBodyRef}
              className="h-[calc(100vh-28rem)] space-y-4 overflow-y-auto p-4"
            >
              {messages.map((message, index) => {
                const isLead = message.from === "lead"

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.03 }}
                    className={`flex gap-2 ${isLead ? "justify-end" : ""}`}
                  >
                    {!isLead && (
                      <span className="flex size-7 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                        <IconMessageChatbot className="size-4" />
                      </span>
                    )}

                    <div
                      className={`max-w-[82%] border p-3 ${
                        isLead
                          ? "bg-primary text-primary-foreground"
                          : "bg-background"
                      }`}
                    >
                      <p className="text-sm leading-6">{message.text}</p>
                    </div>

                    {isLead && (
                      <span className="flex size-7 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                        <IconUser className="size-4" />
                      </span>
                    )}
                  </motion.div>
                )
              })}

              {isBotThinking && (
                <div className="flex gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                    <IconMessageChatbot className="size-4" />
                  </span>
                  <div className="border bg-background p-3">
                    <p className="text-sm leading-6">Typing...</p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs leading-5 text-destructive">{error}</p>
              )}

              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSubmitAnswer}
              className="border-t bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message..."
                  disabled={isBotThinking}
                  className="h-10 min-w-0 flex-1 border bg-card px-3 text-sm transition outline-none focus:border-primary disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isBotThinking || !draft.trim()}
                  aria-label="Send message"
                >
                  <IconSend />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={isOpen ? "Minimize lead bot" : "Open lead bot"}
        onClick={() => setIsOpen((current) => !current)}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        className="ml-auto flex h-14 items-center gap-3 border bg-primary px-4 font-semibold text-primary-foreground shadow-xl shadow-primary/20"
      >
        <span className="relative flex size-7 items-center justify-center">
          <IconMessageChatbot className="size-6" />
          <span className="absolute -top-0.5 -right-0.5 size-2.5 bg-emerald-400" />
        </span>
        <span className="hidden text-sm sm:inline">
          {isOpen ? "Minimize" : "Ask Nexa"}
        </span>
        {isOpen ? (
          <IconChevronDown className="size-4" />
        ) : (
          <IconSend className="size-4" />
        )}
      </motion.button>
    </div>
  )
}

export default ChatBotWidget
