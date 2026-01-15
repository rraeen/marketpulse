# MarketPulse - Financial Advisory Platform

**Version:** 1.0.0  
**Phase:** Phase 1 (Foundational Content Hub)  
**Status:** Production Ready

---

## Overview

MarketPulse is a professional financial advisory content platform built with Next.js, React, and MongoDB. It enables financial advisers to publish market insights, analysis, and investment guidance while building an engaged subscriber base.

### Key Features

✅ **Content Management System (CMS)**
- Create, edit, and publish financial content
- Rich text editor with image uploads
- Category-based organization
- Draft/Published workflow

✅ **Public Content Hub**
- Responsive, modern UI
- Category filtering
- Full-text search
- Professional financial industry design

✅ **User Management**
- Email-based registration
- JWT authentication
- Role-based access (Admin/User)
- User profiles

✅ **Notifications**
- Email notifications for new posts
- Subscriber management
- Premium interest tracking

✅ **Production-Ready Infrastructure**
- Docker containerization
- CI/CD pipelines
- Health monitoring
- Automated testing

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 19.2.3 |
| **Framework** | Next.js | 16.1.2 |
| **Language** | TypeScript | 5.x |
| **Database** | MongoDB | 7.0 |
| **Styling** | Tailwind CSS | 4.x |
| **Authentication** | JWT (jose) | 6.1.3 |
| **Testing** | Jest + Playwright | Latest |
| **Container** | Docker | 24+ |
| **CI/CD** | GitHub Actions | - |

---

## Quick Start

### Prerequisites

- Node.js 20.x LTS
- Docker 24+ and Docker Compose
- Git 2.x+

### Local Development (Docker - Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd NewApp

# 2. Create environment file
cd marketpulse
cp .env.example .env.local

# 3. Update .env.local with your configuration
# Edit the file with your MONGODB_URI, JWT_SECRET, etc.

# 4. Start services
cd ..
docker-compose up -d

# 5. Wait for services to be healthy
docker-compose ps

# 6. Seed admin user
cd marketpulse
npm run seed:admin

# 7. Open browser
# Frontend: http://localhost:3000
# MongoDB UI: http://localhost:8081
```

### Local Development (Manual)

```bash
# 1. Install MongoDB locally or use MongoDB Atlas

# 2. Install dependencies
cd marketpulse
npm install

# 3. Create .env.local
cp .env.example .env.local
# Edit .env.local with your database connection

# 4. Run development server
npm run dev

# 5. Seed admin user (in another terminal)
npm run seed:admin
```

### Default Admin Credentials

```
Email: admin@marketpulse.com
Password: ChangeThisPassword123!
```

**⚠️ Change these immediately after first login!**

---

## Project Structure

```
NewApp/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml          # Continuous Integration
│       ├── cd-staging.yml  # Staging deployment
│       └── cd-production.yml # Production deployment
├── docs/                   # Comprehensive documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   ├── OPERATIONS.md       # Operations runbook
│   ├── SECURITY.md         # Security guidelines
│   └── README.md          # Documentation index
├── marketpulse/           # Main application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── api/       # API routes
│   │   │   ├── admin/     # Admin CMS pages
│   │   │   └── ...        # Public pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and services
│   │   │   ├── models/    # Data models
│   │   │   ├── services/  # Business logic
│   │   │   └── utils/     # Helper functions
│   │   └── ...
│   ├── tests/             # Test suites
│   │   ├── unit/          # Unit tests
│   │   └── e2e/           # End-to-end tests
│   ├── Dockerfile         # Production Docker image
│   └── package.json
├── scripts/               # Operational scripts
│   ├── backup-production.sh
│   ├── verify-production.sh
│   ├── smoke-test.sh
│   └── mongo-init.js
├── docker-compose.yml     # Local development
├── docker-compose.prod.yml # Production setup
└── README.md              # This file
```

---

## Available Scripts

### In `marketpulse/` directory:

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run E2E tests with UI

# Linting
npm run lint             # Run ESLint

# Database
npm run seed:admin       # Create admin user
```

### In root directory:

```bash
# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f app        # View application logs
docker-compose restart app        # Restart application

# Operational scripts (Linux/Mac)
./scripts/verify-production.sh   # Verify deployment
./scripts/backup-production.sh   # Backup database
./scripts/smoke-test.sh local    # Run smoke tests
```

---

## Testing

### Unit Tests

```bash
cd marketpulse
npm test

# Expected output:
# Test Suites: 6 passed, 6 total
# Tests:       62 passed, 62 total
# Coverage:    ~73% statements
```

### E2E Tests

```bash
cd marketpulse
npm run test:e2e

# Tests:
# - User registration/login flow
# - Admin CMS functionality
# - Post creation/editing
```

See [HOW_TO_RUN_TESTS.md](./marketpulse/HOW_TO_RUN_TESTS.md) for details.

---

## Deployment

### Environments

| Environment | URL | Branch | Approval |
|-------------|-----|--------|----------|
| **Local** | http://localhost:3000 | - | Manual |
| **Staging** | https://staging.marketpulse.com | `develop` | Automatic |
| **Production** | https://marketpulse.com | `main` | **Required** |

### Deployment Process

**Staging (Automatic):**
```bash
git checkout develop
git merge feature/my-feature
git push origin develop
# Automatically deploys to staging
```

**Production (Manual Approval Required):**
```bash
git checkout main
git merge develop
git push origin main
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
# Requires manual approval in GitHub Actions
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete guide.

---

## Documentation

### For Developers
- [Testing Guide](./marketpulse/HOW_TO_RUN_TESTS.md)
- [Backend API README](./marketpulse/backend-readme.md)

### For DevOps
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Operations Runbook](./docs/OPERATIONS.md)
- [Security Guide](./docs/SECURITY.md)

### For Product/Business
- [Requirements](./REQUIREMENTS.md)
- [Architecture](./Artecuter/Artecture.md)

---

## Monitoring & Health Checks

### Health Endpoint

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-16T00:00:00.000Z",
  "uptime": 86400,
  "checks": {
    "database": { "status": "ok", "latency": 15 },
    "memory": { "status": "ok", "percentage": 45 }
  }
}
```

### Monitoring Dashboard

- Application logs: `docker logs marketpulse-app -f`
- Database UI: http://localhost:8081 (dev only)
- Health checks: Every 30 seconds (Docker)

---

## Security

### Best Practices Implemented

✅ JWT authentication with httpOnly cookies  
✅ Password hashing with bcrypt (cost 12)  
✅ Input validation and sanitization  
✅ Rate limiting (100 req/15 min)  
✅ CORS policy  
✅ Security headers (HSTS, X-Frame-Options, etc.)  
✅ MongoDB access control  
✅ Docker non-root user  
✅ Environment variable protection  

See [docs/SECURITY.md](./docs/SECURITY.md) for complete guide.

---

## Troubleshooting

### Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database connection errors

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Test connection
mongosh $MONGODB_URI --eval "db.runCommand({ping:1})"
```

### Docker build fails

```bash
# Clear cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

See [docs/OPERATIONS.md](./docs/OPERATIONS.md) for more troubleshooting.

---

## Contributing

### Branching Strategy

- `main` - Production code
- `develop` - Staging code
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with clear commit messages
3. Run tests locally: `npm test && npm run lint`
4. Create PR to `develop` branch
5. Wait for CI checks to pass
6. Get approval from team lead
7. Merge and deploy to staging automatically

---

## Support & Contact

### Internal Teams

- **DevOps Team:** devops@company.com
- **Development Team:** dev@company.com
- **Security Team:** security@company.com

### On-Call

- **Primary:** +1-XXX-XXX-XXXX
- **Escalation:** See [docs/OPERATIONS.md](./docs/OPERATIONS.md)

### Channels

- **Slack:** #marketpulse-dev
- **Incidents:** #incidents
- **Deployments:** #deployments

---

## Roadmap

### Phase 1 (Current) - Content Hub ✅
- [x] CMS for content management
- [x] Public content discovery
- [x] User registration
- [x] Email notifications
- [x] Production infrastructure

### Phase 2 (Future) - Monetization
- [ ] Premium content tiers
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Analytics dashboard

### Phase 3 (Future) - Advanced Features
- [ ] Real-time data feeds
- [ ] Interactive charts
- [ ] Mobile app
- [ ] Comments/discussion

---

## License

Proprietary - All Rights Reserved

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)

---

**Maintained by:** Development & DevOps Teams  
**Last Updated:** January 2026  
**Version:** 1.0.0
