# TaskManager Frontend Deployment Guide

## 🚀 Deployment Options

### 1. Netlify (Recommended for Static Hosting)

#### Setup Steps
1. **Create Netlify Account**: [netlify.com](https://netlify.com)
2. **Connect Repository**: Link your GitHub/GitLab repository
3. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18` or higher

#### Environment Variables
Set these in Netlify dashboard under Site settings → Environment variables:
```
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_TITLE=TaskManager
REACT_APP_DESCRIPTION=Professional Task Management System
```

#### Redirect Rules (netlify.toml)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Vercel

#### Setup Steps
1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: `vercel --prod`

#### Environment Variables
Create `.vercel` file:
```json
{
  "build": {
    "env": {
      "REACT_APP_API_URL": "https://your-backend-api.com"
    }
  }
}
```

### 3. AWS S3 + CloudFront

#### Build and Deploy
```bash
# Build for production
npm run build

# Install AWS CLI and configure
aws configure

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### S3 Bucket Configuration
- **Static website hosting**: Enabled
- **Index document**: `index.html`
- **Error document**: `index.html`
- **Public access**: Block all public access (use CloudFront)

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Build and Run
```bash
# Build Docker image
docker build -t taskmanager-frontend .

# Run container
docker run -p 80:80 taskmanager-frontend
```

## 🔧 Environment Configuration

### Development Environment (.env.development)
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_DEVTOOLS=true
REACT_APP_TITLE=TaskManager - Development
```

### Production Environment (.env.production)
```env
REACT_APP_API_URL=https://taskmanager-api.yourdomain.com
REACT_APP_DEVTOOLS=false
REACT_APP_TITLE=TaskManager
REACT_APP_DESCRIPTION=Professional Task Management System
```

### Staging Environment (.env.staging)
```env
REACT_APP_API_URL=https://staging-api.yourdomain.com
REACT_APP_DEVTOOLS=false
REACT_APP_TITLE=TaskManager - Staging
```

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] Update API URL in production environment
- [ ] Remove development-only console logs
- [ ] Optimize images and assets
- [ ] Test all functionality in production build

### 2. Security
- [ ] Ensure HTTPS is enabled
- [ ] Disable React DevTools in production
- [ ] Remove sensitive data from client-side code
- [ ] Set proper CORS policies on backend

### 3. Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Implement caching strategies
- [ ] Optimize bundle size

### 4. SEO and Analytics
- [ ] Update meta tags and titles
- [ ] Add Google Analytics (if needed)
- [ ] Set up error tracking (Sentry)
- [ ] Configure sitemap for search engines

## 🌐 Domain Configuration

### Custom Domain Setup
1. **DNS Configuration**: Point your domain to deployment platform
2. **SSL Certificate**: Enable HTTPS (usually automatic)
3. **Subdomain**: Consider using `app.yourdomain.com`

### Example DNS Records
```
A Record: @ -> 192.168.1.1 (deployment IP)
A Record: www -> 192.168.1.1
CNAME: api -> your-backend-domain.com
```

## 🔍 Testing Production Build

### Local Production Testing
```bash
# Build for production
npm run build

# Serve locally for testing
npx serve -s build -l 3000

# Or use Python
python -m http.server 3000 --directory build
```

### Testing Checklist
- [ ] All pages load correctly
- [ ] API calls work with production URL
- [ ] Authentication flow works
- [ ] Responsive design on mobile
- [ ] Error handling works properly
- [ ] Performance is acceptable

## 📊 Monitoring and Maintenance

### Performance Monitoring
- **Google PageSpeed Insights**: Test site performance
- **GTmetrix**: Monitor loading times
- **Web Vitals**: Track Core Web Vitals

### Error Tracking
- **Sentry**: Error monitoring and reporting
- **Google Analytics**: User behavior analytics
- **Log aggregation**: Centralized logging

### Backup Strategy
- **Code repository**: Git with proper branching
- **Configuration backups**: Environment variables and settings
- **Database backups**: Regular automated backups

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=build --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🆘 Troubleshooting

### Common Issues
1. **API Connection Errors**: Check REACT_APP_API_URL
2. **Blank White Screen**: Check for JavaScript errors in console
3. **Routing Issues**: Ensure server handles client-side routing
4. **CORS Errors**: Configure backend CORS properly
5. **Build Failures**: Check for missing dependencies or syntax errors

### Debug Steps
1. **Check Console**: Look for JavaScript errors
2. **Network Tab**: Verify API requests are working
3. **Environment Variables**: Confirm they're set correctly
4. **Build Logs**: Check for build warnings or errors
5. **Server Logs**: Check deployment platform logs

---

**Ready for deployment! 🚀** Follow this guide to successfully deploy your TaskManager frontend to production.
