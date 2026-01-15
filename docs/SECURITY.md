# MarketPulse - Security Hardening Guide

**Version:** 1.0  
**Last Updated:** January 2026  
**Owner:** Security & DevOps Teams

---

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Secrets Management](#secrets-management)
4. [Authentication & Authorization](#authentication--authorization)
5. [Network Security](#network-security)
6. [Application Security](#application-security)
7. [Database Security](#database-security)
8. [Security Checklist](#security-checklist)
9. [Incident Response](#incident-response)

---

## Overview

This document outlines security best practices and hardening measures for the MarketPulse platform. All team members must follow these guidelines.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum required permissions
3. **Fail Secure** - Default to deny access
4. **Security by Design** - Security from the start
5. **Audit Everything** - Log all security events

### Compliance Requirements

- GDPR (Data Protection)
- OWASP Top 10 (Web Security)
- PCI DSS (if handling payments in Phase 2)

---

## Security Architecture

### Trust Boundaries

```
Internet → CloudFlare → Application → Database
   ↓          ↓             ↓            ↓
Untrusted  DDoS/WAF   Authentication  Encrypted
           TLS 1.3      JWT Tokens    At Rest
```

### Security Layers

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Network** | DDoS, Rate Limiting | CloudFlare, Express Rate Limiter |
| **Transport** | TLS 1.3 | SSL/TLS certificates |
| **Application** | Input Validation, CSRF | express-validator, DOMPurify |
| **Authentication** | JWT, bcrypt | jose, bcryptjs |
| **Authorization** | Role-based access | Middleware checks |
| **Data** | Encryption at rest | MongoDB encryption |

---

## Secrets Management

### Critical Secrets

**NEVER commit these to Git:**

- `JWT_SECRET` - JWT signing key
- `MONGODB_URI` - Database connection string (with credentials)
- `SMTP_USER` / `SMTP_PASS` - Email credentials
- API keys for external services
- SSL private keys

### Local Development

```bash
# Store in .env.local (gitignored)
cp .env.example .env.local

# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Set in .env.local
JWT_SECRET=<generated-secret>
```

### Staging & Production

Use GitHub Secrets for CI/CD:

```yaml
# GitHub Repository → Settings → Secrets
MONGODB_URI_STAGING
MONGODB_URI_PRODUCTION
JWT_SECRET_STAGING
JWT_SECRET_PRODUCTION
SMTP_USER
SMTP_PASS
```

### Secret Rotation Schedule

| Secret | Rotation Frequency | Process |
|--------|-------------------|---------|
| JWT_SECRET | Every 90 days | Generate new, deploy, invalidate old |
| Database Password | Every 90 days | Update in MongoDB Atlas + .env |
| SMTP Password | Every 180 days | Update with provider |
| SSL Certificates | Every 365 days | Automatic (Let's Encrypt) |

### Secret Generation

```bash
# Strong JWT secret (32+ bytes)
openssl rand -base64 32

# Database password (16+ chars)
openssl rand -base64 16 | tr -dc 'a-zA-Z0-9!@#$%^&*'

# API key (32 chars)
node -e "console.log(require('crypto').randomUUID().replace(/-/g, ''))"
```

---

## Authentication & Authorization

### Password Security

**Requirements (Enforced):**
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- No common passwords (checked against dictionary)
- Hashed with bcrypt (cost factor 12)

**Implementation:**
```typescript
// src/lib/utils/password-validation.ts
export function validatePassword(password: string): boolean {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
}
```

### JWT Token Security

**Token Configuration:**
- Algorithm: HS256 (HMAC with SHA-256)
- Expiration: 7 days (configurable)
- Payload: User ID, role, issued timestamp
- Storage: httpOnly cookies (client-side)

**Token Validation:**
```typescript
// Verify token on every protected route
const token = cookies.get('token');
const payload = await jwtVerify(token, JWT_SECRET);
```

**Token Refresh Strategy:**
```bash
# Current: 7-day tokens
# Future: Short-lived access tokens (15 min) + refresh tokens (30 days)
```

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| **Admin** | Create/edit/delete posts, manage users |
| **User** | View posts, manage own profile |
| **Guest** | View public posts only |

**Implementation:**
```typescript
// Middleware: src/lib/auth-helper.ts
export async function requireAdmin(request: Request) {
  const user = await getUser(request);
  if (user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}
```

---

## Network Security

### Rate Limiting

**Implemented:** `src/lib/utils/rate-limiter.ts`

```typescript
// Default limits
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

// Stricter limits for sensitive endpoints
POST /api/auth/login: 5 requests / 15 minutes
POST /api/auth/register: 3 requests / hour
POST /api/posts: 10 requests / minute (admin only)
```

### CORS Policy

```typescript
// next.config.ts
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://marketpulse.com',
  'https://www.marketpulse.com',
];

// Only allow specified origins
headers: {
  'Access-Control-Allow-Origin': allowedOrigins,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
  'Access-Control-Allow-Credentials': 'true',
}
```

### Security Headers

**Required Headers (Add to next.config.ts):**

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

### SSL/TLS Configuration

**Requirements:**
- TLS 1.3 (or minimum TLS 1.2)
- Strong cipher suites only
- HTTP Strict Transport Security (HSTS)
- Automatic certificate renewal

```bash
# Let's Encrypt (recommended for production)
certbot certonly --standalone -d marketpulse.com -d www.marketpulse.com
```

---

## Application Security

### Input Validation

**All user inputs must be validated:**

```typescript
// Using express-validator
import { body, validationResult } from 'express-validator';

// Email validation
body('email').isEmail().normalizeEmail()

// Sanitize HTML content
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### XSS Prevention

**Measures:**
1. Escape all user-generated content
2. Use DOMPurify for HTML sanitization
3. Content Security Policy (CSP)
4. React's built-in XSS protection

```typescript
// src/lib/utils/search-sanitization.ts
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}
```

### SQL/NoSQL Injection Prevention

**MongoDB:**
```typescript
// Never use string concatenation
❌ Bad: db.collection('users').find({ email: req.body.email })

// Use parameterized queries
✅ Good: db.collection('users').find({ email: String(req.body.email) })

// Validate ObjectId
import { isValidObjectId } from '@/lib/utils/objectid-validation';
if (!isValidObjectId(id)) throw new Error('Invalid ID');
```

### File Upload Security

**Implemented:** `src/app/api/posts/route.ts`

```typescript
// Restrictions
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Validation
if (file.size > MAX_FILE_SIZE) throw new Error('File too large');
if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Invalid file type');

// Rename files (prevent path traversal)
const safeFilename = `${uuid()}.${extension}`;
```

### CSRF Protection

**Built-in with Next.js:**
- SameSite cookies
- Origin checking
- Custom token validation (future)

---

## Database Security

### MongoDB Security

**Configuration:**

```javascript
// Connection with authentication
mongodb://username:password@host:27017/database?authSource=admin

// Enable access control
mongod --auth --bind_ip localhost
```

**User Permissions:**

```javascript
// Application user (least privilege)
db.createUser({
  user: 'marketpulse_app',
  pwd: '<strong-password>',
  roles: [
    { role: 'readWrite', db: 'marketpulse' }
  ]
});

// Admin user (separate)
db.createUser({
  user: 'marketpulse_admin',
  pwd: '<strong-password>',
  roles: [
    { role: 'dbAdmin', db: 'marketpulse' }
  ]
});
```

### Data Encryption

**At Rest:**
- MongoDB Atlas: Encryption enabled by default
- Self-hosted: Use encrypted volumes

**In Transit:**
- TLS for all database connections
- Verify SSL certificates

```typescript
// Connection string with TLS
mongodb+srv://user:pass@host/db?tls=true&tlsCAFile=/path/to/ca.pem
```

### Backup Security

```bash
# Encrypt backups
mongodump --uri="$MONGODB_URI" --gzip --archive | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -out backup.enc

# Store in secure location
aws s3 cp backup.enc s3://secure-backups/ --sse AES256
```

---

## Security Checklist

### Development Phase

- [ ] All dependencies up to date (`npm audit`)
- [ ] No secrets in code or Git history
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced in all environments
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Password hashing with bcrypt (cost >= 12)

### Pre-Deployment

- [ ] Security scan completed (`npm audit`, Trivy)
- [ ] Penetration testing performed
- [ ] SSL certificates configured
- [ ] Secrets rotated and stored securely
- [ ] Database access restricted by IP
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Backup and recovery tested

### Post-Deployment

- [ ] Health checks passing
- [ ] Security logs being collected
- [ ] Rate limiting working correctly
- [ ] SSL certificate auto-renewal configured
- [ ] Database backups running
- [ ] Monitoring alerts configured
- [ ] Team trained on security procedures

---

## Incident Response

### Security Incident Types

| Type | Examples | Response Time |
|------|----------|---------------|
| **P0** | Data breach, RCE | Immediate |
| **P1** | Authentication bypass | < 1 hour |
| **P2** | XSS, CSRF | < 4 hours |
| **P3** | Outdated dependencies | < 24 hours |

### Response Procedure

1. **Detect** - Alert received or vulnerability reported
2. **Contain** - Isolate affected systems
3. **Eradicate** - Remove threat, patch vulnerability
4. **Recover** - Restore normal operations
5. **Post-Mortem** - Document and learn

### Security Incident Template

```markdown
## Incident Report

**Date:** YYYY-MM-DD
**Severity:** P0/P1/P2/P3
**Reporter:** Name
**Status:** Open/Resolved

### Description
[What happened]

### Impact
[Affected users/data/systems]

### Timeline
- HH:MM - Incident detected
- HH:MM - Team notified
- HH:MM - Containment actions taken
- HH:MM - Resolution deployed

### Root Cause
[Why it happened]

### Remediation
[What was done]

### Prevention
[Future measures]
```

### Emergency Contacts

```
Security Team: security@company.com
CISO: +1-XXX-XXX-XXXX
Legal: legal@company.com
```

---

## Security Tools

### Automated Scanning

```bash
# Dependency vulnerabilities
npm audit --audit-level=moderate

# Container security
trivy image marketpulse:latest

# OWASP ZAP (web app scanning)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://marketpulse.com

# Git secrets scanning
git-secrets --scan
```

### Manual Testing

```bash
# Test authentication
curl -X POST https://marketpulse.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# Test rate limiting
for i in {1..10}; do
  curl -X POST https://marketpulse.com/api/auth/login
done

# Test CORS
curl -H "Origin: https://evil.com" https://marketpulse.com/api/posts
```

---

## Compliance & Auditing

### Audit Logging

**Log these events:**
- User authentication (success/failure)
- Admin actions (create/edit/delete posts)
- Password changes
- Failed authorization attempts
- Database queries (in debug mode)

**Log format:**
```json
{
  "timestamp": "2026-01-16T00:00:00.000Z",
  "level": "info",
  "event": "user_login",
  "userId": "123",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0..."
}
```

### Data Privacy (GDPR)

- [ ] Privacy policy published
- [ ] User consent for data collection
- [ ] Data retention policy documented
- [ ] User data export capability
- [ ] User data deletion capability (Right to be forgotten)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Document maintained by:** Security & DevOps Teams  
**Review schedule:** Quarterly or after security incidents  
**Last reviewed:** January 2026
