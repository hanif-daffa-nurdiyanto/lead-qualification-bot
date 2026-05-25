const dryRun = process.argv.includes("--dry-run")

const requiredEnv = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_NAME",
]

const missingEnv = requiredEnv.filter((key) => !process.env[key])

if (missingEnv.length > 0) {
  console.error(`Missing environment variables: ${missingEnv.join(", ")}`)
  process.exit(1)
}

const baseId = process.env.AIRTABLE_BASE_ID
const tableName = process.env.AIRTABLE_TABLE_NAME
const endpoint = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
  tableName
)}`

const seedLeads = [
  {
    name: "Raka Pratama",
    email: "raka.pratama@example.com",
    company: "Aruna Logistics",
    industry: "Logistics",
    painPoint:
      "Our dispatch workflow still depends on spreadsheets and manual status updates, causing slow delivery visibility for enterprise clients.",
    budget: "$15k+",
    timeline: "Immediately",
  },
  {
    name: "Maya Chen",
    email: "maya.chen@example.com",
    company: "FintechScale",
    industry: "Finance",
    painPoint:
      "We need to modernize a fragile customer onboarding system before expanding to a new compliance-heavy market.",
    budget: "$5k - $15k",
    timeline: "This month",
  },
  {
    name: "Dimas Wardana",
    email: "dimas.wardana@example.com",
    company: "KlinikHub",
    industry: "Healthcare",
    painPoint:
      "Patient appointment data is split across multiple tools and the operations team needs a reliable internal dashboard.",
    budget: "$5k - $15k",
    timeline: "This quarter",
  },
  {
    name: "Nadia Putri",
    email: "nadia.putri@example.com",
    company: "Learnora",
    industry: "Education",
    painPoint:
      "We have an MVP for cohort learning, but need help hardening payments, analytics, and admin workflows.",
    budget: "$2k - $5k",
    timeline: "This month",
  },
  {
    name: "Andre Saputra",
    email: "andre.saputra@example.com",
    company: "MarketNest",
    industry: "E-commerce",
    painPoint:
      "The team wants to connect inventory, order routing, and customer support into one operational view.",
    budget: "$5k - $15k",
    timeline: "This quarter",
  },
  {
    name: "Sofia Rahman",
    email: "sofia.rahman@example.com",
    company: "CloudLedger",
    industry: "SaaS",
    painPoint:
      "We need a technical audit before scaling our API usage and improving uptime guarantees for larger customers.",
    budget: "$15k+",
    timeline: "Immediately",
  },
  {
    name: "Bima Santoso",
    email: "bima.santoso@example.com",
    company: "Studio Orbit",
    industry: "Other",
    painPoint: "Need help estimating a new internal tool.",
    budget: "Under $2k",
    timeline: "Not sure yet",
  },
  {
    name: "Clara Wijaya",
    email: "clara.wijaya@example.com",
    company: "EduPay",
    industry: "Finance",
    painPoint:
      "Our current release process is slow and risky because testing, deployment, and rollback steps are mostly manual.",
    budget: "$2k - $5k",
    timeline: "This quarter",
  },
  {
    name: "Hana Kusuma",
    email: "hana.kusuma@example.com",
    company: "RetailPulse",
    industry: "E-commerce",
    painPoint:
      "We need to replace a slow reporting workflow with a dashboard that combines sales, stock, and fulfillment metrics.",
    budget: "$5k - $15k",
    timeline: "This month",
  },
  {
    name: "Kevin Hartono",
    email: "kevin.hartono@example.com",
    company: "FleetOps Asia",
    industry: "Logistics",
    painPoint:
      "Our mobile driver app is unstable during peak routing hours and we need an audit plus a practical improvement roadmap.",
    budget: "$15k+",
    timeline: "This quarter",
  },
  {
    name: "Laras Siregar",
    email: "laras.siregar@example.com",
    company: "Medvera",
    industry: "Healthcare",
    painPoint:
      "The clinical operations team needs secure integrations between scheduling, billing, and patient notification systems.",
    budget: "$15k+",
    timeline: "Immediately",
  },
  {
    name: "Oscar Lim",
    email: "oscar.lim@example.com",
    company: "DevMetric",
    industry: "SaaS",
    painPoint:
      "We want to redesign our multi-tenant architecture before onboarding larger enterprise customers.",
    budget: "$15k+",
    timeline: "This month",
  },
  {
    name: "Putri Amelia",
    email: "putri.amelia@example.com",
    company: "CampusFlow",
    industry: "Education",
    painPoint:
      "Admissions data is managed manually and leadership needs a cleaner portal for applicants, staff, and reporting.",
    budget: "$5k - $15k",
    timeline: "This quarter",
  },
  {
    name: "Reza Mahendra",
    email: "reza.mahendra@example.com",
    company: "PayKita",
    industry: "Finance",
    painPoint:
      "We need help improving observability and incident response across payment APIs before a merchant launch.",
    budget: "$5k - $15k",
    timeline: "Immediately",
  },
  {
    name: "Tania Wibowo",
    email: "tania.wibowo@example.com",
    company: "PeopleDesk",
    industry: "SaaS",
    painPoint:
      "Our HR workflow product needs a new integration layer for payroll, leave approvals, and employee records.",
    budget: "$2k - $5k",
    timeline: "This month",
  },
  {
    name: "Umar Fauzi",
    email: "umar.fauzi@example.com",
    company: "WarehousePro",
    industry: "Logistics",
    painPoint:
      "Inventory movements are delayed because warehouse scanners, ERP, and order data are not synchronized reliably.",
    budget: "$5k - $15k",
    timeline: "This quarter",
  },
  {
    name: "Vina Maharani",
    email: "vina.maharani@example.com",
    company: "CareLoop",
    industry: "Healthcare",
    painPoint:
      "We have a patient engagement prototype and need production-ready authentication, audit logs, and admin tools.",
    budget: "$2k - $5k",
    timeline: "This month",
  },
  {
    name: "William Tan",
    email: "william.tan@example.com",
    company: "InsightCart",
    industry: "E-commerce",
    painPoint:
      "Marketing and operations teams need one source of truth for product performance, customer cohorts, and campaign ROI.",
    budget: "$15k+",
    timeline: "Immediately",
  },
  {
    name: "Yusuf Akbar",
    email: "yusuf.akbar@example.com",
    company: "CivicTools",
    industry: "Other",
    painPoint:
      "We are exploring a citizen service platform and need help shaping technical scope before requesting funding.",
    budget: "Not sure yet",
    timeline: "Not sure yet",
  },
  {
    name: "Zahra Lestari",
    email: "zahra.lestari@example.com",
    company: "SkillBridge",
    industry: "Education",
    painPoint:
      "The team wants to migrate from a no-code learning portal to a custom platform with payments and analytics.",
    budget: "$5k - $15k",
    timeline: "This month",
  },
]

function statusFromScore(score) {
  if (score >= 75) {
    return "Hot"
  }

  if (score >= 45) {
    return "Warm"
  }

  return "Cold"
}

function qualify(lead) {
  const timelineScores = {
    Immediately: 30,
    "This month": 25,
    "This quarter": 15,
    "Not sure yet": 5,
  }

  const budgetScores = {
    "Under $2k": 5,
    "$2k - $5k": 15,
    "$5k - $15k": 25,
    "$15k+": 35,
    "Not sure yet": 10,
  }

  let score = 0

  score += lead.painPoint.length >= 20 ? 20 : 10
  score += lead.company ? 10 : 0
  score += lead.email ? 10 : 0
  score += timelineScores[lead.timeline] ?? 10
  score += budgetScores[lead.budget] ?? 10

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)))

  return {
    score: normalizedScore,
    status: statusFromScore(normalizedScore),
  }
}

function createdAt(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  return date.toISOString().slice(0, 10)
}

function toRecord(lead, index) {
  const qualification = qualify(lead)

  return {
    fields: {
      Name: lead.name,
      Email: lead.email,
      Company: lead.company,
      Industry: lead.industry,
      "Pain Point": lead.painPoint,
      Budget: lead.budget,
      Timeline: lead.timeline,
      Score: qualification.score,
      Status: qualification.status,
      Source: "Landing Page Chatbot",
      "Created At": createdAt(index),
    },
  }
}

function chunk(array, size) {
  const chunks = []

  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size))
  }

  return chunks
}

async function seedAirtable() {
  const records = seedLeads.map(toRecord)

  if (dryRun) {
    console.log(JSON.stringify({ records }, null, 2))
    return
  }

  let inserted = 0

  for (const batch of chunk(records, 10)) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: batch }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(
        `Airtable insert failed: ${response.status} ${response.statusText}\n${body}`
      )
    }

    const payload = await response.json()
    inserted += Array.isArray(payload.records) ? payload.records.length : 0
  }

  console.log(`Inserted ${inserted} seed leads into Airtable.`)
}

seedAirtable().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
