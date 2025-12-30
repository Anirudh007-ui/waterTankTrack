# Complete Deployment Guide - Step by Step

This guide will walk you through deploying your Water Tank Level API to Render.com with Git version control.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account (free)
- [ ] Render.com account (free)
- [ ] All code tested locally (✅ done!)

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Initialize Git Repository**

```bash
# Navigate to project directory
cd /Users/ani/Documents/mycode/waterTankTrack

# Initialize git repository
git init

# Check status
git status
```

**Expected Output:** You'll see all your files listed as untracked.

---

### **STEP 2: Configure Git (First Time Only)**

```bash
# Set your name and email (replace with your details)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

### **STEP 3: Stage All Files**

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

**Note:** Files in `.gitignore` (like `node_modules/`) will be excluded automatically.

---

### **STEP 4: Create Initial Commit**

```bash
# Create your first commit
git commit -m "Initial commit: Water Tank Level API with security features

- Converted Java Spring Boot to Node.js/Express
- Implemented API key authentication
- Added rate limiting and input validation
- Optimized logging for free-tier infrastructure
- Added comprehensive testing tools and documentation"

# Verify commit
git log --oneline
```

---

### **STEP 5: Create GitHub Repository**

1. **Go to GitHub:**
   - Visit [github.com](https://github.com)
   - Sign in to your account

2. **Create New Repository:**
   - Click the "+" icon in top right
   - Select "New repository"
   - Repository name: `waterTankTrack` (or your preferred name)
   - Description: "IoT Water Tank Level Tracking API"
   - Visibility: **Public** (required for Render.com free tier)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Copy Repository URL:**
   - You'll see a page with setup instructions
   - Copy the HTTPS URL (e.g., `https://github.com/YOUR_USERNAME/waterTankTrack.git`)

---

### **STEP 6: Connect Local Repository to GitHub**

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/waterTankTrack.git

# Verify remote
git remote -v
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/waterTankTrack.git
```

---

### **STEP 7: Push to GitHub**

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You'll be prompted for GitHub credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)
  - Create one at: https://github.com/settings/tokens
  - Select "repo" scope

---

### **STEP 8: Verify GitHub Upload**

1. **Check GitHub:**
   - Go to your repository on GitHub
   - Verify all files are uploaded
   - Check that `node_modules/` is NOT included (it's in .gitignore)

2. **Verify Files Present:**
   - ✅ server.js
   - ✅ package.json
   - ✅ README.md
   - ✅ .gitignore
   - ✅ All documentation files

---

### **STEP 9: Deploy to Render.com**

1. **Sign Up/Login to Render:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (recommended for seamless integration)
   - Or sign up with email

2. **Create New Web Service:**
   - Click "New +" button (top right)
   - Select "Web Service"

3. **Connect GitHub Repository:**
   - If not connected, click "Connect GitHub"
   - Authorize Render.com to access your repositories
   - Select your repository: `waterTankTrack`

4. **Configure Service:**
   - **Name:** `water-tank-api` (or your choice)
   - **Region:** Choose closest to your IoT devices
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `.` if required)
   - **Runtime:** `Node`
   - **Build Command:** `npm install` (or leave empty, Render auto-detects)
   - **Start Command:** `npm start`
   - **Plan:** Select **Free** (this is the zero-cost option)

5. **Environment Variables (Optional but Recommended):**
   Click "Advanced" → "Environment Variables" and add:
   ```
   NODE_ENV = production
   ENABLE_LOGGING = false
   ```
   
   **Note:** Don't add API_KEY here if you want to use the hardcoded default for IoT devices.

6. **Create Web Service:**
   - Click "Create Web Service"
   - Render will start deploying (takes 2-3 minutes)

---

### **STEP 10: Monitor Deployment**

1. **Watch Build Logs:**
   - You'll see build progress in real-time
   - Wait for "Your service is live" message

2. **Get Your Live URL:**
   - Once deployed, you'll see a URL like:
   - `https://water-tank-api.onrender.com`
   - **Save this URL!** You'll need it for your IoT devices

3. **Test Live Deployment:**
   ```bash
   # Replace with your actual Render URL
   BASE_URL="https://water-tank-api.onrender.com"
   
   # Health check
   curl $BASE_URL/health
   
   # Test POST (with API key)
   curl -X POST $BASE_URL/api/water-level \
     -H "Content-Type: application/json" \
     -H "x-api-key: WATER_TANK_API_KEY_2024_SECURE" \
     -d '{
       "deviceId": "ESP32_001",
       "distanceCm": "15.5",
       "waterLevelCm": "84.5",
       "waterPercentage": "75.5",
       "tankHeightCm": "100"
     }'
   
   # Test GET
   curl $BASE_URL/api/latest
   ```

---

### **STEP 11: Update IoT Device Code**

Update your ESP32 code with the Render.com URL:

```cpp
// Change this line in your ESP32 code
const char* serverURL = "https://water-tank-api.onrender.com/api/water-level";
```

---

## 🔄 Future Updates (Git Workflow)

### Making Changes and Redeploying:

```bash
# 1. Make your changes to files
# Edit server.js, package.json, etc.

# 2. Test locally
npm start
# Test your changes

# 3. Stage changes
git add .

# 4. Commit changes
git commit -m "Description of your changes"

# 5. Push to GitHub
git push origin main

# 6. Render automatically redeploys (check Render dashboard)
# Wait 2-3 minutes for deployment to complete
```

**Example Commits:**
```bash
# Feature update
git commit -m "Add new endpoint for device status"

# Bug fix
git commit -m "Fix rate limiting issue for multiple devices"

# Documentation
git commit -m "Update README with deployment instructions"
```

---

## 📝 Complete Git Commands Reference

### Initial Setup (One Time)
```bash
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Water Tank Level API"
git remote add origin https://github.com/YOUR_USERNAME/waterTankTrack.git
git branch -M main
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### View History
```bash
# View commit history
git log --oneline

# View changes
git diff

# View what will be committed
git status
```

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] ✅ All code tested locally
- [ ] ✅ Git repository initialized
- [ ] ✅ All files committed
- [ ] ✅ Pushed to GitHub
- [ ] ✅ GitHub repository is public (for free tier)
- [ ] ✅ Render.com account created
- [ ] ✅ Web service created and configured
- [ ] ✅ Environment variables set (if needed)
- [ ] ✅ Deployment successful
- [ ] ✅ Live URL tested and working
- [ ] ✅ IoT device code updated with new URL

---

## 🎯 Quick Reference

### Your Repository Structure:
```
waterTankTrack/
├── server.js                    # Main API server
├── package.json                 # Dependencies
├── .gitignore                  # Git ignore rules
├── README.md                   # Documentation
├── CURL_COMMANDS.md            # API testing guide
├── DEPLOYMENT_GUIDE.md         # This file
└── [other documentation files]
```

### Important URLs:
- **GitHub Repository:** `https://github.com/YOUR_USERNAME/waterTankTrack`
- **Render Dashboard:** `https://dashboard.render.com`
- **Live API URL:** `https://water-tank-api.onrender.com` (your actual URL)

### Important Commands:
```bash
# Start server locally
npm start

# Test locally
./quick-curl-test.sh

# Git commit and push
git add .
git commit -m "Your message"
git push origin main
```

---

## 🚨 Troubleshooting

### Git Issues:

**"fatal: not a git repository"**
```bash
git init
```

**"Permission denied" when pushing**
- Use Personal Access Token instead of password
- Create at: https://github.com/settings/tokens

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/waterTankTrack.git
```

### Render.com Issues:

**Build fails:**
- Check build logs in Render dashboard
- Verify `package.json` has correct start script
- Ensure Node.js version is compatible

**Service not starting:**
- Check start command: `npm start`
- Verify PORT environment variable (Render sets this automatically)
- Check logs for errors

**Cold start delays:**
- Normal on free tier (first request after 15 min inactivity)
- Your 5-second IoT interval should prevent this

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live API at Render.com
- ✅ Automatic deployments from GitHub
- ✅ Version control with Git
- ✅ Production-ready API with security features

**Your API is now live and ready for IoT devices! 🚀**

---

## 📚 Next Steps

1. **Monitor:** Check Render dashboard regularly
2. **Update:** Make changes, commit, push, auto-deploy
3. **Scale:** Upgrade plan if needed (when you outgrow free tier)
4. **Monitor Logs:** Use Render logs for debugging
5. **Set Up Alerts:** Configure monitoring if needed

**Happy Deploying! 🚀**

