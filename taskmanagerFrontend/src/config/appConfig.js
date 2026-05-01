// Application Configuration
// All hardcoded values moved to environment variables

export const appConfig = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || process.env.RAILWAY_PUBLIC_URL || 'http://localhost:8080',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  },

  // UI Configuration
  ui: {
    successMessageDuration: parseInt(process.env.REACT_APP_SUCCESS_MESSAGE_DURATION) || 5000,
    errorMessageDuration: parseInt(process.env.REACT_APP_ERROR_MESSAGE_DURATION) || 5000,
    taskSuccessDuration: parseInt(process.env.REACT_APP_TASK_SUCCESS_DURATION) || 3000,
  },

  // App Information
  app: {
    name: process.env.REACT_APP_TITLE || 'TaskManager',
    description: process.env.REACT_APP_DESCRIPTION || 'Professional Task Management System',
    version: process.env.REACT_APP_VERSION || '1.0.0',
  },

  // Development Settings
  dev: {
    enableDevTools: process.env.REACT_APP_DEVTOOLS === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development',
  },

  // Production Settings
  production: {
    enableHttps: process.env.REACT_APP_ENABLE_HTTPS === 'true',
    enableServiceWorker: process.env.REACT_APP_ENABLE_SERVICE_WORKER === 'true',
  }
};

export default appConfig;
