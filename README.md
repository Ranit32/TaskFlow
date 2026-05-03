# 🚀 TaskFlow — Team Task Manager

TaskFlow is a modern, full-stack web application designed for teams to easily create projects, assign tasks, and track their progress with role-based access control.

## 🌟 Key Features

- **Authentication & Authorization**: Secure Signup/Login using JWT and bcrypt.
- **Role-Based Access Control**: Global and Project-level access controls.
  - **Admin**: Create/delete projects, add/remove members, manage tasks, assign roles.
  - **Member**: View assigned projects, update task statuses.
- **Project Management**: Create customizable projects (colors, descriptions) and invite team members.
- **Task Tracking**:
  - Interactive **Kanban Board** (To Do, In Progress, Done).
  - List View for tabular task management.
  - Set priorities (Low, Medium, High) and Due Dates.
  - Track overdue tasks automatically.
- **Interactive Dashboard**: Provides a high-level overview of project health, including statistics, your assigned tasks, and recent activities.
- **Modern UI**: A premium dark-mode, glassmorphism design system for an optimal user experience.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React 18** (Vite)
- **React Router v6** for client-side routing
- **Axios** for API requests
- **Vanilla CSS** with a custom design system (Variables, Flexbox/Grid, Animations)
- **date-fns** for date formatting

### Backend (Server)
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** (Database & ODM)
- **jsonwebtoken** for API Security
- **bcryptjs** for secure password hashing
- **express-validator** for request validation

---

## 📂 Project Structure

This project follows a monorepo structure.

```text
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Centralized Axios API requests
│   │   ├── components/     # Reusable UI components (Sidebar, TaskCard, Modal)
│   │   ├── context/        # Auth Context provider
│   │   ├── pages/          # Full page views (Dashboard, Projects, Login, etc.)
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global design system
│   └── vite.config.js      # Vite configuration (includes API proxy)
│
├── server/                 # Node.js + Express Backend
│   ├── config/             # Database connection setup
│   ├── controllers/        # Business logic for routes
│   ├── middleware/         # JWT Verification & Role Guards
│   ├── models/             # Mongoose Schemas (User, Project, Task)
│   ├── routes/             # API Endpoints
│   ├── index.js            # Main Express Server
│   └── .env                # Server Environment Variables
│
├── package.json            # Root configuration for easy deployment
└── railway.toml            # Railway CI/CD setup
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install
Install dependencies for both the frontend and backend from the root directory:

```bash
npm run install:all
```
*(This uses the script in the root `package.json` to install both client and server dependencies).*

### 2. Configure Environment Variables
Inside the `server/` directory, create a `.env` file (or update the existing one) with your credentials:

```env
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run the App

You will need to run both the server and the client.

**Start the Backend Server:**
```bash
npm run dev:server
# or
cd server && node index.js
```

**Start the Frontend Client:**
```bash
npm run dev:client
# or
cd client && npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🌐 API Reference

All backend requests go to `/api/*`.

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Authenticate and receive a JWT
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - List all user projects with stats
- `POST /api/projects` - Create a new project *(Admin)*
- `GET /api/projects/:id` - Get project details *(Member)*
- `PUT /api/projects/:id` - Update project details *(Admin)*
- `DELETE /api/projects/:id` - Delete a project *(Admin)*
- `POST /api/projects/:id/members` - Invite a team member *(Admin)*
- `DELETE /api/projects/:id/members/:userId` - Remove a team member *(Admin)*

### Tasks
- `GET /api/projects/:id/tasks` - List tasks for a project
- `POST /api/projects/:id/tasks` - Create a new task *(Admin)*
- `PUT /api/tasks/:id` - Update a task *(Admin / Assignee)*
- `PATCH /api/tasks/:id/status` - Update task status (To Do, In Progress, Done)
- `DELETE /api/tasks/:id` - Delete a task *(Admin)*

### Dashboard
- `GET /api/dashboard` - Fetches global stats, user's tasks, and recent activity.

---

## 🚢 Deployment (Railway)

This application is configured for one-click deployment using [Railway](https://railway.app/).

1. Upload this project to a GitHub Repository.
2. In Railway, click **New Project** -> **Deploy from GitHub repo**.
3. Railway will automatically detect the `railway.toml` file.
4. Add your Environment Variables in the Railway Dashboard (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`).
5. Railway will automatically run `npm run build` and `npm start`. The Express backend will serve the compiled React frontend from `client/dist`.

---
*Built with ❤️ for teams that need to get things done.*
