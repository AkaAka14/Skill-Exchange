# Saheli

A peer-to-peer skill exchange platform where people teach, learn, and grow together — no fees, no one-way courses, just community-driven learning.

"Saheli" (सहेली) means "female friend" in Hindi, and reflects the platform's spirit of mentorship and mutual support. The community itself is open and inclusive to everyone.

---

## Overview

Saheli replaces paid courses and one-directional teaching with a community marketplace where users trade knowledge directly. Each person lists what they can teach and what they want to learn, and the platform's matching engine connects compatible pairs based on skill overlap, availability, experience level, and reputation — making it easier to find mentors, peers, and learning partners within a trusted community.

---

## Key Features

- **AI-assisted skill matching** — semantic similarity (via sentence embeddings) plus a weighted compatibility score across skills, availability, and rating
- **Trusted, inclusive community** — a safe, welcoming space for anyone to teach, learn, and mentor, free from the noise of a general marketplace
- **Real-time messaging** — Socket.IO–powered chat between matched users
- **Career assistant** — AI-driven guidance for learning paths and career planning
- **Reviews & reputation** — ratings and reviews to build trust across the community
- **Favorites & matches** — save potential learning partners and track active matches
- **Media uploads** — profile and post images handled via Cloudinary
- **Secure authentication** — JWT-based auth with hashed credentials

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Radix UI / shadcn |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |
| Authentication | JWT, bcrypt |
| AI / Matching | Xenova Transformers (embeddings) |
| Media Storage | Cloudinary |

---

## Architecture

Saheli runs as a single Express server that handles both REST traffic and real-time Socket.IO connections over the same HTTP server, with MongoDB as the source of truth and Cloudinary for media.

```
┌─────────────────────────┐
│       Frontend           │
│  React + Vite (SPA)      │
└────────────┬─────────────┘
             │  REST (Axios)        │  WebSocket
             ▼                       ▼
┌──────────────────────────────────────────────┐
│              Express HTTP Server              │
│  helmet · cors · morgan · rate limiting        │
│                                                │
│  ┌────────────┐  ┌──────────────┐  ┌────────┐ │
│  │  Routes /   │  │   Socket.IO   │  │  Auth  │ │
│  │ Controllers │  │  (messaging)  │  │  (JWT) │ │
│  └──────┬──────┘  └──────┬───────┘  └───┬────┘ │
│         │                │              │      │
│         ▼                │              │      │
│  ┌────────────┐          │              │      │
│  │  Matching   │          │              │      │
│  │  Engine     │          │              │      │
│  │ (embeddings)│          │              │      │
│  └──────┬──────┘          │              │      │
└─────────┼──────────────────┼──────────────┼──────┘
          │                  │              │
          ▼                  ▼              ▼
   ┌─────────────┐    ┌─────────────┐  ┌───────────┐
   │  MongoDB     │    │  Cloudinary  │  │  bcrypt    │
   │  (Mongoose)  │    │  (media)     │  │  hashing   │
   └─────────────┘    └─────────────┘  └───────────┘
```

**Request flow**
1. The React frontend calls the API over REST for standard operations (auth, profiles, skills, posts, matches) and opens a WebSocket connection for live messaging.
2. Incoming requests pass through security middleware (`helmet`, `cors`, rate limiting) before reaching route handlers.
3. The matching engine generates sentence embeddings for skills (via Xenova Transformers, warmed up at server startup) and combines semantic similarity with availability and reputation to score potential matches.
4. MongoDB persists users, skills, posts, messages, reviews, and favorites; Cloudinary stores uploaded media; Socket.IO pushes real-time updates back to connected clients.

---

## Project Structure

```
Saheli/
├── frontend/                 # React + Vite client
│   └── src/
│       ├── components/       # Shared UI components
│       ├── pages/            # AuthPage, HomePage, MatchesPage,
│       │                     #   MessagesPage, ProfilePage, etc.
│       ├── contexts/         # React context providers
│       ├── hooks/            # Custom hooks
│       └── lib/              # Client utilities
│
├── backend/                  # Express API
│   └── src/
│       ├── api/              # AI / matching integration
│       ├── routes/           # auth, users, skills, posts,
│       │                     #   matches, messages, reviews,
│       │                     #   favorites, career
│       ├── models/           # User, Skill, Post, Message,
│       │                     #   Review, Favorite
│       ├── middleware/       # Auth, rate limiting, error handling
│       ├── sockets/          # Real-time messaging
│       ├── config/           # DB and Cloudinary setup
│       └── main.js           # App entry point
│
├── package.json              # npm workspaces (frontend + backend)
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)
- A Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Saheli.git
cd Saheli
```

### 2. Install dependencies

This project uses npm workspaces, so a single install at the root covers both apps:

```bash
npm install
```

### 3. Configure environment variables

**`backend/.env`**
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Run the app

From the project root, this starts both the frontend and backend together:

```bash
npm run dev
```

Or run them individually:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000` and the API at `http://localhost:3001` by default.

---

## How Matching Works

Each user profile captures the skills they can teach, the skills they want to learn, their availability, and their experience level. The matching engine combines:

- **Semantic skill similarity** — using sentence embeddings, so related skills (e.g. "React Developer" and "Frontend Engineer") are recognized as compatible even when phrased differently
- **Mutual fit** — whether one user's teaching skills align with another's learning goals, and vice versa
- **Availability and reputation** — weighted alongside skill compatibility to produce a final match score

The result is a curated set of mentors and peers within a supportive, inclusive learning community.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run frontend and backend concurrently |
| `npm run build` | Build the frontend for production |
| `npm run start` | Start the backend in production mode |
| `npm run lint` | Lint both frontend and backend |

---

## Roadmap

- Video call integration for live sessions
- Expanded LLM-powered mentorship assistant
- Verified mentor badges for trusted community leaders
- Gamification and achievement badges
- Mobile application

---

## License

This project is licensed under the MIT License. See [LICENSE.md](./LICENSE.md) for details.

---

## Contributing

Contributions are welcome. 