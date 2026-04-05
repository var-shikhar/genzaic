import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { categories, tags } from "./schema"

// ─── DB Connection ────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for seeding")
}

const sql = neon(DATABASE_URL)
const db = drizzle(sql)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Category Seed Data ───────────────────────────────────────────────────────
interface CategorySeed {
  name: string
  description?: string
  children?: CategorySeed[]
}

const CATEGORY_TREE: CategorySeed[] = [
  {
    name: "Templates & Themes",
    description:
      "Ready-to-use templates and themes for websites, apps, and more",
    children: [
      { name: "Website Templates", description: "HTML, CSS, and full-stack website templates" },
      { name: "App UI Kits", description: "Mobile and web app UI component kits" },
      { name: "Email Templates", description: "Responsive email and newsletter templates" },
      { name: "Presentation Templates", description: "Slide decks and pitch deck templates" },
      { name: "Landing Pages", description: "High-converting landing page templates" },
    ],
  },
  {
    name: "Courses & Education",
    description: "Educational content, courses, and learning materials",
    children: [
      { name: "Video Courses", description: "Structured video-based learning programs" },
      { name: "Tutorials", description: "Step-by-step instructional guides" },
      { name: "Workshops", description: "Interactive workshop recordings and materials" },
      { name: "E-books & Guides", description: "Digital books and comprehensive guides" },
      { name: "Cheat Sheets", description: "Quick reference cards and cheat sheets" },
    ],
  },
  {
    name: "Software & Code",
    description: "Software tools, code snippets, and developer resources",
    children: [
      { name: "Plugins & Extensions", description: "Browser and app plugins and extensions" },
      { name: "Scripts & Snippets", description: "Ready-to-use code scripts and snippets" },
      { name: "SaaS Tools", description: "Software-as-a-service tool access" },
      { name: "APIs & Libraries", description: "API access and code libraries" },
      { name: "Boilerplates", description: "Starter kits and project boilerplates" },
    ],
  },
  {
    name: "Design Assets",
    description: "Graphics, illustrations, and visual design resources",
    children: [
      { name: "Graphics & Illustrations", description: "Vector graphics and digital illustrations" },
      { name: "Icons & Icon Packs", description: "Icon sets and icon libraries" },
      { name: "Fonts & Typography", description: "Custom fonts and typographic assets" },
      { name: "Mockups", description: "Product and device mockup templates" },
      { name: "Stock Photos & Videos", description: "Licensed stock photography and video" },
      { name: "3D Assets", description: "3D models, textures, and scenes" },
    ],
  },
  {
    name: "Audio & Music",
    description: "Music tracks, sound effects, and audio resources",
    children: [
      { name: "Music Tracks", description: "Royalty-free music and background tracks" },
      { name: "Sound Effects", description: "SFX packs and individual sound effects" },
      { name: "Podcast Templates", description: "Podcast intro/outro and production kits" },
      { name: "Audio Loops", description: "Loopable audio samples and beats" },
    ],
  },
  {
    name: "Documents & Business",
    description: "Business documents, legal templates, and productivity tools",
    children: [
      { name: "Business Plans", description: "Business plan templates and frameworks" },
      { name: "Legal Templates", description: "Contracts, agreements, and legal documents" },
      { name: "Spreadsheets", description: "Excel and Google Sheets templates" },
      { name: "Notion Templates", description: "Notion workspace and page templates" },
      { name: "Resume Templates", description: "Professional resume and CV templates" },
    ],
  },
  {
    name: "AI & Data",
    description: "AI tools, datasets, prompts, and automation resources",
    children: [
      { name: "AI Prompts", description: "Curated prompt libraries for AI models" },
      { name: "Datasets", description: "Structured datasets for analysis and ML" },
      { name: "Automation Workflows", description: "Pre-built automation flows and Zapier/Make templates" },
      { name: "Chatbot Templates", description: "Conversational AI and chatbot frameworks" },
      { name: "AI Models", description: "Fine-tuned AI models and LoRAs" },
    ],
  },
  {
    name: "Marketing & Growth",
    description: "Marketing assets, social media kits, and growth tools",
    children: [
      { name: "Social Media Kits", description: "Post templates and social media bundles" },
      { name: "Ad Templates", description: "Ad creative templates for various platforms" },
      { name: "SEO Tools", description: "SEO auditing sheets and keyword research tools" },
      { name: "Email Sequences", description: "Pre-written email marketing sequences" },
      { name: "Content Calendars", description: "Editorial and content planning calendars" },
    ],
  },
  {
    name: "Other",
    description: "Digital products that don't fit other categories",
  },
]

// ─── Tag Seed Data ────────────────────────────────────────────────────────────
const TAGS = [
  // Popularity & status
  "popular",
  "trending",
  "new-release",
  "featured",
  "best-seller",
  "staff-pick",
  // Pricing
  "free",
  "premium",
  "bundle",
  "lifetime-access",
  // Difficulty
  "beginner-friendly",
  "intermediate",
  "advanced",
  // Tech stack
  "react",
  "nextjs",
  "tailwind",
  "typescript",
  "python",
  "nodejs",
  "figma",
  "canva",
  "notion",
  "wordpress",
  "shopify",
  "webflow",
  // Style
  "minimal",
  "modern",
  "dark-mode",
  "responsive",
  "mobile-first",
  "creative",
  "professional",
  "corporate",
  "vintage",
  // Type
  "no-code",
  "low-code",
  "ai-powered",
  "saas",
  "open-source",
  "starter-kit",
  "pro",
  "enterprise",
  // Content
  "video",
  "pdf",
  "downloadable",
  "interactive",
  "printable",
]

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedCategories() {
  console.log("Seeding categories...")

  let sortOrder = 0

  for (const parent of CATEGORY_TREE) {
    // Insert parent category
    const [parentRow] = await db
      .insert(categories)
      .values({
        name: parent.name,
        slug: slugify(parent.name),
        description: parent.description,
        sortOrder: sortOrder++,
        isActive: true,
      })
      .onConflictDoNothing({ target: categories.slug })
      .returning({ id: categories.id })

    if (!parentRow) {
      console.log(`  Skipped (exists): ${parent.name}`)
      continue
    }

    console.log(`  + ${parent.name}`)

    // Insert children
    if (parent.children) {
      let childSort = 0
      for (const child of parent.children) {
        await db
          .insert(categories)
          .values({
            name: child.name,
            slug: slugify(child.name),
            description: child.description,
            parentId: parentRow.id,
            sortOrder: childSort++,
            isActive: true,
          })
          .onConflictDoNothing({ target: categories.slug })

        console.log(`    + ${child.name}`)
      }
    }
  }

  console.log("Categories seeded.\n")
}

async function seedTags() {
  console.log("Seeding tags...")

  const tagValues = TAGS.map((name) => ({
    name: name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: name,
  }))

  await db.insert(tags).values(tagValues).onConflictDoNothing({ target: tags.slug })

  console.log(`  + ${TAGS.length} tags seeded.`)
  console.log("Tags seeded.\n")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60))
  console.log("GenZaic Creator Hub - Database Seeding")
  console.log("=".repeat(60) + "\n")

  try {
    await seedCategories()
    await seedTags()

    console.log("=".repeat(60))
    console.log("Seeding completed successfully!")
    console.log("=".repeat(60))
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

main()
