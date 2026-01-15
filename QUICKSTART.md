# MarketPulse - Quick Start Guide

**Get running in under 5 minutes!**

---

## 🚀 Local Development (Fastest)

### Prerequisites
- Docker Desktop installed and running
- Git installed

### Steps

```bash
# 1. Navigate to project
cd c:\Users\user\Desktop\NewApp

# 2. Create environment file
cd marketpulse
copy .env.example .env.local

# 3. Start everything with Docker
cd ..
docker-compose up -d

# 4. Wait 30 seconds for services to start
# Then open: http://localhost:3000

# 5. Seed admin user
cd marketpulse
npm run seed:admin
```

### Default Login
```
Email: admin@marketpulse.com
Password: ChangeThisPassword123!
```

**Admin Panel:** http://localhost:3000/admin

---

## 📋 What's Running?

After `docker-compose up -d`:

| Service | URL | Purpose |
|---------|-----|---------|
| **MarketPulse App** | http://localhost:3000 | Main application |
| **MongoDB** | mongodb://localhost:27017 | Database |
| **MongoDB UI** | http://localhost:8081 | Database admin (admin/admin123) |

---

## ✅ Verify Everything Works

```bash
# Check health
curl http://localhost:3000/api/health

# Should return: {"status":"healthy",...}
```

---

## 🧪 Run Tests

```bash
cd marketpulse

# Unit tests (62 tests)
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 🚢 Deploy to Staging

```bash
# 1. Ensure all tests pass
cd marketpulse
npm test

# 2. Commit your changes
git add .
git commit -m "feat: my changes"

# 3. Push to develop branch
git push origin develop

# GitHub Actions will automatically:
# - Run CI pipeline
# - Build Docker image
# - Deploy to staging
# - Run smoke tests
```

**Monitor deployment:** https://github.com/your-org/your-repo/actions

---

## 📖 Documentation

- **Getting Started:** [README.md](./README.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Operations:** [docs/OPERATIONS.md](./docs/OPERATIONS.md)
- **Security:** [docs/SECURITY.md](./docs/SECURITY.md)
- **DevOps Summary:** [DEVOPS_SUMMARY.md](./DEVOPS_SUMMARY.md)

---

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Stop everything
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Run linting
cd marketpulse && npm run lint

# Check for security issues
npm audit
```

---

## 🆘 Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Then restart: docker-compose up -d
```

### Database connection error
```bash
# Restart MongoDB
docker-compose restart mongodb

# Check if it's running
docker ps | grep mongodb
```

### Can't see changes
```bash
# Rebuild the container
docker-compose down
docker-compose up -d --build
```

---

## 📞 Need Help?

1. Check [docs/OPERATIONS.md](./docs/OPERATIONS.md) - Troubleshooting section
2. Check [marketpulse/HOW_TO_RUN_TESTS.md](./marketpulse/HOW_TO_RUN_TESTS.md)
3. Review application logs: `docker-compose logs -f`

---

**Ready to ship! 🎉**
