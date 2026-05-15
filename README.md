# 🤝 SkillExchange — AI-Powered Peer-to-Peer Skill Swapping Platform

SkillExchange is a modern full-stack platform designed to revolutionize collaborative learning through a peer-to-peer skill exchange ecosystem.

Instead of paying for expensive courses or relying on one-way teaching systems, users can teach what they know and learn what they need by connecting with compatible learners and mentors across multiple domains.

---

# 🚀 Vision

To democratize education by enabling accessible, community-driven learning through intelligent skill matchmaking.

---

# 🌟 Key Highlights

✅ AI-powered compatibility matching  
✅ Peer-to-peer skill exchange economy  
✅ Real-time communication system  
✅ Reputation & trust-based ecosystem  
✅ Geo-aware mentor discovery  
✅ Modern scalable architecture  
✅ Responsive and intuitive UI  

---

# 🧠 Problem Statement

Traditional learning platforms often:
- require expensive subscriptions
- promote one-way teaching
- lack personalization
- ignore community-based learning

SkillExchange solves this by creating a collaborative learning marketplace where users exchange knowledge instead of money.

---

# 💡 Solution Overview

SkillExchange intelligently matches users based on:
- skills they can teach
- skills they want to learn
- availability overlap
- proximity/location
- experience level
- reputation scores

The platform creates mutually beneficial learning partnerships using a smart recommendation engine.

---

# ⚙️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React · Vite · Tailwind CSS · Shadcn UI |
| Backend | Node.js · Express.js |
| Authentication | PocketBase Auth |
| Database | PocketBase (SQLite + Realtime) |
| Realtime Communication | Socket.IO / PocketBase Realtime |
| AI Matching | Embeddings · Cosine Similarity |
| Maps & Location | Leaflet · OpenStreetMap |
| Deployment | Vercel · Render / Railway |

---

# 🧩 Core Features

## 🔍 AI-Powered Skill Matching
- Intelligent compatibility scoring
- Semantic skill similarity detection
- Personalized partner recommendations

### Compatibility Formula

```math
Compatibility =
0.4(SkillMatch)
+ 0.15(Location)
+ 0.15(Availability)
+ 0.1(Level)
+ 0.1(Rating)
+ 0.1(Goals)
```

---

## 🌐 Geo-Aware Recommendations
- Nearby mentor discovery
- Distance-aware recommendations
- Hybrid online/offline learning support

---

## 💬 Real-Time Communication
- Instant messaging
- Typing indicators
- Session requests
- Real-time updates

---

## ⭐ Reputation & Trust System
- Ratings & reviews
- Skill endorsements
- Session completion tracking
- Reliability scores

---

## 📅 Session Scheduling
- Availability management
- Session booking
- Calendar integration
- Learning reminders

---

## 🎯 Personalized Dashboards
### Learner Dashboard
- Recommended mentors
- Ongoing sessions
- Learning roadmap

### Teacher Dashboard
- Skill requests
- Session management
- Reputation analytics

---

# 🏗️ System Architecture

```plaintext
                ┌─────────────────┐
                │   Frontend UI   │
                │ React + Vite    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Express API    │
                │ Business Logic  │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Matching    │  │ Realtime    │  │ Notification│
│ Engine      │  │ Chat System │  │ Service     │
└──────┬──────┘  └──────┬──────┘  └─────────────┘
       │                │
       └────────┬───────┘
                ▼
        ┌────────────────┐
        │  PocketBase DB │
        │ Auth + Storage │
        └────────────────┘
```

---

# 📂 Project Structure

```plaintext
SkillExchange/
│
├── web/                    # Frontend Application
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── features/
│
├── api/                    # Backend Services
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── matching/
│   ├── sockets/
│   ├── ai/
│   └── utils/
│
├── shared/
│   ├── constants/
│   └── types/
│
├── pb_data/                # PocketBase Database Files
├── pocketbase.exe
└── README.md
```

---

# 🧠 Matching Engine

The matching engine calculates compatibility using:
- skill overlap
- semantic similarity
- location proximity
- learning goals
- availability overlap
- community reputation

---

# 🔥 AI Features

## Semantic Skill Matching
Example:
- "React Developer"
- "Frontend Engineer"
- "Web Development"

can intelligently map together using embeddings.

---

## AI Learning Path Generation
Input:
```plaintext
I want to become a Machine Learning Engineer
```

Output:
```plaintext
Python → Statistics → ML → Deep Learning → MLOps
```

---

## Smart Match Explanations
Instead of:
```plaintext
85% Match
```

The system explains:
- shared interests
- complementary goals
- availability compatibility

---

# 🔒 Security Features

- JWT Authentication
- Secure Session Handling
- Input Validation
- Rate Limiting
- Protected Routes
- Role-Based Access Control

---

# 📈 Future Enhancements

- 🎥 Video call integration
- 🧠 LLM-powered mentorship assistant
- 🏆 Gamification system
- 📜 Blockchain-based certificates
- 🌍 Multi-language support
- 📱 Mobile application

---

# 🚀 Getting Started

# 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/SkillExchange.git
cd SkillExchange
```

---

# 2️⃣ Install Dependencies

## Frontend

```bash
cd web
npm install
```

## Backend

```bash
cd ../api
npm install
```

---

# 3️⃣ Start PocketBase

From root directory:

```powershell
./pocketbase.exe serve
```

PocketBase dashboard:
```plaintext
http://127.0.0.1:8090/_/
```

---

# 4️⃣ Run Backend

```bash
cd api
npm run dev
```

---

# 5️⃣ Run Frontend

```bash
cd web
npm run dev
```

---

# 🌐 Environment Variables

## Backend `.env`

```env
PORT=5000
POCKETBASE_URL=http://127.0.0.1:8090
JWT_SECRET=your_secret_key
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

---

# 📊 Scalability Considerations

- Recommendation caching
- WebSocket optimization
- Async job queues
- CDN-based media delivery
- Vector database integration
- Microservice-ready architecture

---

# 🧪 Example Use Case

### User A
Teaches:
- React
- UI/UX

Wants to Learn:
- Machine Learning

### User B
Teaches:
- Machine Learning

Wants to Learn:
- Frontend Development

✅ SkillExchange identifies mutual compatibility and recommends a peer-learning partnership.

---

# 👨‍💻 Contributors

Built with ❤️ by Akansha Patel.

---

# 📜 License

This project is licensed under the MIT License.

---

# 🌍 Connect

If you like this project, feel free to:
⭐ Star the repository  
🍴 Fork the project  
🤝 Contribute improvements  
