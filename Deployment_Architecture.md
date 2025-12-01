# Deployment Architecture

## Current Deployment: Local Development

### Overview
The system is currently deployed in a **local development environment** for testing and demonstration purposes. Both the client and server run on the same machine (localhost).

---

## Architecture Components

### 1. Client Application
- **Technology**: React + Vite
- **Port**: `5173` (default Vite dev server)
- **URL**: `http://localhost:5173`
- **Deployment**: Development server (`npm run dev`)
- **Build Tool**: Vite (fast HMR, ES modules)

### 2. Server Application
- **Technology**: Node.js + Express + Socket.io
- **Port**: `5000`
- **URL**: `http://localhost:5000`
- **Deployment**: Node.js process (`npm start`)
- **Process Manager**: None (manual start)

### 3. Database
- **Technology**: MongoDB
- **Connection**: Local MongoDB instance or MongoDB Atlas (cloud)
- **Connection String**: `mongodb://localhost:27017/secure-messaging` or Atlas URI
- **Collections**: `users`, `files`

### 4. File Storage
- **Encrypted Files**: `server/uploads/` directory
- **Security Logs**: `logs/security.log`
- **Storage Type**: Local file system

---

## Network Architecture (Local)

```
┌─────────────────────────────────────────────────────┐
│                   Localhost                         │
│                                                     │
│  ┌──────────────┐         ┌──────────────┐        │
│  │   Browser    │         │   Browser    │        │
│  │  (Alice)     │         │   (Bob)      │        │
│  │ Port: 5173   │         │ Port: 5173   │        │
│  └──────┬───────┘         └──────┬───────┘        │
│         │                        │                 │
│         │    HTTP/WebSocket      │                 │
│         └────────┬───────────────┘                 │
│                  │                                  │
│         ┌────────▼─────────┐                       │
│         │  Vite Dev Server │                       │
│         │   Port: 5173     │                       │
│         └────────┬─────────┘                       │
│                  │                                  │
│         ┌────────▼─────────┐                       │
│         │  Express Server  │                       │
│         │  + Socket.io     │                       │
│         │   Port: 5000     │                       │
│         └────────┬─────────┘                       │
│                  │                                  │
│         ┌────────▼─────────┐                       │
│         │    MongoDB       │                       │
│         │  Port: 27017     │                       │
│         └──────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## Production Deployment Recommendations

### Option 1: Cloud Deployment (Recommended)

#### Client (Frontend)
- **Platform**: Vercel, Netlify, or AWS S3 + CloudFront
- **Build**: `npm run build` (creates optimized static files)
- **CDN**: Automatic with Vercel/Netlify
- **HTTPS**: Automatic SSL certificates
- **Environment Variables**: 
  - `VITE_API_URL`: Production server URL

#### Server (Backend)
- **Platform**: AWS EC2, Heroku, DigitalOcean, or Railway
- **Process Manager**: PM2 for process management
- **Reverse Proxy**: Nginx for load balancing
- **HTTPS**: Let's Encrypt SSL certificates
- **Environment Variables**:
  - `PORT`: Server port
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `JWT_SECRET`: Secret key for JWT
  - `NODE_ENV`: production

#### Database
- **Platform**: MongoDB Atlas (managed cloud database)
- **Tier**: M0 (free) or M10+ (production)
- **Backup**: Automatic backups enabled
- **Security**: IP whitelist, authentication enabled

#### File Storage
- **Platform**: AWS S3 or DigitalOcean Spaces
- **Encryption**: Server-side encryption enabled
- **Access**: Presigned URLs for secure access

---

### Option 2: Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  client:
    build: ./client
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
  
  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/secure-messaging
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Security Considerations for Production

### 1. HTTPS/TLS
- **Requirement**: CRITICAL
- **Implementation**: Use Let's Encrypt or cloud provider SSL
- **Reason**: Protects JWT tokens and prevents session hijacking

### 2. Environment Variables
- **Never commit**: `.env` files to version control
- **Use**: Cloud provider's secret management (AWS Secrets Manager, Heroku Config Vars)

### 3. CORS Configuration
```javascript
// Production CORS
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 4. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Database Security
- Enable authentication
- Use strong passwords
- Restrict IP access
- Enable encryption at rest

---

## Monitoring & Logging

### Production Monitoring
- **Application**: PM2 monitoring, New Relic, or Datadog
- **Logs**: Winston logger + cloud logging (CloudWatch, Loggly)
- **Uptime**: UptimeRobot or Pingdom
- **Error Tracking**: Sentry

### Log Rotation
```javascript
// Winston configuration for production
const winston = require('winston');
require('winston-daily-rotate-file');

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

---

## Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx or AWS ALB
- **Multiple Server Instances**: PM2 cluster mode or Kubernetes
- **Session Management**: Redis for shared session storage
- **WebSocket**: Socket.io with Redis adapter for multi-instance support

### Database Scaling
- **Read Replicas**: MongoDB replica sets
- **Sharding**: For very large datasets
- **Caching**: Redis for frequently accessed data

---

## Deployment Checklist

### Pre-Deployment
- [ ] Update all dependencies
- [ ] Run security audit (`npm audit`)
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure database backups

### Deployment
- [ ] Build client (`npm run build`)
- [ ] Deploy client to CDN/hosting
- [ ] Deploy server to cloud platform
- [ ] Set up MongoDB Atlas
- [ ] Configure DNS records
- [ ] Test all endpoints
- [ ] Verify WebSocket connections
- [ ] Test end-to-end encryption

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test from different networks
- [ ] Set up automated backups
- [ ] Document deployment process

---

## Current vs Production Comparison

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **Client URL** | http://localhost:5173 | https://yourdomain.com |
| **Server URL** | http://localhost:5000 | https://api.yourdomain.com |
| **Database** | Local MongoDB | MongoDB Atlas |
| **HTTPS** | ❌ No | ✅ Yes (Required) |
| **Process Manager** | Manual | PM2/Docker |
| **File Storage** | Local disk | AWS S3/Spaces |
| **Monitoring** | Console logs | Winston + Cloud |
| **Scaling** | Single instance | Load balanced |
| **Backup** | Manual | Automated |
| **Cost** | Free | $10-50/month |

---

## Estimated Production Costs (Monthly)

- **Hosting (Server)**: $5-15 (Heroku, Railway, DigitalOcean)
- **Database**: $0-9 (MongoDB Atlas M0 free, M10 $9)
- **CDN (Client)**: $0 (Vercel/Netlify free tier)
- **File Storage**: $1-5 (AWS S3, first 5GB free)
- **SSL Certificate**: $0 (Let's Encrypt)
- **Monitoring**: $0-20 (Basic free, advanced paid)

**Total**: $6-49/month for small to medium scale
