# TaskManager Railway.app Deployment Guide

## 🚀 **Deploy TaskManager on Railway.app**

Railway.app is a modern cloud platform that makes deploying applications incredibly easy. This guide will walk you through deploying both the backend and frontend of TaskManager.

---

## 📋 **Prerequisites**

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **GitHub Account** - For code repository
3. **MongoDB Atlas Account** - For database
4. **TaskManager Code** - Complete project ready for deployment

---

## 🗂️ **Project Structure for Railway**

Your project structure should be:
```
taskmanager/
├── backend/                 # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── .env.production
├── frontend/                # React frontend  
│   ├── src/
│   ├── package.json
│   └── .env.production
├── railway.json            # Railway configuration
└── README.md
```

---

## 🔧 **Step 1: Prepare Your Project**

### **1.1 Create Railway Configuration File**

Create `railway.json` in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "mvn spring-boot:run",
    "healthcheckPath": "/actuator/health"
  }
}
```

### **1.2 Update Backend for Railway**

#### **Update application.properties**:
```properties
# Railway Environment Variables
spring.data.mongodb.uri=${MONGODB_URI}
spring.data.mongodb.database=${MONGODB_DATABASE}
server.port=${PORT:-8080}
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
logging.level.org.springframework=${LOG_LEVEL}
```

#### **Create railway-specific .env**:
```bash
# Railway Backend Environment
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
MONGODB_DATABASE=taskmanager
JWT_SECRET=your-super-secure-256-bit-railway-jwt-secret-key-change-this
JWT_EXPIRATION=86400000
LOG_LEVEL=INFO
PORT=8080
```

### **1.3 Update Frontend for Railway**

#### **Update frontend package.json**:
```json
{
  "name": "taskmanager-frontend",
  "scripts": {
    "start": "serve -s build -l ${PORT:-3000}",
    "build": "react-scripts build",
    "dev": "react-scripts start"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

#### **Create frontend railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **Create frontend .env for Railway**:
```bash
# Railway Frontend Environment
REACT_APP_API_URL=${RAILWAY_PUBLIC_URL}
REACT_APP_API_TIMEOUT=30000
REACT_APP_SUCCESS_MESSAGE_DURATION=5000
REACT_APP_ERROR_MESSAGE_DURATION=5000
REACT_APP_TASK_SUCCESS_DURATION=3000
```

---

## 🚀 **Step 2: Deploy Backend on Railway**

### **2.1 Create New Project on Railway**
1. Login to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Connect your GitHub repository

### **2.2 Configure Backend Service**
1. **Select Repository**: Choose your TaskManager repository
2. **Select Branch**: `main` or `master`
3. **Root Directory**: `backend/`
4. **Build Command**: `mvn clean package -DskipTests`
5. **Start Command**: `mvn spring-boot:run`
6. **Port**: `8080`

### **2.3 Set Environment Variables**
In Railway dashboard, add these environment variables:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
MONGODB_DATABASE=taskmanager
JWT_SECRET=your-super-secure-256-bit-jwt-secret-key
JWT_EXPIRATION=86400000
LOG_LEVEL=INFO
PORT=8080
```

### **2.4 Deploy Backend**
1. Click **"Deploy"**
2. Railway will build and deploy your Spring Boot application
3. Wait for deployment to complete (usually takes 2-5 minutes)

---

## 🚀 **Step 3: Deploy Frontend on Railway**

### **3.1 Create New Service**
1. In your Railway project, click **"New Service"**
2. Select **"Deploy from GitHub"**
3. Choose the same repository
4. **Root Directory**: `frontend/`

### **3.2 Configure Frontend Service**
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Port**: `3000`

### **3.3 Set Environment Variables**
Add these environment variables for frontend:

```bash
REACT_APP_API_URL=https://your-backend-app-name.railway.app
REACT_APP_API_TIMEOUT=30000
REACT_APP_SUCCESS_MESSAGE_DURATION=5000
REACT_APP_ERROR_MESSAGE_DURATION=5000
REACT_APP_TASK_SUCCESS_DURATION=3000
```

**Important**: Replace `your-backend-app-name` with your actual backend service name from Railway.

### **3.4 Deploy Frontend**
1. Click **"Deploy"**
2. Railway will build your React application
3. Wait for deployment to complete

---

## 🔧 **Step 4: Configure MongoDB Atlas**

### **4.1 Update Network Access**
1. Go to your MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. This allows Railway to connect to your database

### **4.2 Update Connection String**
Use your MongoDB Atlas connection string in the Railway environment variables:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
```

---

## 🔗 **Step 5: Connect Frontend to Backend**

### **5.1 Get Backend URL**
1. In Railway dashboard, find your backend service
2. Copy the public URL: `https://your-backend-name.railway.app`

### **5.2 Update Frontend Environment**
In your frontend service on Railway, update:
```bash
REACT_APP_API_URL=https://your-backend-name.railway.app
```

### **5.3 Redeploy Frontend**
1. Click **"Redeploy"** on your frontend service
2. Wait for deployment to complete

---

## 🎯 **Step 6: Test Your Deployment**

### **6.1 Test Backend**
1. Open your backend URL: `https://your-backend-name.railway.app`
2. Test health endpoint: `https://your-backend-name.railway.app/actuator/health`
3. Should return: `{"status":"UP"}`

### **6.2 Test Frontend**
1. Open your frontend URL: `https://your-frontend-name.railway.app`
2. Try to sign up for a new account
3. Test login functionality
4. Create projects and tasks

### **6.3 Test API Connection**
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify frontend is calling the backend API correctly

---

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Backend Fails to Start**
**Solution**: Check logs in Railway dashboard
- Look for MongoDB connection errors
- Verify environment variables are correct
- Check if port 8080 is properly configured

### **Issue 2: Frontend Cannot Connect to Backend**
**Solution**: 
- Verify `REACT_APP_API_URL` is correct
- Check if backend is running and healthy
- Ensure CORS is configured properly

### **Issue 3: Database Connection Failed**
**Solution**:
- Verify MongoDB Atlas network access (0.0.0.0/0)
- Check connection string format
- Ensure username/password are correct

### **Issue 4: Build Failures**
**Solution**:
- Check build logs in Railway dashboard
- Ensure all dependencies are in package.json/pom.xml
- Verify build commands are correct

---

## 📱 **Railway Dashboard Management**

### **View Logs**
1. Go to your Railway project
2. Click on any service
3. Click **"Logs"** tab
4. View real-time logs

### **Environment Variables**
1. Click on a service
2. Click **"Settings"**
3. Click **"Variables"**
4. Add/Edit environment variables

### **Redeploy**
1. Click on a service
2. Click **"Redeploy"**
3. Choose to redeploy with latest changes

---

## 🔄 **CI/CD with Railway**

### **Automatic Deployment**
Railway automatically deploys when you:
1. Push to your connected GitHub branch
2. Railway detects changes and rebuilds
3. New version is automatically deployed

### **Manual Deployment**
1. Push changes to GitHub
2. Go to Railway dashboard
3. Click **"Redeploy"** on the service

---

## 🚀 **Production Considerations**

### **Domain Configuration**
1. In Railway dashboard, click on a service
2. Click **"Settings"**
3. Click **"Domains"**
4. Add your custom domain

### **SSL Certificates**
Railway automatically provides SSL certificates for all services

### **Monitoring**
- Railway provides built-in monitoring
- View metrics in dashboard
- Set up alerts for failures

---

## 📋 **Final Checklist**

### **Backend Deployment** ✅
- [ ] Railway project created
- [ ] Backend service deployed
- [ ] Environment variables set
- [ ] MongoDB connection working
- [ ] Health endpoint responding

### **Frontend Deployment** ✅
- [ ] Frontend service deployed
- [ ] API URL configured
- [ ] Environment variables set
- [ ] Frontend connecting to backend

### **Testing** ✅
- [ ] User registration working
- [ ] User login working
- [ ] Project creation working
- [ ] Task creation working
- [ ] All API calls successful

---

## 🎉 **Success!**

Your TaskManager application is now live on Railway.app! 🚀

### **Your Live URLs**
- **Backend**: `https://your-backend-name.railway.app`
- **Frontend**: `https://your-frontend-name.railway.app`

### **What You Have**
- ✅ Fully functional task management system
- ✅ Secure authentication with JWT
- ✅ Real-time database with MongoDB Atlas
- ✅ Modern React frontend
- ✅ Professional Spring Boot backend
- ✅ SSL certificates included
- ✅ Automatic CI/CD from GitHub

### **Next Steps**
1. Share your application with others
2. Monitor performance in Railway dashboard
3. Set up custom domains if needed
4. Add monitoring and alerts

---

## 🆘 **Railway Support**

If you encounter issues:
1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Contact Railway support through dashboard
3. Check community forums and Discord

**Enjoy your deployed TaskManager application! 🎉**
