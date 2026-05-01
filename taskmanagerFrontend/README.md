# TaskManager Frontend

A modern React frontend for the TaskManager application with authentication, dashboard, project management, and task tracking features.

## Features

- 🔐 **JWT Authentication** - Secure login/signup with token management
- 📊 **Dashboard** - Real-time task statistics and progress tracking
- 📁 **Project Management** - Create and manage projects with team collaboration
- ✅ **Task Management** - Create, update, and track tasks across projects
- 📱 **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- 🎨 **Modern UI** - Clean, intuitive user interface

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for authentication

## Prerequisites

- Node.js 14+ and npm
- Backend TaskManager API running on http://localhost:8080

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login and signup components
│   ├── dashboard/      # Dashboard with statistics
│   ├── projects/       # Project management
│   ├── tasks/          # Task management
│   ├── layout/         # Navigation and layout
│   └── common/         # Shared components
├── contexts/           # Authentication context
├── services/           # API services
├── App.js             # Main application component
└── index.js           # Application entry point
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (one-way operation)

## Usage

### Authentication

1. **Sign up** for a new account or **login** with existing credentials
2. The JWT token is automatically stored in localStorage
3. Token is included in all API requests via Axios interceptors
4. Automatic logout on token expiration

### Dashboard

- View task statistics (total, completed, in progress, to do)
- Visual progress bars for task completion
- Quick actions for creating tasks and projects

### Projects

- Create new projects with name and description
- View all your projects in a grid layout
- Add team members to projects (placeholder)

### Tasks

- Filter tasks by status (All, To Do, In Progress, Done)
- View task details including due dates and project association
- Update task status (placeholder)

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `GET /dashboard` - Dashboard statistics
- `GET /project/my-projects` - User's projects
- `POST /project/create` - Create new project
- `GET /task/project/{id}` - Tasks by project
- `POST /task/create` - Create new task

## Error Handling

- Global error handling with user-friendly messages
- Automatic token refresh and logout on 401 errors
- Loading states for all async operations
- Form validation with error display

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom components** with consistent design patterns
- **Responsive design** for mobile and desktop
- **Color scheme** with primary blue theme

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
