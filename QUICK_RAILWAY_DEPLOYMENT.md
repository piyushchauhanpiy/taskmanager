# Quick Railway Deployment with Current GitHub Account

## 🚀 **Ready to Deploy with Current Setup**

Your current GitHub configuration is ready for Railway deployment:
- **User**: `piyushchauhanpiyush`
- **Email**: `chauhanpiyush922@gmail.co`

## 📋 **Deployment Steps**

### **1. Push to GitHub**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### **2. Deploy Backend on Railway**
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Choose your repository
5. **Root directory**: `/` (project root)
6. **Build command**: `mvn clean package -DskipTests`
7. **Start command**: `mvn spring-boot:run`
8. Add environment variables

### **3. Deploy Frontend on Railway**
1. In same project, click **"New Service"**
2. Select same repository
3. **Root directory**: `taskmanagerFrontend/`
4. **Build command**: `npm run build`
5. **Start command**: `npm start`
6. Add environment variables

## 🔧 **Environment Variables**

### **Backend Environment Variables**
```bash
MONGODB_URI=mongodb+srv://chauhanpiyush6397:Piyush12345@cluster0.2fy9t3j.mongodb.net/taskmanager
MONGODB_DATABASE=taskmanager
JWT_SECRET=your-super-secure-256-bit-jwt-secret-key-change-this
JWT_EXPIRATION=86400000
LOG_LEVEL=INFO
PORT=8080
```

### **Frontend Environment Variables**
```bash
REACT_APP_API_URL=https://your-backend-name.railway.app
REACT_APP_API_TIMEOUT=30000
REACT_APP_SUCCESS_MESSAGE_DURATION=5000
REACT_APP_ERROR_MESSAGE_DURATION=5000
REACT_APP_TASK_SUCCESS_DURATION=3000
```

## 🎯 **What You'll Get**

- **Backend URL**: `https://your-backend-name.railway.app`
- **Frontend URL**: `https://your-frontend-name.railway.app`
- **SSL Certificates**: Automatic
- **CI/CD**: Automatic from GitHub
- **Monitoring**: Built-in health checks

## 🚀 **Ready to Deploy!**

Your project is fully configured and ready for Railway deployment with your current GitHub account. Just follow the steps above and your TaskManager application will be live in minutes! 🎉
