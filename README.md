# 🤝 SkillExchange – Smart Peer-to-Peer Skill Swapping Platform

Welcome to **SkillExchange**, a modern platform developed to facilitate knowledge sharing and skill swapping. This system revolutionizes how people learn by matching individuals who want to learn a skill with those who possess it, creating a mutual exchange ecosystem.

---

## 🚀 Problem Statement
Traditional learning platforms often require high subscription fees or follow a one-way teaching model. Our solution tackles this by:
*   **Democratizing Education**: Removing financial barriers through a "swap" economy.
*   **Smart Matching**: Connecting users based on complementary skill sets.
*   **Location & Preference Awareness**: Incorporating user proximity and availability.
*   **Verified Exchanges**: Ensuring trust through community-driven ratings.

---

## 🧠 Solution Overview
SkillExchange is a full-stack monorepo platform that:
*   **Profiles Users**: Captures "Skills to Teach" and "Skills to Learn."
*   **Algorithmic Matching**: Uses a matching engine to suggest compatible partners.
*   **Real-Time Interaction**: Facilitates communication between matches.
*   **Integrated Backend**: Uses PocketBase for Auth and Node.js for business logic.

---

## 🔧 Tech Stack

| Layer | Tech Used |
| :--- | :--- |
| **Frontend** | React · Tailwind CSS · Vite · Shadcn UI |
| **Backend Logic** | Node.js · Express · PocketBase SDK |
| **Authentication** | PocketBase Auth Service |
| **Database** | PocketBase (SQLite/Real-time) |

---

## ✨ Features
*   **AI-Driven Matching**: Suggests users based on an overlap of "haves" and "wants."
*   **Dual-Dashboard System**: Separate views for managing learning and teaching.
*   **Real-Time Auth**: Instant login and session management via PocketBase.
*   **Skill Catalog**: A searchable database of categories (Tech, Arts, Languages, etc.).
*   **Modern UI**: Built with Tailwind CSS and Shadcn for a responsive experience.

---

## 📂 Repository Structure
```plaintext
Skill-Exchange/
├── web/            # React frontend, Tailwind config, Shadcn components
├── api/            # Node.js/Express backend for matching logic
├── pb_data/        # PocketBase database files (Excluded from Git)
├── pocketbase.exe  # PocketBase server executable
└── README.md       # Project documentation

## 🧩 Key Modules

### 🌐 Frontend (`web/`)
*   **Auth Context**: Global state management for user sessions, ensuring seamless login/logout flows.
*   **Match Interface**: High-performance UI used to visualize potential skill partners and exchange opportunities.
*   **Lib Clients**: Centralized instances for API and PocketBase connections to ensure dry, maintainable code.

### ⚙️ Backend (`api/`)
*   **Matching Engine**: Intelligent logic that calculates compatibility scores based on user "haves" and "wants."
*   **Server Logic**: Robust Express routes designed for secure and efficient data processing.

---

## 🚀 Getting Started

### 📋 Prerequisites
*   **Node.js & npm**: Installed on your local machine.
*   **PocketBase Executable**: Ensure `pocketbase.exe` is located in the root directory.

### Backend Setup (PocketBase)
In your first terminal, run:
```powershell
./pocketbase.exe serve