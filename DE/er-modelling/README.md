# Data Engineering: Entity-Relationship (ER) Modelling & Architecture

This directory contains the official **Data Engineering (DE)** entity-relationship models, schema catalog, normalization analyses, and architectural documentation for the **Alumni Association Platform**.

---

## 📁 Directory Structure

```text
DE/
└── er-modelling/
    ├── README.md                          # Deliverable overview and index (this file)
    ├── er-diagram-and-data-modelling.md   # Comprehensive schema catalog, data dictionary & normalization proofs
    ├── er-diagram.mmd                     # Source Mermaid ER diagram specification
    └── er-diagram.png                     # High-resolution rendered graphical ER diagram
```

---

## 📋 File Deliverables

| File | Format | Purpose |
|---|---|---|
| [`README.md`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/README.md) | Markdown | High-level summary, directory catalog, and rendering instructions. |
| [`er-diagram-and-data-modelling.md`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/er-diagram-and-data-modelling.md) | Markdown | Complete technical specification: Conceptual, Logical & Physical Data Models, 13-entity data dictionary, referential integrity rules, 3NF/BCNF normalization analysis, and indexing strategy. |
| [`er-diagram.mmd`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/er-diagram.mmd) | Mermaid (`.mmd`) | Raw Mermaid code representing all 13 database entities, attributes, primary/foreign keys, and relational cardinalities. |
| [`er-diagram.png`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/er-diagram.png) | PNG Image | Crisp graphical render of the Mermaid ER diagram for direct visual presentation in reports and slides. |

---

## 🏛️ Managed Entities & Domains

The database architecture is implemented on **PostgreSQL** via **Prisma ORM** (`server/prisma/schema.prisma`). It comprises 13 distinct entities across 6 functional domains:

1. **Identity & Access Management (IAM):**
   * `Role`: Security roles (`ADMIN`, `ALUMNI`, `STUDENT`) for RBAC authorization.
   * `User`: Authentication credentials, email uniqueness, active account state.
   * `AlumniProfile`: Extended graduate metadata (graduation year, department, current company, title, bio, LinkedIn).
   * `session`: PostgreSQL session store for `connect-pg-simple` and `express-session`.

2. **Career & Placement:**
   * `Job`: Job and internship opportunities shared by alumni and administrators.
   * `JobApplication`: Candidate submissions with resume URLs, cover letters, and review states.

3. **Events & Reunions:**
   * `Event`: Campus workshops, reunions, and webinars with start/end schedules and capacity limits.
   * `EventRegistration`: Attendee registrations with unique `[eventId, userId]` booking constraints.

4. **Mentorship Network:**
   * `MentorshipRequest`: One-on-one career coaching requests connecting students with verified alumni mentors.

5. **Giving & Philanthropy:**
   * `DonationCampaign`: Institutional causes, scholarship funds, and target goal amounts.
   * `DonationTransaction`: Cryptographically verified payment gateway transaction records (Razorpay integration).

6. **Community Impact & Feedback:**
   * `SuccessStory`: Moderated public editorial articles showcasing alumni career milestones.
   * `Feedback`: Institutional feedback and survey responses with category classification.

---

## 🔍 How to View and Edit the Diagram

### 1. View in Markdown Previews
The diagram is embedded inside [`er-diagram-and-data-modelling.md`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/er-diagram-and-data-modelling.md) and natively renders in GitHub, GitLab, VS Code, and IDE Markdown viewers supporting Mermaid.

### 2. Live Interactive Editor
You can paste the contents of [`er-diagram.mmd`](file:///Users/arjavjain/.gemini/antigravity/scratch/Alumni-Association-platform-for-the-University-Institute./DE/er-modelling/er-diagram.mmd) directly into the [Mermaid Live Editor](https://mermaid.live/) to zoom, pan, or export to SVG/PDF.

### 3. Re-generating the Image Locally
Using Mermaid CLI (`mmdc`):
```bash
npx @mermaid-js/mermaid-cli -i DE/er-modelling/er-diagram.mmd -o DE/er-modelling/er-diagram.png -b transparent -s 2
```
Or via headless Chrome / Puppeteer script (automated in repository build steps).
