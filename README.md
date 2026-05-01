# TaskManager

A full-stack task management application with secure authentication, project collaboration, and comprehensive task tracking capabilities.

## 🌟 Features

### 🔐 Authentication & Security

- **Secure User Registration & Login** with email/password
- **JWT Token-based Authentication** for secure API access
- **BCrypt Password Hashing** for secure password storage
- **Automatic Token Management** with refresh and logout
- **Role-based Access Control** (Admin vs Member permissions)

### 📊 Dashboard

- **Real-time Task Statistics** (Total, Completed, In Progress, To Do, Overdue)
- **Visual Progress Tracking** with interactive progress bars
- **Personalized Welcome** with user's actual name from database
- **Clean, Focused Layout** without unnecessary UI elements

### 📁 Project Management

- **Create Projects** with name and description
- **Team Collaboration** with member management
- **Dynamic Role Detection** (Admin/Member based on project)
- **Email-based User Display** for all team members
- **Permission-based UI** (Admin-only features hidden from members)

### ✅ Task Management

- **Create Tasks** with title, description, priority, due dates
- **Assign Tasks** to project members via email
- **Status Tracking** (To Do → In Progress → Done)
- **Final Task Status** (Completed tasks cannot be reopened)
- **Overdue Detection** with visual indicators
- **Project-based Filtering** and status-based filtering
- **Task Views** (Assigned to me vs Created by me)

### 🎨 User Experience

- **Modern, Clean Interface** with Tailwind CSS
- **Responsive Design** for mobile and desktop
- **Email-based User Identification** throughout the application
- **Clear Error Messages** with actionable feedback
- **Loading States** for all async operations
- **Intuitive Navigation** with consistent design patterns

## 🏗️ Architecture

### Backend (Spring Boot)

```
├── Controllers/
│   ├── AuthController.java      # Authentication endpoints
│   ├── DashboardController.java # Dashboard statistics
│   ├── ProjectController.java   # Project management
│   ├── TaskController.java      # Task operations
│   └── UserController.java      # User management
├── Services/
│   ├── AuthService.java         # Authentication logic
│   ├── ProjectService.java      # Project business logic
│   └── TaskService.java         # Task business logic
├── Models/
│   ├── User.java               # User entity
│   ├── Project.java            # Project entity
│   └── Task.java               # Task entity
├── Repository/
│   ├── UserRepository.java      # User data access
│   ├── ProjectRepository.java   # Project data access
│   └── TaskRepository.java       # Task data access
├── Security/
│   ├── JwtUtil.java            # JWT token generation
│   ├── JwtFilter.java          # JWT authentication filter
│   └── SecurityConfig.java     # Security configuration
└── Utils/
    ├── PasswordUtil.java       # BCrypt password hashing
    ├── PasswordMigration.java  # Password migration utility
    └── ResponseHelper.java      # API response utilities
```

### Frontend (React)

```
src/
├── components/
│   ├── auth/                   # Login, Signup components
│   ├── dashboard/              # Dashboard with statistics
│   ├── projects/               # Project management UI
│   ├── tasks/                  # Task management UI
│   ├── layout/                 # Navigation and layout
│   └── common/                 # Shared components
├── contexts/
│   └── AuthContext.js          # Authentication state management
├── services/
│   └── api.js                  # API service layer
├── styles/
│   └── index.css               # Global styles and Tailwind
└── App.js                     # Main application component
```

## 🛠️ Technology Stack

### Backend

- **Spring Boot 3.5.14** - Modern Java framework
- **Java 21** - Latest Java version
- **Spring Security** - Authentication and authorization
- **Spring Data MongoDB** - MongoDB integration
- **JWT (JSON Web Tokens)** - Stateless authentication
- **BCrypt** - Secure password hashing
- **Maven** - Build and dependency management

### Frontend

- **React 18.2.0** - Modern React with hooks
- **React Router 6.8.1** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS 3.2.7** - Utility-first CSS framework
- **Headless UI** - Unstyled UI components
- **Heroicons** - Icon library

### Database

- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Collections**: users, projects, tasks

## 📋 Prerequisites

- **Java 21** or higher
- **Node.js 14+** and npm
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskmanager
```

### 2. Backend Setup

```bash
cd taskmanager
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd taskmanagerFrontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Database Configuration

Update `src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
spring.data.mongodb.database=taskmanager

# Server Configuration
server.port=8080

# JWT Configuration
jwt.secret=your-secret-key-here
jwt.expiration=86400000
```

## 🔧 Configuration

### Environment Variables

#### Backend Environment Files

The backend supports multiple environment configurations:

- **`.env.example`** - Template with all available variables
- **`.env`** - Local development configuration
- **`.env.production`** - Production environment settings
- **`application.properties`** - Uses environment variables with defaults

#### Frontend Environment Files

- **`.env.example`** - Template configuration
- **`.env`** - Local development
- **`.env.development`** - Development-specific settings
- **`.env.production`** - Production configuration

#### Quick Setup

```bash
# Backend
cp .env.example .env.production
# Edit .env.production with your values

# Frontend
cp .env.example .env.production
# Edit .env.production with your API URL
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### User Management

- `GET /user/me` - Get current user info
- `GET /user/{id}` - Get user by ID
- `GET /user/batch` - Get multiple users by IDs

### Project Management

- `GET /project/my-projects` - Get user's projects
- `GET /project/admin-projects` - Get admin projects
- `POST /project/create` - Create new project
- `POST /project/add-member` - Add member to project

### Task Management

- `GET /task/my-tasks` - Get tasks assigned to user
- `GET /task/created-by-me` - Get tasks created by user
- `GET /task/project/{id}` - Get tasks by project
- `POST /task/create` - Create new task
- `PUT /task/update-status` - Update task status

### Dashboard

- `GET /dashboard` - Get dashboard statistics

## 🔐 Security Features

### Authentication Flow

1. **Registration**: Password hashed with BCrypt before storage
2. **Login**: Password verified with BCrypt comparison
3. **JWT Token**: Generated upon successful authentication
4. **API Security**: All endpoints protected except auth routes
5. **Token Validation**: Automatic validation via JWT filter

### Password Security

- **BCrypt Hashing**: Industry-standard password hashing
- **Automatic Migration**: Existing plain-text passwords automatically hashed
- **Salt Generation**: Unique salt for each password hash
- **Secure Storage**: No plain-text passwords in database

### Authorization

- **Role-based Access**: Admin vs Member permissions
- **Project Ownership**: Only admins can manage projects
- **Task Assignment**: Only admins can create tasks in projects
- **API Protection**: All protected endpoints require valid JWT

## 🎯 Usage Guide

### 1. Getting Started

1. **Sign Up** for a new account with email and password
2. **Login** to access your dashboard
3. **Create Projects** to organize your work
4. **Add Team Members** to collaborate
5. **Create and Assign Tasks** to team members

### 2. Project Management

- **Create Project**: Add name and description
- **Add Members**: Invite team members via email
- **View Details**: See project statistics and member list
- **Admin Privileges**: Only project admins can add members

### 3. Task Management

- **Create Tasks**: Set title, description, priority, due date
- **Assign Tasks**: Select from project members
- **Track Progress**: Update task status (To Do → In Progress → Done)
- **Filter Tasks**: By project, status, or assignment

### 4. Dashboard Overview

- **Task Statistics**: Real-time task metrics
- **Progress Tracking**: Visual progress indicators
- **Quick Access**: Navigate to projects and tasks

## 🔧 Development

### Backend Development

```bash
# Run backend in development mode
mvn spring-boot:run

# Build for production
mvn clean package

# Run tests
mvn test
```

### Frontend Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database Operations

- **MongoDB Atlas**: Cloud database management
- **Local MongoDB**: `mongod` for local development
- **Data Migration**: Automatic password hashing on startup

## 🚨 Deployment

### Backend Deployment

```bash
# Build JAR file
mvn clean package

# Run with production profile
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment

```bash
# Build optimized bundle
npm run build

# Deploy build/ folder to web server
```

### Production Considerations

- **Environment Variables**: Use production database URLs
- **JWT Secret**: Use strong, unique secret keys
- **HTTPS**: Enable SSL/TLS for production
- **Database Security**: Configure proper MongoDB access

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support or questions:

- Create an issue in the repository
- Check the documentation
- Review the code comments

## 📊 Project Status

- ✅ **Authentication & Security** - Fully implemented
- ✅ **User Management** - Complete with bcrypt
- ✅ **Project Management** - Full CRUD operations
- ✅ **Task Management** - Complete lifecycle management
- ✅ **Dashboard** - Real-time statistics
- ✅ **Frontend** - Modern React application
- ✅ **Database** - MongoDB integration
- ✅ **API** - RESTful endpoints
- ✅ **Testing** - Unit and integration tests

---

**TaskManager** - Professional task management system built with modern technologies and security best practices. 🚀
