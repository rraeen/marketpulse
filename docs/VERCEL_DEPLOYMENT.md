# Vercel Deployment Guide

**Branch:** `vercel-deploy`  
**Last Updated:** January 17, 2026

---

## Overview

The `vercel-deploy` branch contains **only** the MarketPulse application code (from the `marketpulse` folder) at the root level. This allows Vercel to detect and build the Next.js application correctly.

---

## 🎯 **Branch Structure**

### **Main Development Branch (`raunak_dev`)**
```
NewApp/
├── .github/               # CI/CD workflows
├── docs/                  # Documentation
├── marketpulse/          # ← Next.js application
│   ├── src/
│   ├── package.json
│   └── ...
├── scripts/              # Operational scripts
├── docker-compose.yml    # Local development
└── README.md
```

### **Vercel Deployment Branch (`vercel-deploy`)**
```
(root)/
├── src/                  # Next.js application at root
├── package.json         # Next.js dependencies
├── next.config.ts
├── Dockerfile
└── ...
```

---

## 🚀 **Initial Setup in Vercel**

### **Step 1: Connect to Vercel**

1. Go to https://vercel.com/new
2. Import your GitHub repository: `rraeen/marketpulse`
3. **IMPORTANT:** Select the `vercel-deploy` branch (not `raunak_dev` or `main`)

### **Step 2: Configure Project**

Vercel should auto-detect Next.js settings. Verify:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: ./ (leave empty or use default)
```

### **Step 3: Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketpulse?retryWrites=true&w=majority

# Authentication (REQUIRED)
JWT_SECRET=your-32-char-secret-key-here
# Generate with: openssl rand -base64 32

# Application URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=MarketPulse <no-reply@marketpulse.com>

# Build Configuration
BUILD_STANDALONE=true
```

Set for: **Production**, **Preview**, and **Development**

### **Step 4: Deploy**

Click **"Deploy"** and Vercel will build from the `vercel-deploy` branch.

---

## 🔄 **Workflow: Deploying Updates**

When you make changes to the application:

### **1. Develop on `raunak_dev` Branch**

```bash
# Make your changes in marketpulse/ folder
cd marketpulse
# ... make changes ...

# Commit to development branch
git add .
git commit -m "feat: your feature"
git push origin raunak_dev
```

### **2. Update Vercel Deploy Branch**

When ready to deploy to Vercel:

```bash
# From project root
cd c:\Users\user\Desktop\NewApp

# Make sure you're on raunak_dev
git checkout raunak_dev

# Delete old deployment branch
git branch -D vercel-deploy

# Create new deployment branch from marketpulse folder
git subtree split --prefix marketpulse -b vercel-deploy

# Push to GitHub (force update)
git push origin vercel-deploy --force
```

### **3. Vercel Auto-Deploys**

Vercel will automatically detect the push and redeploy your application.

---

## 📝 **Automated Script (Coming Soon)**

To make this easier, you can create a PowerShell script:

```powershell
# deploy-to-vercel.ps1
git checkout raunak_dev
git pull origin raunak_dev
git branch -D vercel-deploy
git subtree split --prefix marketpulse -b vercel-deploy
git push origin vercel-deploy --force
Write-Host "✅ Deployed to Vercel branch successfully!"
```

Usage:
```powershell
.\deploy-to-vercel.ps1
```

---

## 🔍 **Verify Deployment**

### **Check Build Logs**

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check "Building" tab for logs

You should see:
```
✓ Detected Next.js
✓ Installing dependencies...
✓ Building...
✓ Compiled successfully
```

### **Test Deployed Application**

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "checks": {
    "database": { "status": "ok" }
  }
}
```

---

## ⚠️ **Important Notes**

### **Do NOT Push to `vercel-deploy` Manually**

Always use `git subtree split` to update the `vercel-deploy` branch. Never:
- Checkout `vercel-deploy` and make changes
- Merge other branches into `vercel-deploy`

### **Root Directory Setting**

Since the `vercel-deploy` branch has the Next.js app at root:
- Root Directory in Vercel should be: **empty** or `./`
- Do NOT set it to `marketpulse`

### **Branch Protection**

Consider protecting the `vercel-deploy` branch:
1. Go to GitHub → Settings → Branches
2. Add rule for `vercel-deploy`
3. Enable "Require status checks to pass before merging"

---

## 🐛 **Troubleshooting**

### **Issue: Build Fails - "No Next.js Detected"**

**Solution:** Verify Vercel is using the `vercel-deploy` branch:
- Go to Vercel Dashboard → Settings → Git
- Check "Production Branch" is set to `vercel-deploy`

### **Issue: Old Code Deployed**

**Solution:** Rebuild the deployment branch:
```bash
git branch -D vercel-deploy
git subtree split --prefix marketpulse -b vercel-deploy
git push origin vercel-deploy --force
```

### **Issue: Environment Variables Missing**

**Solution:** Check Vercel Dashboard → Settings → Environment Variables
- Ensure all required variables are set
- Verify they're enabled for "Production" environment
- Redeploy after adding variables

---

## 📊 **Monitoring**

### **Vercel Analytics**

Enable in Vercel Dashboard:
- Go to Analytics tab
- View real-time traffic, performance metrics
- Monitor Web Vitals

### **Error Tracking**

Integration options:
- Sentry (recommended)
- LogRocket
- Datadog

Add integration keys to Environment Variables.

---

## 🔄 **Rollback**

If deployment fails:

```bash
# Find last working commit
git log vercel-deploy

# Reset to that commit
git checkout vercel-deploy
git reset --hard <commit-hash>
git push origin vercel-deploy --force

# Or in Vercel Dashboard:
# Deployments → Find working deployment → "Promote to Production"
```

---

## 📚 **Related Documentation**

- [Main Deployment Guide](./DEPLOYMENT.md)
- [Operations Runbook](./OPERATIONS.md)
- [Security Guide](./SECURITY.md)

---

**Maintained by:** DevOps Team  
**Last Updated:** January 17, 2026
