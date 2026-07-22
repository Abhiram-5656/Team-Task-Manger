# 🚀 TaskFlow – Enterprise Team Task Management System

> A production-ready **Full-Stack MERN** application designed to streamline project planning, task assignment, and team collaboration through secure Role-Based Access Control (RBAC), JWT authentication, and real-time project tracking.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

# 📖 Overview

TaskFlow is a modern **Team Task Management Platform** built using the **MERN Stack** that enables organizations to efficiently manage projects, assign work, monitor progress, and collaborate securely.

The application provides dedicated dashboards for **Administrators** and **Team Members**, ensuring that users only access resources permitted by their assigned roles.

This project demonstrates industry-standard software engineering practices including:

- RESTful API Architecture
- JWT Authentication
- Role-Based Authorization (RBAC)
- Secure Password Encryption
- MongoDB Data Modeling
- Dashboard Analytics
- Production Deployment
- Clean Folder Architecture
- Responsive UI

---

# ✨ Key Features

## 🔐 Authentication & Security

- JWT Authentication
- Secure Password Hashing using bcrypt
- Protected API Routes
- Role-Based Access Control (RBAC)
- Token Expiration Handling
- Input Validation
- Secure CORS Configuration

---

## 📊 Dashboard

- Total Projects
- Total Tasks
- Pending Tasks
- Completed Tasks
- In Progress Tasks
- Interactive Charts
- Role-specific Statistics

---

## 📁 Project Management

### Admin

- Create Projects
- Update Projects
- Delete Projects
- Assign Team Members
- Set Deadlines
- Manage Project Status

### Team Member

- View Assigned Projects
- Track Progress

---

## ✅ Task Management

### Admin

- Create Tasks
- Assign Members
- Edit Tasks
- Delete Tasks
- Set Priority
- Set Due Dates

### Team Member

- View Assigned Tasks
- Update Task Status
- Track Progress

---

## 👥 User Management

Administrator can

- View All Users
- Manage Roles
- Delete Users
- Assign Members to Projects

---

# 🛠 Technology Stack

| Category | Technologies |
|-----------|-------------|
| Frontend | React 18, React Router DOM v6 |
| Styling | CSS3, Responsive Design |
| State Management | Context API |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Validation | express-validator |
| Deployment | Railway, Netlify, Vercel |
| Version Control | Git, GitHub |

---

# 🏗 System Architecture

```
                React Frontend
                      │
                 Axios Requests
                      │
          Express REST API (Node.js)
                      │
      Authentication & Authorization
                      │
              Controllers Layer
                      │
              Business Logic
                      │
               Mongoose Models
                      │
                  MongoDB Atlas
```

---

# 📂 Project Structure

```
team-task-manager/

├── backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── server.js
│
└── frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.js
│   └── index.js
│
└── README.md
```

---

# 👨‍💻 User Roles

| Module | Administrator | Team Member |
|----------|--------------|-------------|
| Authentication | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| View Projects | ✅ | ✅ |
| Create Project | ✅ | ❌ |
| Edit Project | ✅ | ❌ |
| Delete Project | ✅ | ❌ |
| View Tasks | ✅ | ✅ |
| Create Task | ✅ | ❌ |
| Edit Task | ✅ | ❌ |
| Delete Task | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| Manage Users | ✅ | ❌ |

---

# 🔗 REST API

## Authentication

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/signup |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

## Users

| Method | Endpoint |
|----------|----------|
| GET | /api/users |
| PUT | /api/users/:id/role |
| DELETE | /api/users/:id |

---

## Projects

| Method | Endpoint |
|----------|----------|
| POST | /api/projects |
| GET | /api/projects |
| GET | /api/projects/:id |
| PUT | /api/projects/:id |
| DELETE | /api/projects/:id |

---

## Tasks

| Method | Endpoint |
|----------|----------|
| POST | /api/tasks |
| GET | /api/tasks |
| GET | /api/tasks/:id |
| PUT | /api/tasks/:id |
| DELETE | /api/tasks/:id |

---

## Dashboard

| Method | Endpoint |
|----------|----------|
| GET | /api/dashboard |

---

# 💾 Database Design

## User

```javascript
{
  name,
  email,
  password,
  role
}
```

---

## Project

```javascript
{
  name,
  description,
  status,
  members,
  createdBy,
  deadline
}
```

---

## Task

```javascript
{
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  project,
  createdBy
}
```

---

# 🔒 Security Implementation

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Middleware
- Protected Routes
- Request Validation
- Secure HTTP Headers
- Token Verification
- CORS Restriction
- Environment Variables
- MongoDB Injection Protection

---

# ⚙️ Local Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git

cd team-task-manager
```

---

## Backend

```bash
cd backend

npm install

cp .env.example .env
```

Update `.env`

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY

NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

Run

```bash
npm run dev
```

Backend

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend

npm install

cp .env.example .env
```

Update

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run

```bash
npm start
```

Frontend

```
http://localhost:3000
```

---

# ☁️ Deployment

## Backend

- Railway

Environment Variables

```env
PORT

MONGO_URI

JWT_SECRET

NODE_ENV=production

FRONTEND_URL=https://your-netlify-app.netlify.app
```

---

## Frontend

Deploy using

- Netlify
- Vercel

Environment Variable

```env
REACT_APP_API_URL=https://your-railway-domain.up.railway.app/api
```

---

# 📈 Future Enhancements

- Email Notifications
- File Attachments
- Activity Logs
- Team Chat
- Comments on Tasks
- Calendar View
- Dark Mode
- Real-time Notifications
- Docker Support
- Kubernetes Deployment
- CI/CD Pipeline
- Unit Testing
- WebSockets
- Audit Logs

---

# 📸 Screenshots

Add screenshots here.

```
Login

Dashboard

Projects

Tasks

Users

Analytics
```

---

# 🎥 Demonstration

Include

- Live Demo Link
- Demo Video
- API Documentation

Example

```
Live Demo:
https://your-netlify-url.netlify.app

Backend API:
https://your-railway-url.up.railway.app

Video:
https://youtu.be/your-video
```

---

# 💡 Learning Outcomes

This project demonstrates proficiency in:

- Full-Stack MERN Development
- REST API Development
- Authentication & Authorization
- MongoDB Data Modeling
- React Component Architecture
- State Management
- Secure Backend Development
- Deployment & DevOps
- Clean Code Practices
- Production-Level Folder Structure

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

If you'd like to improve this project:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/feature-name
```

3. Commit changes

```bash
git commit -m "Added feature"
```

4. Push

```bash
git push origin feature/feature-name
```

5. Open a Pull Request

---

# 📄 License

Distributed under the MIT License.

---

# 👨‍💻 Author

**Nalla Abhiram**

Software Engineer | MERN Stack Developer | Java Developer | Cloud & DevOps Enthusiast

- LinkedIn: https://linkedin.com/in/your-profile
- GitHub: https://github.com/your-username
- Portfolio: https://your-portfolio.com

---

⭐ If you found this project useful, consider giving it a Star on GitHub.
