# 💪 Rehab Exercise Tracker - Progressive Web App

A custom-built mobile-optimized web application for tracking your rehabilitation exercises, assessments, and progress.

## ✨ Features

- **📝 Daily Workout Logging** - Track exercises with left/right leg reps and pain levels
- **📊 Weekly Assessments** - Monitor balance, strength, and pain progress
- **📅 Monthly Assessments** - Track measurements and overall progress
- **📈 History & Analytics** - View all past workouts and assessments
- **💾 Data Export** - Export all data as CSV files for backup
- **📱 Installable** - Add to homescreen and use like a native app
- **🔒 Offline First** - Works completely offline, data stored locally
- **🎯 Phase-Based** - Tailored for 3 rehabilitation phases

## 🚀 Setup Instructions

### Option 1: GitHub Pages (Recommended - FREE)

1. **Create GitHub Account** (if you don't have one)
    - Go to https://github.com
    - Sign up for free

2. **Create New Repository**
    - Click "New Repository"
    - Name it: `rehab-tracker`
    - Make it Public
    - Don't add README
    - Click "Create repository"

3. **Upload Files**
    - Click "uploading an existing file"
    - Drag and drop ALL files from this folder:
        - index.html
        - styles.css
        - app.js
        - exercises.js
        - manifest.json
        - sw.js
        - icon-192.png
        - icon-512.png
    - Click "Commit changes"

4. **Enable GitHub Pages**
    - Go to Settings → Pages
    - Source: "Deploy from a branch"
    - Branch: "main" / "master"
    - Folder: "/ (root)"
    - Click "Save"

5. **Access Your App**
    - Wait 2-3 minutes
    - Your app will be at: `https://[your-username].github.io/rehab-tracker`
    - Bookmark this URL!

### Option 2: Google Drive (Simple)

1. Go to https://drive.google.com
2. Create a new folder called "rehab-tracker"
3. Upload all files
4. Right-click the folder → Share → Anyone with link can view
5. Open `index.html` in the folder
6. Use that link to access

**Note:** Google Drive method may not support PWA features perfectly.

### Option 3: Local Server (For Testing)

If you have Python installed:

```bash
cd rehab-tracker
python -m http.server 8000
```

Then open: http://localhost:8000

## 📱 Installing on Your Phone

### iPhone (Safari):

1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen

### Android (Chrome):

1. Open the app URL in Chrome
2. Tap the menu (⋮) in the top right
3. Tap "Add to Home screen"
4. Tap "Add"
5. The app icon will appear on your home screen

## 📊 Using the App

### Daily Workout:

1. Select your current phase from home screen
2. Go to "Daily Workout"
3. For each exercise:
    - Enter left leg reps
    - Enter right leg reps (app shows target 1.5x for right)
    - Enter sets completed
    - Set pain level (0-10 slider)
    - Add notes if needed
4. Click "Save Workout"

### Weekly Assessment (Every Sunday):

1. Go to "Weekly Assessment"
2. Complete all tests:
    - Single-leg balance (eyes closed)
    - Single-leg bridges (max reps)
    - Balance reaches
    - Pain levels
3. Add notes about progress
4. Save assessment

### Monthly Assessment (End of Month):

1. Go to "Monthly Assessment"
2. Measure and record:
    - Calf circumference (both legs)
    - Thigh circumference (both legs)
3. Check off if photos/video taken
4. Note current phase and readiness
5. Add progress notes
6. Save assessment

### Exporting Data:

1. Go to Menu → Export Data
2. Click "Download CSV Files"
3. Three CSV files will download:
    - `rehab_workouts.csv`
    - `rehab_weekly_assessments.csv`
    - `rehab_monthly_assessments.csv`
4. Import these into your Google Sheet for backup

## 🔒 Data Privacy

- **All data is stored locally** on your device
- **Nothing is sent to any server**
- **No tracking or analytics**
- **You own your data completely**
- Regular exports recommended for backup

## 🆘 Troubleshooting

**App not loading?**

- Clear browser cache
- Try different browser (Chrome/Safari)
- Check if files uploaded correctly

**Can't install to homescreen?**

- Make sure using HTTPS (GitHub Pages provides this)
- Try on different browser
- Check phone settings allow app installation

**Data not saving?**

- Check browser allows local storage
- Clear cache and try again
- Export data before clearing

**Lost data?**

- Check if you have exported CSV backups
- Data only stored on that specific device/browser

## 📞 Support Contacts

- **Hope Physio (BTM):** +91 89991 68508
- **Dr. Shetty's Foot Centre:** +91 80 4953 8629
- **Dr. Akshay Dhanda:** +91 95351 55018

## 🎯 Exercise Phases

### Phase 1: Foundation (Weeks 1-8)

15 exercises focusing on foot/ankle, hip/glute, core, and mobility

### Phase 2: Functional Strength (Weeks 9-20)

Phase 1 + 6 new exercises for single-leg strength and dynamic stability

### Phase 3: Advanced (Week 21+)

Phase 2 + 3 power/plyometric exercises

## 💡 Tips

1. **Backup regularly** - Export data weekly
2. **Be consistent** - Use the app daily
3. **Track honestly** - Accurate pain levels matter
4. **Review history** - Check progress weekly
5. **Update phase** - Progress when ready

## 🔄 Updates

To update the app with new features:

1. Download updated files
2. Replace old files in your hosting location
3. Clear browser cache
4. Refresh the app

---

Built specifically for your PCL reconstruction rehabilitation journey 💪

Last Updated: February 2026
