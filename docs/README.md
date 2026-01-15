# MarketPulse - DevOps Documentation

**Version:** 1.0  
**Last Updated:** January 2026

---

## Overview

This directory contains comprehensive operational documentation for the MarketPulse platform. These documents are essential for deploying, operating, and maintaining the application in production.

---

## Document Index

### 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md)
**Complete deployment guide for all environments**

- Environment strategy (local, staging, production)
- Step-by-step deployment procedures
- Rollback procedures
- Troubleshooting common issues

**Use when:** Deploying to any environment, setting up local development

---

### 🔧 [OPERATIONS.md](./OPERATIONS.md)
**Operational runbook for day-to-day maintenance**

- System architecture overview
- Monitoring and alerting
- Incident response procedures
- Maintenance schedules
- Backup and recovery
- On-call procedures

**Use when:** On-call rotation, investigating incidents, routine maintenance

---

### 🔒 [SECURITY.md](./SECURITY.md)
**Security hardening and best practices**

- Security architecture
- Secrets management
- Authentication and authorization
- Network security
- Security checklist
- Incident response

**Use when:** Security reviews, onboarding new team members, handling security incidents

---

## Quick Start

### For New Developers

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) → "Local Development Setup"
2. Clone repository and set up environment
3. Run tests to verify setup
4. Join #dev channel for questions

### For DevOps Engineers

1. Read all three documents
2. Verify access to production systems
3. Test deployment to staging
4. Join on-call rotation

### For Security Reviews

1. Read [SECURITY.md](./SECURITY.md)
2. Run security checklist
3. Review recent audit logs
4. Update security documentation if needed

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│          Internet / Users               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         CloudFlare (CDN/DDoS)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Next.js Application (Docker)       │
│      - Frontend (React 19)              │
│      - API Routes (Next.js)             │
│      - Port: 3000                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       MongoDB 7.0 Database              │
│       - Port: 27017                     │
│       - Collections: users, posts       │
└─────────────────────────────────────────┘
```

---

## Key Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 20.x LTS |
| **Framework** | Next.js | 16.1.2 |
| **UI Library** | React | 19.2.3 |
| **Database** | MongoDB | 7.0 |
| **Authentication** | JWT (jose) | 6.1.3 |
| **Container** | Docker | 24+ |
| **CI/CD** | GitHub Actions | - |
| **Testing** | Jest + Playwright | Latest |

---

## Environment Overview

### Local Development
- **URL:** http://localhost:3000
- **Database:** MongoDB in Docker or local install
- **Deployment:** Manual (`docker-compose up`)

### Staging
- **URL:** https://staging.marketpulse.com
- **Database:** MongoDB Atlas (Staging)
- **Deployment:** Automatic on merge to `develop` branch

### Production
- **URL:** https://marketpulse.com
- **Database:** MongoDB Atlas (Production)
- **Deployment:** Automatic on merge to `main` + Manual approval required

---

## CI/CD Pipeline

### Continuous Integration (CI)

Runs on every push and pull request:

1. **Lint** - ESLint, TypeScript checks
2. **Test** - Unit tests (Jest) + E2E tests (Playwright)
3. **Build** - Next.js production build
4. **Security Scan** - npm audit, Trivy

See: `.github/workflows/ci.yml`

### Continuous Deployment (CD)

#### Staging Pipeline
- **Trigger:** Merge to `develop` branch
- **Steps:** Build image → Push to registry → Deploy to staging → Smoke tests
- **Approval:** Automatic

See: `.github/workflows/cd-staging.yml`

#### Production Pipeline
- **Trigger:** Merge to `main` branch or Git tag
- **Steps:** Build image → Push to registry → **Manual approval** → Deploy to production → Post-deployment tests
- **Approval:** **Required** (via GitHub Environments)

See: `.github/workflows/cd-production.yml`

---

## Common Tasks

### Deploy to Staging
```bash
git checkout develop
git pull origin develop
git merge feature/my-feature
git push origin develop
# Deployment automatically triggered
```

### Deploy to Production
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
# Wait for manual approval in GitHub Actions
```

### Run Tests Locally
```bash
cd marketpulse
npm test                  # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # With coverage
```

### Check Application Health
```bash
curl http://localhost:3000/api/health
```

### View Logs
```bash
docker logs marketpulse-app -f
```

### Backup Database
```bash
./scripts/backup-production.sh
```

---

## Monitoring & Alerts

### Health Check Endpoint
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok", "latency": 15 },
    "memory": { "status": "ok", "percentage": 45 }
  }
}
```

### Key Metrics
- Request rate (requests/sec)
- Response time (P95 < 500ms)
- Error rate (< 0.5%)
- CPU/Memory usage
- Database connection pool

### Alert Thresholds
- **Warning:** CPU > 70%, Memory > 75%
- **Critical:** CPU > 85%, Memory > 90%
- **Page:** Error rate > 5%, Downtime > 1 minute

---

## Security Summary

### Authentication
- JWT tokens (7-day expiration)
- bcrypt password hashing (cost factor 12)
- Role-based access control (Admin/User)

### Network Security
- Rate limiting (100 req/15 min)
- CORS policy (whitelisted origins)
- Security headers (HSTS, X-Frame-Options, CSP)
- TLS 1.3 encryption

### Data Security
- MongoDB authentication required
- Encryption at rest (MongoDB Atlas)
- Regular security scans (npm audit, Trivy)

### Secrets Management
- Local: `.env.local` (gitignored)
- CI/CD: GitHub Secrets
- Production: Environment variables

---

## Troubleshooting

### Application won't start
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Check Docker containers
docker ps -a

# View logs
docker logs marketpulse-app
```

### Database connection errors
```bash
# Test connection
mongosh $MONGODB_URI --eval "db.runCommand({ping:1})"

# Check MongoDB container
docker ps | grep mongodb
```

### Tests failing
```bash
# Run with verbose output
npm test -- --verbose

# Check specific test file
npm test -- tests/unit/services/auth.test.ts
```

---

## Support & Escalation

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| **P0 - Outage** | On-call engineer | < 15 min |
| **P1 - Major issue** | DevOps team | < 30 min |
| **P2 - Minor issue** | Dev team | < 2 hours |
| **Questions** | #dev channel | Best effort |

### Contacts
- DevOps Team: devops@company.com
- Security Team: security@company.com
- On-Call: +1-XXX-XXX-XXXX

---

## Contributing to Documentation

### When to Update
- After deploying major changes
- After resolving incidents (add to troubleshooting)
- When processes change
- Quarterly review

### How to Update
1. Edit relevant document(s)
2. Update "Last Updated" date
3. Create pull request
4. Get approval from DevOps lead
5. Merge to main

---

## Additional Resources

### Internal Documentation
- [Backend API README](../marketpulse/backend-readme.md)
- [Testing Guide](../marketpulse/HOW_TO_RUN_TESTS.md)
- [Architecture Docs](../Artecuter/Artecture.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Maintained by:** DevOps Team  
**Review Schedule:** Monthly  
**Last Review:** January 2026
