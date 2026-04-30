====================================================
  TASKFLOW - Team Task Manager
  Full-Stack Assignment Submission
====================================================

LIVE URL: [Add your Railway URL after deployment]
GITHUB: [Add your GitHub repo URL]

----------------------------------------------------
PROJECT OVERVIEW
----------------------------------------------------
TaskFlow is a full-stack team task management web app with:
- Role-based access control (Admin / Member)
- JWT Authentication (Signup & Login)
- Project & Team Management
- Task Creation, Assignment & Status Tracking
- Dashboard with live stats (tasks, overdue, projects)
- REST API backend with proper validations

----------------------------------------------------
TECH STACK
----------------------------------------------------
Backend:
  - Java 17 + Spring Boot 3.2
  - Spring Security + JWT Authentication
  - Spring Data JPA + PostgreSQL
  - Maven build tool

Frontend:
  - React 18 + React Router v6
  - Axios for API calls
  - Custom CSS (no external UI library)

Database:
  - PostgreSQL (hosted on Railway)

Deployment:
  - Railway (backend + frontend + database)

----------------------------------------------------
KEY FEATURES
----------------------------------------------------

1. AUTHENTICATION
   - POST /api/auth/signup  — Register with name, email, password, role
   - POST /api/auth/login   — Login, returns JWT token
   - JWT token required for all protected routes

2. ROLE-BASED ACCESS CONTROL
   - ADMIN: Can create/delete projects, assign tasks to anyone,
            view all tasks, delete tasks, manage members
   - MEMBER: Can view assigned projects, create/update their tasks,
             update task status

3. PROJECTS
   - GET    /api/projects          — List projects
   - POST   /api/projects          — Create project (Admin only)
   - PUT    /api/projects/{id}     — Update project (Admin only)
   - DELETE /api/projects/{id}     — Delete project (Admin only)
   - POST   /api/projects/{id}/members/{userId} — Add member (Admin)

4. TASKS
   - GET    /api/tasks             — All tasks (Admin) / My tasks (Member)
   - GET    /api/tasks/my          — My assigned tasks
   - GET    /api/tasks/overdue     — Overdue tasks
   - POST   /api/tasks             — Create task
   - PUT    /api/tasks/{id}        — Update task
   - PATCH  /api/tasks/{id}/status — Update status only
   - DELETE /api/tasks/{id}        — Delete task (Admin only)

5. USERS
   - GET /api/users/me     — Current user profile
   - GET /api/users        — All users (Admin only)

6. TASK STATUSES
   - TODO → IN_PROGRESS → DONE

7. TASK PRIORITIES
   - LOW, MEDIUM, HIGH

8. OVERDUE DETECTION
   - Tasks with dueDate in the past and status != DONE are flagged

----------------------------------------------------
DATABASE SCHEMA
----------------------------------------------------
Tables:
  users         (id, name, email, password, role, created_at)
  projects      (id, name, description, created_by, created_at)
  project_members (project_id, user_id)  -- Many-to-Many
  tasks         (id, title, description, status, priority,
                 project_id, assignee_id, created_by,
                 due_date, created_at, updated_at)

----------------------------------------------------
HOW TO RUN LOCALLY
----------------------------------------------------

PREREQUISITES:
  - Java 17+
  - Maven 3.8+
  - Node.js 18+
  - PostgreSQL running locally

STEP 1 - Setup Database:
  createdb taskmanager
  (or use pgAdmin to create a database named "taskmanager")

STEP 2 - Run Backend:
  cd backend
  mvn spring-boot:run
  Backend starts on http://localhost:8080

STEP 3 - Run Frontend:
  cd frontend
  npm install
  npm start
  Frontend starts on http://localhost:3000

STEP 4 - Test:
  Open http://localhost:3000
  Click "Create one" to signup
  Choose Admin role for full access

----------------------------------------------------
HOW TO DEPLOY ON RAILWAY
----------------------------------------------------

See DEPLOYMENT_GUIDE.txt for full step-by-step instructions.

Summary:
  1. Push code to GitHub (separate repos or monorepo)
  2. Create Railway project
  3. Add PostgreSQL plugin
  4. Deploy backend service (set env vars)
  5. Deploy frontend service (set REACT_APP_API_URL)
  6. Get live URLs

----------------------------------------------------
ENVIRONMENT VARIABLES (Backend)
----------------------------------------------------
DATABASE_URL    = jdbc:postgresql://<host>:<port>/<db>
DB_USERNAME     = postgres (Railway provides this)
DB_PASSWORD     = <password> (Railway provides this)
JWT_SECRET      = any-random-long-string-min-32-chars
PORT            = 8080 (Railway sets this automatically)
FRONTEND_URL    = https://your-frontend.railway.app

----------------------------------------------------
ENVIRONMENT VARIABLES (Frontend)
----------------------------------------------------
REACT_APP_API_URL = https://your-backend.railway.app

----------------------------------------------------
PROJECT STRUCTURE
----------------------------------------------------
taskmanager/
├── backend/
│   ├── pom.xml
│   ├── Procfile
│   └── src/main/java/com/taskmanager/
│       ├── TaskManagerApplication.java
│       ├── config/SecurityConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ProjectController.java
│       │   ├── TaskController.java
│       │   └── UserController.java
│       ├── dto/
│       │   ├── AuthDto.java
│       │   ├── ProjectDto.java
│       │   └── TaskDto.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Project.java
│       │   └── Task.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── ProjectRepository.java
│       │   └── TaskRepository.java
│       └── security/
│           ├── JwtUtils.java
│           └── JwtAuthFilter.java
└── frontend/
    ├── package.json
    ├── railway.toml
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/AuthContext.js
        ├── utils/api.js
        ├── components/Navbar.js
        └── pages/
            ├── Login.js
            ├── Signup.js
            ├── Dashboard.js
            ├── Projects.js
            └── Tasks.js
