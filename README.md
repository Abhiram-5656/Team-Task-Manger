# ⚡ TaskFlow — Team Task Manager (Full-Stack MERN)

A production-ready full-stack web application for managing team projects and tasks with role-based access control.

## 🖼️ Features

| Feature | Admin | Member |
|---|---|---|
| Signup / Login (JWT) | ✅ | ✅ |
| Dashboard with stats & charts | ✅ | ✅ (own tasks) |
| Create / Edit / Delete Projects | ✅ | ❌ |
| View Projects | ✅ | ✅ (assigned only) |
| Create / Edit / Delete Tasks | ✅ | ❌ |
| View Tasks | ✅ | ✅ (assigned only) |
| Update Task Status | ✅ | ✅ |
| Manage Users & Roles | ✅ | ❌ |

---

## 🗂️ Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Signup, Login, GetMe
│   │   ├── userController.js     # CRUD for users (admin)
│   │   ├── projectController.js  # CRUD for projects
│   │   ├── taskController.js     # CRUD for tasks
│   │   └── dashboardController.js# Stats aggregation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect + adminOnly
│   │   └── validate.js           # express-validator handler
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt)
│   │   ├── Project.js            # Project schema
│   │   └── Task.js               # Task schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── railway.toml              # Railway deployment config
│   ├── package.json
│   └── server.js                 # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.js     # Sidebar + main layout
    │   ├── context/
    │   │   └── AuthContext.js    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProjectsPage.js
    │   │   ├── ProjectDetailPage.js
    │   │   ├── TasksPage.js
    │   │   └── UsersPage.js
    │   ├── utils/
    │   │   └── api.js            # Axios instance + all API calls
    │   ├── App.js                # Routes + protected routes
    │   ├── index.js
    │   └── index.css             # Global design system CSS
    ├── .env.example
    ├── .gitignore
    ├── netlify.toml              # Netlify SPA redirect
    ├── vercel.json               # Vercel SPA redirect
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflowdb
JWT_SECRET=your_random_secret_here_min_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev    # starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start    # starts on http://localhost:3000
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users |
| PUT | `/api/users/:id/role` | Admin | Update user role |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects` | Private | Get projects |
| GET | `/api/projects/:id` | Private | Get project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks` | Private | Get tasks (filtered) |
| GET | `/api/tasks/:id` | Private | Get task |
| PUT | `/api/tasks/:id` | Private | Update (admin: all; member: status only) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Private | Get stats |

**Task query params:** `?status=Pending&priority=high&project=<id>`

---

## ☁️ Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your backend folder / repo
3. Add environment variables in Railway dashboard:
   ```
   PORT=5000
   MONGO_URI=<your_atlas_uri>
   JWT_SECRET=<strong_secret>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.netlify.app
   ```
4. Railway auto-detects Node.js and uses `railway.toml` config
5. Copy the Railway public URL (e.g. `https://taskflow-api.up.railway.app`)

### Frontend → Netlify

1. Go to [netlify.app](https://netlify.com) → **Add new site** → **Import from Git**
2. Set **Base directory:** `frontend`
3. Set **Build command:** `npm run build`
4. Set **Publish directory:** `frontend/build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api
   ```
6. Deploy! The `netlify.toml` handles SPA routing automatically.

### Frontend → Vercel (Alternative)

```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts, set REACT_APP_API_URL in Vercel dashboard
```

---

## 🗄️ Database Schemas

### User
```js
{ name, email, password (hashed), role: 'admin'|'member' }
```

### Project
```js
{ name, description, status: 'active'|'completed'|'on-hold',
  createdBy: User, members: [User], deadline }
```

### Task
```js
{ title, description, status: 'Pending'|'In Progress'|'Completed',
  priority: 'low'|'medium'|'high', dueDate,
  project: Project, assignedTo: User, createdBy: User }
```

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Authentication via **JWT** (7-day expiry)
- Role-based middleware on every protected route
- Input validation with **express-validator**
- Global 401 handler auto-logs out expired tokens
- CORS configured for specific frontend origin

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| State | Context API + localStorage |
| HTTP | Axios with interceptors |
| Charts | Recharts |
| Styling | Custom CSS (design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway (backend), Netlify/Vercel (frontend) |

---

## 🎬 Demo Video Checklist (2-5 min)

1. Sign up as **Admin**, then sign up as **Member** in incognito
2. Admin: Create a project, add the member to it
3. Admin: Create 2-3 tasks and assign them
4. Show the **Dashboard** with stats and chart
5. Login as **Member**: show restricted view (only assigned tasks)
6. Member updates a task status to "Completed"
7. Show the dashboard updates reflect the change
8. Show the **Users** page (admin only)

---

## 📝 License

MIT
