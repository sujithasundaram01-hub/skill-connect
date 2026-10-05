# Skill Share — “Share What You Know. Learn What You Love.”

> **A real-world full-stack community platform where anyone can share skills they know and learn skills from other people.**

---

## 🌟 Core Concept

Skill Share connects real neighbors and community members to exchange lifelong practical skills:
* Someone who knows cooking shares cooking.
* Someone who knows photography shares photography.
* Someone who knows tailoring shares tailoring.
* Someone who knows coding shares coding.
* Someone who knows gardening shares gardening.
* A person can teach one skill while learning another.

### Core Community Flow
$$\text{Share Skill} \longrightarrow \text{Discover Skill} \longrightarrow \text{Connect} \longrightarrow \text{Learn} \longrightarrow \text{Review} \longrightarrow \text{Build Trust}$$

---

## 🚀 Key Features

* **100% Real Functionality**: No mock login systems, hardcoded profiles, fake database responses, or simulated data. Everything is backed by a relational database via Prisma ORM.
* **Secure Authentication**: Email + bcrypt password hashing, JWT bearer tokens, session persistence, role-based authorization (USER / ADMIN).
* **Skill Discovery & Multi-Faceted Search**: Query database by skill name, description, categories, difficulty level, online/in-person mode, language, and safe general locality.
* **Skill of the Day**: Deterministic daily spotlight calculated directly from real database skills.
* **Skill Match & Two-Way Skill Swap**: Intelligent algorithm that queries the database to find reciprocal matches: *“I teach you Cooking, you teach me Photography”*.
* **Learning Requests & Status Progression**: Send requests with preferred times and modes; teachers can Accept or Decline; tracks progress from `Started` $\to$ `Learning` $\to$ `Completed`.
* **Safe Private Messaging**: Real-time communication via WebSockets (Socket.io) and database persistence. Restricted strictly to authorized connected members.
* **Anti-Fraud Reviews & Trust System**: Ratings (1–5 stars) and reviews can *only* be posted for completed interactions. Real average rating calculation and helpful votes.
* **Community Achievement Badges**:
  - 📖 **Skill Sharer**: Shared at least 1 skill.
  - 🎓 **Active Learner**: Completed learning sessions.
  - 🏆 **Helpful Teacher**: Maintained positive 4.0+ community rating.
  - ✨ **Top Contributor**: High-impact member with multiple skills & sessions.
* **Safety & Privacy Controls**:
  - Member reporting system with moderation workflow.
  - User blocking prevents messaging and unwanted requests.
  - Locality toggle to protect personal neighborhood privacy.
  - No public exposure of personal emails, phone numbers, or exact addresses.
* **Protected Admin Moderation Dashboard**:
  - View real-time platform statistics.
  - Review member safety reports and take action (`Reviewed`, `ActionTaken`, `Dismissed`).
  - Account suspension and reactivation controls.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Socket.io Client |
| **Backend** | Node.js, Express.js, Socket.io, TypeScript |
| **Database** | SQLite via Prisma ORM (ACID transactions, persistent relational schema) |
| **Auth** | JWT, bcryptjs password hashing, protected routes & middleware |

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed     # Seeds initial realistic community members and skills
npm run dev         # Runs backend API & Socket.io server on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Runs frontend Vite development server on port 5173
```

Open **http://localhost:5173** in your web browser.

---

## 🔑 Pre-Seeded Community & Admin Accounts

For convenient evaluation, one-click demo login buttons are provided on the Login page (`/login`):

| Name | Role | Email | Password | Skill / Specialty |
|---|---|---|---|---|
| **Elena Vance** | **ADMIN** | `admin@skillshare.org` | `Password123!` | Platform Moderator & Admin |
| **Maria Rodriguez** | User | `maria@example.com` | `Password123!` | Italian Cooking & Tagliatelle Pasta |
| **Marcus Chen** | User | `marcus@example.com` | `Password123!` | Smartphone & DSLR Photography |
| **Evelyn Reed** | User | `evelyn@example.com` | `Password123!` | Custom Tailoring & Mending |
| **David Kim** | User | `david@example.com` | `Password123!` | Python & Practical Automation |
| **Priya Patel** | User | `priya@example.com` | `Password123!` | Balcony & Organic Gardening |
| **Carlos Mendez** | User | `carlos@example.com` | `Password123!` | Conversational Spanish |
| **Sarah Jenkins** | User | `sarah@example.com` | `Password123!` | Acoustic Guitar & Chords |

---

## 📁 Project Architecture

```
skill/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Complete relational models & relations
│   │   ├── seed.ts              # Community seed script with realistic data
│   │   └── dev.db               # SQLite database
│   ├── src/
│   │   ├── config/              # Prisma client singleton
│   │   ├── controllers/         # Auth, skills, requests, connections, messages, reviews, matches, admin
│   │   ├── middleware/          # Auth, admin, error handlers
│   │   ├── routes/              # Express API route endpoints
│   │   ├── utils/               # Badge calculator & helpers
│   │   ├── socket.ts            # Socket.io real-time chat setup
│   │   └── server.ts            # Application entry point
│   ├── test_flow.js             # End-to-end integration test suite
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # Fetch client with token injection
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── components/          # Navbar, Footer, SkillCard, RequestModal, ReviewModal, ReportModal
│   │   ├── pages/               # Home, Explore, ShareSkill, EditSkill, SkillDetail, MySkills, SkillMatch, Messages, Profile, Admin, Login, Register, CommunityGuidelines
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router & layout
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
└── package.json                 # Monorepo orchestration scripts
```
