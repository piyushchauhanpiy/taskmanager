# TaskManager Backend Deployment Guide

## 🚀 Deployment Options

### 1. Traditional Server Deployment

#### Prerequisites
- **Java 21** or higher
- **Maven 3.6+**
- **MongoDB Atlas** (cloud) or local MongoDB
- **Server** (Linux/Windows/macOS)

#### Setup Steps
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your production values
   ```

3. **Build Application**:
   ```bash
   mvn clean package -DskipTests
   ```

4. **Run Application**:
   ```bash
   java -jar target/taskmanager-0.0.1-SNAPSHOT.jar --spring.profiles.active=production
   ```

### 2. Docker Deployment

#### Dockerfile
```dockerfile
FROM openjdk:21-jdk-slim

# Install Maven
RUN apt-get update && apt-get install -y maven

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/taskmanager-0.0.1-SNAPSHOT.jar"]
```

#### Multi-stage Dockerfile (Optimized)
```dockerfile
# Build stage
FROM maven:3.9-openjdk-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:21-jre-slim
WORKDIR /app
COPY --from=build /app/target/taskmanager-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

#### Build and Run
```bash
# Build Docker image
docker build -t taskmanager-backend .

# Run container
docker run -d \
  --name taskmanager-api \
  -p 8080:8080 \
  --env-file .env.production \
  taskmanager-backend
```

### 3. Cloud Platform Deployment

#### Heroku
1. **Create Heroku Account**: [heroku.com](https://heroku.com)
2. **Install Heroku CLI**: `npm install -g heroku`
3. **Login**: `heroku login`
4. **Create App**: `heroku create taskmanager-api`
5. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
   heroku config:set JWT_SECRET="your-super-secure-secret"
   ```
6. **Deploy**: `git push heroku main`

#### AWS Elastic Beanstalk
1. **Install AWS CLI**: Configure with your credentials
2. **Create Application**: `aws elasticbeanstalk create-application`
3. **Deploy**: Use EB CLI or upload JAR file
4. **Environment Variables**: Set in AWS console

#### Google Cloud Platform
1. **Create Project**: Google Cloud Console
2. **Use App Engine**: Deploy Spring Boot application
3. **Set Environment Variables**: In cloud console

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
MONGODB_DATABASE=taskmanager

# Server
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secure-256-bit-production-jwt-secret-key
JWT_EXPIRATION=86400000

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=WARN
LOG_FILE_PATH=logs/taskmanager.log

# Application
NODE_ENV=production
DEBUG=false
```

### Security Best Practices
1. **JWT Secret**: Use a strong, unique 256+ character secret
2. **MongoDB**: Use Atlas with strong authentication
3. **HTTPS**: Enable SSL/TLS termination
4. **Firewall**: Restrict access to port 8080
5. **Environment Variables**: Never commit sensitive data

## 📋 Pre-Deployment Checklist

### 1. Security
- [ ] Change default JWT secret
- [ ] Use production MongoDB credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up proper CORS origins
- [ ] Remove debug logging

### 2. Database
- [ ] Create production MongoDB database
- [ ] Set up backup strategy
- [ ] Configure user permissions
- [ ] Test connection string

### 3. Performance
- [ ] Optimize MongoDB indexes
- [ ] Configure connection pooling
- [ ] Set up monitoring
- [ ] Test load capacity

### 4. Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up log aggregation
- [ ] Configure health checks

## 🐳 Docker Compose (Full Stack)

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: taskmanager-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: taskmanager
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    container_name: taskmanager-api
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/taskmanager
      JWT_SECRET: your-super-secure-secret
      NODE_ENV: production
    ports:
      - "8080:8080"
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs

volumes:
  mongodb_data:
```

#### Run with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Health Checks

### Health Check Endpoint
The application includes a health check at `/actuator/health`

### Monitoring Endpoints
```bash
# Health status
curl http://localhost:8080/actuator/health

# Application info
curl http://localhost:8080/actuator/info

# Metrics (if enabled)
curl http://localhost:8080/actuator/metrics
```

## 📊 Monitoring and Logging

### Application Logging
```properties
# Production logging configuration
logging.level.org.springframework=WARN
logging.level.com.chauhanpiyush.taskmanager=WARN
logging.file.name=logs/taskmanager.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30
```

### Monitoring Tools
- **Spring Boot Actuator**: Built-in health checks
- **Micrometer**: Metrics collection
- **Sentry**: Error tracking
- **Datadog**: Application monitoring
- **New Relic**: APM and monitoring

## 🔧 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '21'
      - name: Run tests
        run: mvn test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '21'
      - name: Build application
        run: mvn clean package -DskipTests
      - name: Deploy to production
        run: |
          # Your deployment script here
          echo "Deploying to production..."
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MongoDB URI format
# Verify network connectivity
# Check firewall rules
# Validate credentials
```

#### 2. JWT Token Issues
```bash
# Verify JWT secret is set
# Check token expiration
# Validate token format
```

#### 3. CORS Errors
```bash
# Check CORS allowed origins
# Verify frontend URL is whitelisted
# Check preflight requests
```

#### 4. Memory Issues
```bash
# Increase JVM heap size
java -Xmx2g -jar taskmanager.jar

# Check for memory leaks
# Monitor GC activity
```

### Debug Commands
```bash
# Check application logs
tail -f logs/taskmanager.log

# Monitor system resources
top
htop

# Check network connectivity
netstat -tulpn | grep :8080

# Test API endpoints
curl -X GET http://localhost:8080/actuator/health
```

## 🚀 Production Optimization

### JVM Tuning
```bash
# Production JVM settings
java -Xms1g -Xmx2g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+UseStringDeduplication \
     -jar taskmanager.jar
```

### Database Optimization
```javascript
// MongoDB indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.projects.createIndex({ "adminId": 1 })
db.tasks.createIndex({ "projectId": 1 })
db.tasks.createIndex({ "assignedTo": 1 })
db.tasks.createIndex({ "createdBy": 1 })
```

### Caching Strategy
```java
// Enable application caching
@EnableCaching
@Cacheable("users")
public User getUserById(String id) {
    return userRepository.findById(id);
}
```

---

**Ready for production deployment! 🚀** Follow this guide to successfully deploy your TaskManager backend to production.
