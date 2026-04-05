# 🎓 StudentSphere

> **A comprehensive full-stack student ecosystem platform** — built to supercharge campus life with smart tools for resources, finance, networking, lost & found, and more.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[![Frontend](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-000000?logo=vercel&logoColor=white)](https://student-sphere-azure.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Live%20on%20Render-46E3B7?logo=render&logoColor=white)](https://studentsphere-ideu.onrender.com/api/health)

---

## 🌐 Live Demo

| | URL |
|-|-----|
| **🖥️ Frontend** | [student-sphere-azure.vercel.app](https://student-sphere-azure.vercel.app) |
| **⚙️ Backend API** | [studentsphere-ideu.onrender.com](https://studentsphere-ideu.onrender.com/api/health) |

> **Note:** The backend is hosted on Render's free tier — it may take **30–60 seconds to wake up** on the first request.

---

## 📸 Overview

StudentSphere is a MERN stack platform that serves as an all-in-one hub for college students. From sharing study materials and tracking daily expenses to finding lost items and discovering campus local services — everything a student needs in one place.

---

## ✨ Key Features

| Module | Description |
|--------|-------------|
| 🏠 **Dashboard** | Personalized stats, quick links, recent activity |
| 📚 **Resource Hub** | Upload & download notes, PDFs, videos; learning paths |
| 💰 **Finance Tracker** | Income/expense tracking, analytics, charts |
| 🎯 **Opportunities** | Internships, jobs, scholarships, hackathons |
| 🗺️ **Local Navigator** | GPS-powered campus map — hostels, mess, PG, shops |
| 🔍 **Lost & Found** | AI image analyzer auto-fills reports; GPS-detected location |
| 🛒 **Marketplace** | Buy/sell student items on campus |
| 🎓 **Campus Connect** | Clubs, events, campus posts & announcements |
| 👥 **Student Social** | Follow students, build connections, view profiles |
| ✅ **Task Manager** | Personal to-do & assignment tracker |
| 🎫 **Campus Pass** | QR-code digital passes for campus access |
| 👤 **Profile** | Skills, interests, my resources, edit profile |
| 🛡️ **Admin Panel** | User management, content moderation, stats |

---

## 🤖 AI-Powered Features

### Lost & Found AI Analyzer
Upload a photo of a lost/found item → **Gemini Vision AI** (via OpenRouter) automatically fills:
- **Title** — item name in 5 words
- **Description** — color, brand, condition, identifying features

**GPS Auto-Fill** on both Lost & Found reports and Local Navigator:
- Detects current location via browser GPS
- Reverse-geocodes via **Nominatim (OpenStreetMap)** — completely free, no API key needed
- Fills: Road, Area, City, State, Pincode

---

## 🏗️ Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool & dev server |
| React Router | 6 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Leaflet | 1.9.4 | Interactive maps (no API key) |
| Chart.js | 4.4 | Finance analytics charts |
| Lucide React | 0.400 | Icon system |
| Axios | 1.7 | HTTP client |
| React Hot Toast | 2.4 | Notifications |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.19 | REST API framework |
| MongoDB + Mongoose | 8.3 | Database & ODM |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Multer | 1.4 | File uploads |
| Cloudinary | 1.41 | Cloud image storage (optional) |
| express-validator | 7.0 | Input validation |
| QRCode | 1.5 | Campus Pass QR generation |

---

## 📁 Project Structure

```
studentsphere/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers (12 modules)
│   ├── middleware/      # Auth, upload, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── seeds/           # Database seeder
│   ├── utils/           # Helpers
│   ├── uploads/         # Local file storage
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── api/         # Axios instance + interceptors
        ├── components/  # Layout, UI components
        ├── context/     # Auth, Notification context
        ├── hooks/       # useFetch, etc.
        ├── pages/       # 13 feature modules
        ├── utils/       # Helpers, formatters
        └── main.jsx     # React entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+
- **MongoDB** (local or [MongoDB Atlas](https://mongodb.com/atlas))
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/studentsphere.git
cd studentsphere
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studentsphere
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# Optional — Cloudinary for cloud image storage
# If not set, files are stored locally in /uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Seed the database with sample data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

> API runs at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000

# Required for AI image analyzer in Lost & Found
# Get a FREE key at https://openrouter.ai
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Start the frontend:

```bash
npm run dev      # development
npm run build    # production build
npm run preview  # preview production build
```

> App runs at **http://localhost:5173**

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret for JWT signing |
| `CLIENT_URL` | No | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ Yes | Backend base URL |
| `VITE_OPENROUTER_API_KEY` | No | OpenRouter key for AI analyzer |

> **Note:** Without `VITE_OPENROUTER_API_KEY`, the AI image analyzer will fail gracefully — users can still fill the Lost & Found form manually.

---

## 🗺️ API Endpoints

| Module | Base Path | Auth |
|--------|-----------|------|
| Authentication | `/api/auth` | Public/Protected |
| Dashboard | `/api/dashboard` | Protected |
| Resources | `/api/resources` | Mixed |
| Finance | `/api/finance` | Protected |
| Opportunities | `/api/opportunities` | Mixed |
| Local Services | `/api/local` | Mixed |
| Marketplace | `/api/marketplace` | Mixed |
| Lost & Found | `/api/lostfound` | Protected |
| Campus | `/api/campus` | Mixed |
| Social | `/api/social` | Mixed |
| Tasks | `/api/tasks` | Protected |
| Campus Pass | `/api/campus-pass` | Protected |
| Admin | `/api/admin` | Admin only |
| Health Check | `/api/health` | Public |

---

## 👤 Default Seeded Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@studentsphere.com` | `Admin@123` |
| Student | `student@studentsphere.com` | `Student@123` |

---

## 🗺️ Map Features (No API Key Required)

Both the **Local Navigator** and **Lost & Found** use completely free, no-key mapping:

| Service | Purpose |
|---------|---------|
| [OpenStreetMap](https://openstreetmap.org) | Map tiles via Leaflet |
| [Nominatim](https://nominatim.openstreetmap.org) | GPS reverse geocoding → human address |

GPS auto-fill provides:
```
Street / Road, Area
City, State, Pincode
```

---

## ☁️ Deployment

### Frontend → Vercel

**Live:** [student-sphere-azure.vercel.app](https://student-sphere-azure.vercel.app)

The repo includes `frontend/vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root to `frontend/`
4. Add environment variables in Vercel dashboard
5. Deploy ✅

### Backend → Render

**Live:** [studentsphere-ideu.onrender.com](https://studentsphere-ideu.onrender.com/api/health)

1. Push backend to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set `npm start` as start command
4. Add all env variables
5. Deploy ✅

> **Tip:** Use [MongoDB Atlas](https://mongodb.com/atlas) free tier for the production database.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for students, by students</p>
  <p><strong>StudentSphere</strong> — Your complete campus companion</p>
</div>
