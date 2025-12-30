# Deployment Steps - Copy & Paste Commands

Follow these steps in order. Copy and paste each command into your terminal.

---

## 🔧 STEP 1: Initialize Git Repository

```bash
cd /Users/ani/Documents/mycode/waterTankTrack
git init
```

---

## 📝 STEP 2: Configure Git (If Not Already Done)

```bash
git config user.name "Anirudh007-ui"
git config user.email "anirudhdelhi010@gmail.com"
```

---

## 📦 STEP 3: Stage All Files

```bash
git add .
```

**Verify what will be committed:**
```bash
git status
```

You should see all your files listed. `node_modules/` should NOT appear (it's in .gitignore).

---

## 💾 STEP 4: Create Initial Commit

```bash
git commit -m "Initial commit: Water Tank Level API with security features

- Converted Java Spring Boot to Node.js/Express
- Implemented API key authentication
- Added rate limiting and input validation
- Optimized logging for free-tier infrastructure
- Added comprehensive testing tools and documentation"
```

**Verify commit:**
```bash
git log --oneline
```

You should see your commit listed.

---

## 🌐 STEP 5: Create GitHub Repository

**Manual Steps (in browser):**

1. Go to: https://github.com/new
2. Repository name: `waterTankTrack`
3. Description: `IoT Water Tank Level Tracking API`
4. Visibility: **Public** ✅ (required for Render.com free tier)
5. **DO NOT** check "Add a README file"
6. **DO NOT** check "Add .gitignore"
7. **DO NOT** check "Choose a license"
8. Click "Create repository"

**After creating, copy your repository URL:**
- It will look like: `https://github.com/Anirudh007-ui/waterTankTrack.git`
- Save this URL for the next step

---

## 🔗 STEP 6: Connect to GitHub

**Replace `Anirudh007-ui` with your actual GitHub username if different:**

```bash
git remote add origin https://github.com/Anirudh007-ui/waterTankTrack.git
```

**Verify remote:**
```bash
git remote -v
```

You should see:
```
origin  https://github.com/Anirudh007-ui/waterTankTrack.git (fetch)
origin  https://github.com/Anirudh007-ui/waterTankTrack.git (push)
```

---

## 📤 STEP 7: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (NOT your GitHub password)
  - Create token at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Name: "Render Deployment"
  - Select scope: **repo** (check the box)
  - Click "Generate token"
  - **Copy the token immediately** (you won't see it again)
  - Use this token as your password

---

## ✅ STEP 8: Verify GitHub Upload

1. Go to: https://github.com/Anirudh007-ui/waterTankTrack
2. Verify all files are there:
   - ✅ server.js
   - ✅ package.json
   - ✅ README.md
   - ✅ .gitignore
   - ✅ All documentation files
3. Verify `node_modules/` is NOT there (it's in .gitignore)

---

## 🚀 STEP 9: Deploy to Render.com

### 9.1 Sign Up/Login
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email

### 9.2 Create Web Service
1. Click "New +" button (top right)
2. Select "Web Service"

### 9.3 Connect GitHub
1. If not connected, click "Connect GitHub"
2. Authorize Render.com
3. Select repository: `waterTankTrack`

### 9.4 Configure Service
Fill in these settings:

- **Name:** `water-tank-api` (or your choice)
- **Region:** Choose closest to your location
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `Node`
- **Build Command:** `npm install` (or leave empty)
- **Start Command:** `npm start`
- **Plan:** Select **Free** ✅

### 9.5 Environment Variables (Optional)
Click "Advanced" → "Environment Variables":

Add these (optional):
```
NODE_ENV = production
ENABLE_LOGGING = false
```

**Note:** Don't add API_KEY if you want to use the hardcoded default.

### 9.6 Deploy
1. Click "Create Web Service"
2. Watch the build logs
3. Wait for "Your service is live" message (2-3 minutes)

---

## 🧪 STEP 10: Test Live Deployment

**Get your Render URL:**
- It will look like: `https://water-tank-api.onrender.com`
- Copy this URL

**Test with curl:**

```bash
# Replace with your actual Render URL
BASE_URL="https://water-tank-api.onrender.com"

# Health check
curl $BASE_URL/health

# Test POST
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

## 📱 STEP 11: Update IoT Device

Update your ESP32 code:

```cpp
// Change this line:
const char* serverURL = "https://water-tank-api.onrender.com/api/water-level";
```

Replace `water-tank-api` with your actual Render service name.

---

## 🔄 Future Updates

**When you make changes:**

```bash
# 1. Make your changes
# Edit files as needed

# 2. Test locally
npm start

# 3. Stage changes
git add .

# 4. Commit
git commit -m "Description of changes"

# 5. Push to GitHub
git push origin main

# 6. Render automatically redeploys (check dashboard)
```

---

## ✅ Deployment Checklist

- [ ] Git initialized
- [ ] Git configured
- [ ] Files staged and committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Render.com account created
- [ ] Web service created
- [ ] Deployment successful
- [ ] Live URL tested
- [ ] IoT device code updated

---

## 🎉 Success!

Your API is now live at: `https://water-tank-api.onrender.com`

**Next Steps:**
1. Monitor Render dashboard
2. Update IoT devices with new URL
3. Test with real devices
4. Monitor logs if needed

**Happy Deploying! 🚀**

