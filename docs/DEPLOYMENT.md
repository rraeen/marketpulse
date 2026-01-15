# MarketPulse - Deployment Guide

**Version:** 1.0  
**Last Updated:** January 2026  
**Owner:** DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Strategy](#environment-strategy)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment](#production-deployment)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This document provides step-by-step instructions for deploying MarketPulse across all environments. All deployments follow automated CI/CD pipelines with safety checks and rollback capabilities.

### Deployment Philosophy

- **Automated by default** - Manual steps are documented exceptions
- **Environment parity** - Dev, staging, and prod are configured identically
- **Fail fast** - Pipelines stop at first error
- **Reversible** - Every deployment can be rolled back
- **Observable** - Every step is logged and monitored

---

## Environment Strategy

### Environment Definitions

| Environment | Purpose | Database | URL | Deployment Trigger |
|-------------|---------|----------|-----|-------------------|
| **Local** | Developer workstation | MongoDB (Docker) | http://localhost:3000 | Manual |
| **Staging** | Pre-production testing | MongoDB Atlas (Staging) | https://staging.marketpulse.com | Merge to `develop` |
| **Production** | Live customer-facing | MongoDB Atlas (Prod) | https://marketpulse.com | Merge to `main` + Manual approval |

### Environment Variables

Each environment requires these variables (see `.env.example`):

**Critical (Must be unique per environment):**
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Authentication secret (min 32 chars)
- `NEXT_PUBLIC_APP_URL` - Public-facing URL

**Email Configuration:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**Optional:**
- `RATE_LIMIT_MAX_REQUESTS`
- `LOG_LEVEL`

---

## Prerequisites

### For All Deployments

1. **Access Requirements:**
   - GitHub repository access
   - Docker installed (local)
   - Production secrets access (production only)

2. **Secrets Management:**
   - Local: `.env.local` file
   - CI/CD: GitHub Secrets
   - Production: Environment-specific secrets

3. **Tools Required:**
   ```bash
   - Node.js 20.x
   - Docker 24.x+
   - Git 2.x+
   ```

---

## Local Development Setup

### Quick Start (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd NewApp

# 2. Create environment file
cp marketpulse/.env.example marketpulse/.env.local

# 3. Update .env.local with your values
# Edit marketpulse/.env.local

# 4. Start services with Docker Compose
docker-compose up -d

# 5. Wait for services to be healthy
docker-compose ps

# 6. Seed admin user
cd marketpulse
npm run seed:admin

# 7. Access application
# Frontend: http://localhost:3000
# MongoDB UI: http://localhost:8081 (admin/admin123)
```

### Manual Setup (Without Docker)

```bash
# 1. Install MongoDB locally or use MongoDB Atlas

# 2. Install dependencies
cd marketpulse
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Update MONGODB_URI in .env.local
MONGODB_URI=mongodb://localhost:27017/marketpulse

# 5. Run development server
npm run dev

# 6. Seed admin user (in another terminal)
npm run seed:admin
```

### Verify Local Setup

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": { "status": "ok" }
#   }
# }
```

---

## Staging Deployment

### Automatic Deployment

Staging deploys automatically when code is merged to the `develop` branch.

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. Create Pull Request to develop branch

# 5. After PR approval and merge:
# → CI/CD pipeline automatically:
#    - Runs tests
#    - Builds Docker image
#    - Deploys to staging
#    - Runs smoke tests
```

### Manual Deployment

```bash
# Trigger manual staging deployment
gh workflow run cd-staging.yml

# Monitor deployment progress
gh run list --workflow=cd-staging.yml
```

### Verify Staging Deployment

```bash
# 1. Check health endpoint
curl https://staging.marketpulse.com/api/health

# 2. Test authentication
curl -X POST https://staging.marketpulse.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketpulse.com","password":"<password>"}'

# 3. Verify frontend loads
curl -I https://staging.marketpulse.com
```

---

## Production Deployment

### Prerequisites

✅ **Required before production deployment:**

1. All tests passing in CI
2. Staging deployment successful and tested
3. Database backup completed
4. Team notification sent
5. Maintenance window scheduled (if required)

### Deployment Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Update version numbers
# Edit package.json, update version

# 3. Create Pull Request to main branch

# 4. After PR approval, merge to main

# 5. Create Git tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 6. GitHub Actions will:
#    - Run full test suite
#    - Build production Docker image
#    - Wait for manual approval
#    - Deploy to production
#    - Run post-deployment tests
```

### Manual Approval

Production deployments require manual approval in GitHub Actions:

1. Navigate to Actions tab in GitHub
2. Find "CD - Deploy to Production" workflow
3. Review deployment details
4. Click "Review deployments"
5. Select "production" environment
6. Click "Approve and deploy"

### Deployment Verification Checklist

After production deployment:

- [ ] Health check endpoint returns 200
- [ ] Frontend loads successfully
- [ ] Admin can log in
- [ ] Users can register
- [ ] Search functionality works
- [ ] Post creation works
- [ ] Email notifications are sent
- [ ] No error logs in monitoring

```bash
# Run verification script
./scripts/verify-production.sh
```

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- Critical functionality is broken
- Database connectivity issues
- Authentication failures
- Widespread user-reported errors
- Security vulnerability discovered

### Automatic Rollback

If post-deployment tests fail, the pipeline automatically rolls back.

### Manual Rollback

```bash
# Option 1: Rollback to previous Docker image
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull marketpulse:previous-tag
docker-compose -f docker-compose.prod.yml up -d

# Option 2: Redeploy previous Git tag
git checkout v1.0.0  # Previous stable version
git push origin v1.0.0 --force  # Triggers deployment

# Option 3: Database rollback (if needed)
# Restore from backup (see OPERATIONS.md)
```

### Rollback Verification

```bash
# 1. Verify application is running
curl https://marketpulse.com/api/health

# 2. Check version
curl https://marketpulse.com/api/version

# 3. Test critical paths
./scripts/smoke-test.sh production
```

### Post-Rollback Actions

1. Document incident in incident log
2. Create bug report with reproduction steps
3. Schedule post-mortem meeting
4. Fix issue in hotfix branch
5. Deploy hotfix following standard process

---

## Troubleshooting

### Common Issues

#### Issue: Docker build fails

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Issue: Database connection fails

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh $MONGODB_URI --eval "db.runCommand({ping:1})"
```

#### Issue: Port 3000 already in use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <pid> /F

# Or change port in .env.local
PORT=3001
```

#### Issue: Environment variables not loading

```bash
# Verify .env.local exists
ls -la marketpulse/.env.local

# Check file is not ignored
git check-ignore marketpulse/.env.local

# Restart Next.js dev server
npm run dev
```

### Getting Help

1. Check logs: `docker-compose logs -f app`
2. Review GitHub Actions logs
3. Consult [OPERATIONS.md](./OPERATIONS.md)
4. Contact DevOps team

---

## Additional Resources

- [Operations Runbook](./OPERATIONS.md)
- [Security Hardening Guide](./SECURITY.md)
- [Monitoring Setup](./MONITORING.md)
- [Backend API Documentation](../marketpulse/backend-readme.md)
- [Testing Guide](../marketpulse/HOW_TO_RUN_TESTS.md)

---

**Document maintained by:** DevOps Team  
**Review schedule:** Monthly  
**Last reviewed:** January 2026
