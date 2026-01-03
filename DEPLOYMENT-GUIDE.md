# 🚀 GRIMS Website - Complete Deployment Guide

This guide will take you from zero to a live website in about 30 minutes!

---

## ✅ CHECKLIST - Things You Need

Before starting, make sure you have:

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Supabase account created
- [ ] GitHub account created (for deployment)
- [ ] Vercel account created (optional, for hosting)
- [ ] Project folder extracted

---

## 📋 PART 1: LOCAL SETUP (20 minutes)

### Step 1: Install Node.js (5 minutes)

1. Go to https://nodejs.org/
2. Download the **LTS version** (left button)
3. Run the installer
4. Keep clicking "Next" until it finishes
5. Open terminal/command prompt and test:
```bash
node --version
```
You should see something like `v20.x.x`

### Step 2: Install Git (3 minutes)

1. Go to https://git-scm.com/
2. Download for your operating system
3. Install with default settings
4. Test in terminal:
```bash
git --version
```

### Step 3: Install Dependencies (3 minutes)

1. Open terminal/command prompt
2. Navigate to project folder:
```bash
cd /path/to/grims-website
```
Example Windows: `cd C:\Users\YourName\Desktop\grims-website`
Example Mac: `cd ~/Desktop/grims-website`

3. Install packages:
```bash
npm install
```
⏱️ This will take 2-3 minutes. You'll see a progress bar.

---

## 🗄️ PART 2: SUPABASE SETUP (10 minutes)

### Step 1: Create Supabase Project (3 minutes)

1. Go to https://supabase.com/
2. Click "Start your project" → Sign up with GitHub or email
3. Once logged in, click "New Project"
4. Fill in:
   ```
   Organization: [Create new or use existing]
   Name: grims-codm
   Database Password: [CREATE A STRONG PASSWORD AND SAVE IT!]
   Region: Europe West (closest to Ghana)
   ```
5. Click "Create new project"
6. ⏱️ Wait 2-3 minutes (the dashboard will show "Setting up project...")

### Step 2: Get API Credentials (2 minutes)

Once your project is ready:

1. Click the ⚙️ **Settings** icon in the sidebar
2. Click **API** section
3. You'll see two important values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this!

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
Copy this too!

💡 **TIP:** Keep this tab open, you'll need these values soon!

### Step 3: Create Database Tables (3 minutes)

1. In Supabase dashboard, click **SQL Editor** (icon looks like </>)
2. Click "+ New Query" button
3. Open the `supabase-setup.sql` file from your project folder
4. Copy **ALL** the SQL code (Ctrl+A, Ctrl+C)
5. Paste it into the Supabase query editor
6. Click **RUN** (bottom right) or press F5
7. You should see:
   ```
   ✅ Tables created successfully!
   ✅ 4 rows returned
   ```

### Step 4: Create Admin User (2 minutes)

1. Click **Authentication** in sidebar (shield icon)
2. Click **Users** tab
3. Click "Add User" → "Create new user"
4. Fill in:
   ```
   Email: admin@grims.com
   Password: grimsadmin123
   ```
5. Click "Create user"
6. ✅ You should see the user in the list

---

## ⚙️ PART 3: CONFIGURE PROJECT (2 minutes)

### Step 1: Create Environment File

1. In your project folder, find `.env.local.example`
2. Make a copy and rename it to `.env.local` (remove `.example`)
3. Open `.env.local` in any text editor
4. Replace the placeholder values with YOUR values from Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Save the file

---

## ▶️ PART 4: RUN LOCALLY (1 minute)

### Start Development Server

In your terminal (in the project folder):

```bash
npm run dev
```

You should see:
```
✔ Ready in 2.3s
○ Local: http://localhost:3000
```

### Open in Browser

1. Open your browser
2. Go to: **http://localhost:3000**
3. 🎉 You should see the GRIMS website!

### Test It Out

- Click around the pages
- Check the leaderboard
- View tournaments
- Try the contact form
- Go to `/admin` and login with:
  - Email: `admin@grims.com`
  - Password: `grimsadmin123`

---

## 🌐 PART 5: DEPLOY TO VERCEL (15 minutes)

Now let's make it live on the internet!

### Step 1: Push to GitHub (5 minutes)

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name: `grims-website`
   - Keep it Public
   - Don't initialize with README
   - Click "Create repository"

2. In your terminal (in project folder):

```bash
# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - GRIMS CODM website"

# Connect to GitHub (replace YOUR_USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grims-website.git

# Push to GitHub
git push -u origin main
```

3. Refresh your GitHub page - you should see all your files!

### Step 2: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com/
2. Click "Sign Up" → Choose "Continue with GitHub"
3. Once logged in, click "Add New..." → "Project"
4. You'll see your GitHub repositories
5. Find `grims-website` and click "Import"

### Step 3: Configure Deployment (3 minutes)

1. Vercel auto-detects Next.js ✅
2. Click "Environment Variables"
3. Add your two variables:

**First Variable:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://xxxxxxxxxxxxx.supabase.co` (your Supabase URL)
- Click "Add"

**Second Variable:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGci...` (your Supabase anon key)
- Click "Add"

4. Click "Deploy"

### Step 4: Wait for Deployment (2 minutes)

You'll see a cool animation and build logs.

After 2-3 minutes, you'll see:
```
🎉 Congratulations! Your project has been deployed!
```

Click "Visit" to see your live site!

You'll get a URL like:
```
https://grims-website-xyz123.vercel.app
```

---

## 🎯 PART 6: TESTING YOUR LIVE SITE (5 minutes)

### Test Everything

Visit each page:
- ✅ Home page loads
- ✅ Leaderboard shows players
- ✅ Tournaments show your event
- ✅ About page displays
- ✅ Contact form works
- ✅ Admin panel accessible

### Add Tournament Results

1. Go to `your-url.vercel.app/admin`
2. Login with admin credentials
3. Select your tournament
4. Add some test results
5. Submit
6. Check leaderboard - points should update!

---

## 🎨 PART 7: CUSTOMIZATION (Optional)

### Add Your Logo

1. Save your logo as `logo.png` in the `public/` folder
2. Update these files:
   - `components/Hero.js`
   - `components/Navbar.js`
   - `components/Footer.js`

### Update Colors

Edit `tailwind.config.js` to change neon colors:
```js
neon: {
  blue: '#00f0ff',    // Change these hex codes
  red: '#ff0040',
  yellow: '#ffff00',
}
```

### Push Updates

Whenever you make changes:
```bash
git add .
git commit -m "Updated logo and colors"
git push
```

Vercel will automatically redeploy! (takes ~2 minutes)

---

## ✅ SUCCESS CHECKLIST

Make sure you've completed:

- [ ] Node.js installed and working
- [ ] Git installed and working
- [ ] Supabase project created
- [ ] Database tables created
- [ ] Admin user created
- [ ] Environment variables configured
- [ ] Site running locally
- [ ] Code pushed to GitHub
- [ ] Site deployed to Vercel
- [ ] Live site tested and working

---

## 🆘 TROUBLESHOOTING

### "npm: command not found"
**Solution:** Node.js not installed. Go back to Step 1.

### "Missing environment variables"
**Solution:** Check your `.env.local` file exists and has the correct values.

### Supabase errors
**Solution:** 
1. Make sure you ran the SQL script
2. Check your API keys are correct
3. Verify admin user was created

### Vercel deployment fails
**Solution:**
1. Check environment variables in Vercel dashboard
2. Make sure both variables are added
3. Redeploy from Vercel dashboard

### Leaderboard is empty
**Solution:** The SQL script should have added initial players. Try running it again.

---

## 📞 GET HELP

If you're stuck:

1. Check the README.md file
2. Review error messages carefully
3. Make sure all steps were completed
4. Join the GRIMS WhatsApp for support

---

## 🎉 YOU'RE DONE!

Congratulations! Your GRIMS website is now live on the internet!

**Share it:**
- Send the link to your squad
- Post in the WhatsApp group
- Share on social media

**Next Steps:**
- Add more players
- Create tournaments
- Customize the design
- Add your logo
- Share news updates

---

**"We form alliance to manifest our missions"** 💙

Welcome to GRIMS online presence!
