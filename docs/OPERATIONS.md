# MarketPulse - Operations Runbook

**Version:** 1.0  
**Last Updated:** January 2026  
**Owner:** DevOps / SRE Team

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Incident Response](#incident-response)
5. [Maintenance Procedures](#maintenance-procedures)
6. [Backup & Recovery](#backup--recovery)
7. [Performance Optimization](#performance-optimization)
8. [On-Call Procedures](#on-call-procedures)

---

## Overview

This runbook provides operational procedures for maintaining the MarketPulse platform. It is designed for engineers who are on-call or performing routine maintenance.

### Key Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Primary On-Call | DevOps Team | - |
| Secondary On-Call | Backend Team | 15 minutes |
| Database Admin | DBA Team | 30 minutes |
| Security Team | Security | Immediate (security issues) |

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Availability | 99.5% | Monthly |
| API Response Time (P95) | < 500ms | Per endpoint |
| Error Rate | < 0.5% | Per hour |
| Database Query Time (P95) | < 100ms | Per query |

---

## System Architecture

### Components

```
┌─────────────────┐
│   CloudFlare    │  CDN / DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js App    │  Port 3000 (Docker)
│  (Node 20)      │
└────────┬────────┘
         │
┌────────▼────────┐
│   MongoDB       │  Port 27017
│   (v7.0)        │  Database
└─────────────────┘
```

### Infrastructure Details

| Component | Technology | Location | Backup |
|-----------|------------|----------|--------|
| Frontend/API | Next.js 16 | Docker Container | Image Registry |
| Database | MongoDB 7.0 | MongoDB Atlas / Docker | Daily snapshots |
| File Storage | Local FS | /public/uploads | Volume mount |
| Container Runtime | Docker 24+ | Host OS | - |

### External Dependencies

- **SMTP Server** (Gmail / SendGrid) - Email notifications
- **MongoDB Atlas** (Production) - Primary database
- **GitHub Container Registry** - Docker images
- **DNS Provider** - Domain management

---

## Monitoring & Alerts

### Health Check Endpoints

#### Primary Health Check
```bash
GET /api/health
```

**Expected Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-16T00:00:00.000Z",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "ok",
      "latency": 15
    },
    "memory": {
      "status": "ok",
      "percentage": 45
    }
  }
}
```

**Degraded Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "checks": {
    "database": {
      "status": "error",
      "message": "Connection timeout"
    }
  }
}
```

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate (requests/sec)
   - Response time (P50, P95, P99)
   - Error rate (4xx, 5xx)
   - Active connections

2. **System Metrics**
   - CPU usage (%)
   - Memory usage (%)
   - Disk usage (%)
   - Network I/O

3. **Database Metrics**
   - Connection pool utilization
   - Query execution time
   - Document count
   - Index hit rate

### Monitoring Commands

```bash
# Check application health
curl -s http://localhost:3000/api/health | jq

# Check Docker container status
docker ps --filter name=marketpulse

# Check container logs
docker logs marketpulse-app --tail=100 -f

# Check resource usage
docker stats marketpulse-app --no-stream

# Check MongoDB status
mongosh $MONGODB_URI --eval "db.runCommand({serverStatus: 1})"

# Check disk usage
df -h /var/lib/docker/volumes

# Check application logs
docker logs marketpulse-app --since 1h | grep ERROR
```

### Alert Thresholds

| Alert | Warning | Critical | Action |
|-------|---------|----------|--------|
| CPU Usage | > 70% | > 85% | Scale horizontally |
| Memory Usage | > 75% | > 90% | Restart container |
| Error Rate | > 1% | > 5% | Investigate immediately |
| Response Time | > 1s | > 3s | Check database |
| Disk Usage | > 80% | > 90% | Clean logs/uploads |
| Database Connections | > 80% pool | > 95% pool | Increase pool size |

---

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P0** | Complete outage | < 15 min | Immediate |
| **P1** | Major degradation | < 30 min | 15 min |
| **P2** | Minor issues | < 2 hours | 1 hour |
| **P3** | Non-urgent | Next business day | - |

### Incident Response Checklist

#### Immediate Actions (First 5 minutes)

1. **Acknowledge the incident**
   ```bash
   # Check if services are running
   docker ps
   curl http://localhost:3000/api/health
   ```

2. **Assess severity**
   - Is the site accessible?
   - Are users affected?
   - What is the error rate?

3. **Notify stakeholders** (if P0/P1)
   - Post in #incidents channel
   - Update status page
   - Escalate if needed

#### Investigation (5-15 minutes)

```bash
# Check application logs
docker logs marketpulse-app --tail=200 | grep -i error

# Check system resources
docker stats --no-stream

# Check database connectivity
docker exec marketpulse-mongodb mongosh --eval "db.runCommand({ping:1})"

# Check recent deployments
gh run list --limit 5
```

#### Common Incident Scenarios

##### Scenario 1: Application Not Responding

**Symptoms:** Health check returns 503 or times out

**Diagnosis:**
```bash
# Check if container is running
docker ps -a | grep marketpulse-app

# Check container logs
docker logs marketpulse-app --tail=50

# Check if port is accessible
curl -I http://localhost:3000
```

**Resolution:**
```bash
# Restart application container
docker-compose restart app

# If that fails, rebuild and restart
docker-compose up -d --force-recreate app
```

##### Scenario 2: Database Connection Errors

**Symptoms:** 500 errors, "Cannot connect to database"

**Diagnosis:**
```bash
# Check MongoDB container
docker ps | grep mongodb

# Test connection
mongosh $MONGODB_URI --eval "db.runCommand({ping:1})"

# Check connection pool
# See application logs for pool exhaustion
```

**Resolution:**
```bash
# Restart MongoDB container
docker-compose restart mongodb

# If using MongoDB Atlas, check:
# - IP whitelist
# - Connection string
# - Network connectivity
```

##### Scenario 3: High Memory Usage

**Symptoms:** Application slow, memory > 90%

**Diagnosis:**
```bash
# Check memory usage
docker stats marketpulse-app --no-stream

# Check for memory leaks in logs
docker logs marketpulse-app | grep -i "out of memory"
```

**Resolution:**
```bash
# Restart application (clears memory)
docker-compose restart app

# If recurring, investigate memory leak
# Check for unclosed database connections
```

##### Scenario 4: Disk Space Full

**Symptoms:** Cannot write files, upload errors

**Diagnosis:**
```bash
# Check disk usage
df -h

# Find large directories
du -h /var/lib/docker/volumes | sort -rh | head -20
```

**Resolution:**
```bash
# Clean Docker system
docker system prune -a --volumes

# Clean old logs
docker logs marketpulse-app > /dev/null

# Archive old uploads (if safe)
tar -czf backups/uploads-$(date +%F).tar.gz public/uploads
```

---

## Maintenance Procedures

### Routine Maintenance Schedule

| Task | Frequency | Day/Time | Owner |
|------|-----------|----------|-------|
| Security updates | Weekly | Sunday 2 AM | DevOps |
| Database backup verification | Daily | 3 AM | DBA |
| Log rotation | Daily | 4 AM | DevOps |
| SSL certificate renewal | Every 90 days | Auto | DevOps |
| Dependency updates | Monthly | 1st Sunday | DevOps |
| Performance review | Monthly | 15th | SRE |

### Planned Maintenance Procedure

```bash
# 1. Announce maintenance window (24h advance)
# Post in #announcements and status page

# 2. Create backup before maintenance
./scripts/backup-production.sh

# 3. Put application in maintenance mode
docker-compose down

# 4. Perform maintenance tasks
# (e.g., database migration, system updates)

# 5. Start application
docker-compose up -d

# 6. Verify deployment
./scripts/verify-production.sh

# 7. Monitor for 30 minutes
docker logs marketpulse-app -f

# 8. Close maintenance window
# Update status page
```

### Dependency Updates

```bash
# Update npm dependencies
cd marketpulse
npm outdated
npm update
npm audit fix

# Test locally
npm run test
npm run build

# Deploy via CI/CD
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

---

## Backup & Recovery

### Backup Strategy

| Component | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| Database | Daily | 30 days | MongoDB Atlas Backups |
| Application Config | On change | Forever | Git repository |
| User Uploads | Daily | 30 days | S3 / Volume backup |
| Logs | Daily | 7 days | Log aggregation service |

### Database Backup

```bash
# Manual backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%F)

# Compress backup
tar -czf /backups/db-$(date +%F).tar.gz /backups/$(date +%F)

# Verify backup
tar -tzf /backups/db-$(date +%F).tar.gz | head
```

### Database Restore

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" --drop /backups/2026-01-16

# Verify restore
mongosh $MONGODB_URI --eval "db.users.countDocuments()"
```

### File Upload Backup

```bash
# Backup uploads directory
tar -czf /backups/uploads-$(date +%F).tar.gz public/uploads

# Restore uploads
tar -xzf /backups/uploads-2026-01-16.tar.gz -C public/
```

---

## Performance Optimization

### Database Optimization

```bash
# Check slow queries
mongosh $MONGODB_URI --eval "db.setProfilingLevel(1, {slowms: 100})"

# View slow queries
mongosh $MONGODB_URI --eval "db.system.profile.find().limit(10).pretty()"

# Rebuild indexes
mongosh $MONGODB_URI --eval "db.posts.reIndex()"

# Check index usage
mongosh $MONGODB_URI --eval "db.posts.aggregate([{\$indexStats: {}}])"
```

### Application Performance

```bash
# Enable Node.js profiling
NODE_ENV=production node --prof server.js

# Analyze heap memory
docker exec marketpulse-app node --expose-gc --heap-snapshot-signal=SIGUSR2 server.js
```

### Caching Strategy

```http
# Enable caching headers (future enhancement)
Cache-Control: public, max-age=3600
ETag: "abc123"
```

---

## On-Call Procedures

### On-Call Checklist

**When starting on-call shift:**
- [ ] Test access to all systems
- [ ] Verify monitoring alerts are working
- [ ] Review recent deployments
- [ ] Check for scheduled maintenance
- [ ] Familiarize yourself with current issues

**When receiving an alert:**
1. Acknowledge within 5 minutes
2. Assess severity
3. Follow incident response procedures
4. Document all actions in incident log
5. Communicate status updates every 30 minutes

**When ending on-call shift:**
- [ ] Document all incidents
- [ ] Hand off open issues
- [ ] Update runbook with new findings

### Emergency Contacts

```
Primary On-Call: +1-XXX-XXX-XXXX
Manager: +1-XXX-XXX-XXXX
Security Team: security@company.com
```

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)
- [Testing Guide](../marketpulse/HOW_TO_RUN_TESTS.md)

---

**Document maintained by:** DevOps/SRE Team  
**Review schedule:** Quarterly  
**Last reviewed:** January 2026
