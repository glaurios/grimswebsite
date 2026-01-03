# GRIMS - Global Recon Invincible Mission Squad
## Call of Duty Mobile Community Website

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

A modern, futuristic gaming community website featuring leaderboards, tournaments, news feed, and admin dashboard for Call of Duty Mobile.

---

## 🎮 Features

- **Hero Landing Page** with animated elements and call-to-action
- **CODM News Feed** with latest updates from Call of Duty Mobile
- **Live Leaderboard** with automatic ranking system
- **Tournament Management** with status tracking (Live, Upcoming, Completed)
- **Direct Image Upload** - Upload tournament images from your laptop (no external services!)
- **Image URL Support** - Or paste image URLs from Imgur, CODM website, etc.
- **Admin Dashboard** for creating tournaments and entering results
- **Automatic Player Management** - New players auto-created from tournament results
- **Contact Form** with WhatsApp integration
- **Fully Responsive** design for mobile, tablet, and desktop
- **Dark Theme** with neon blue/red/yellow accents
- **Smooth Animations** and hover effects

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)
- **Supabase Account** (Free tier works perfectly)
- **Vercel Account** (Optional, for deployment)

---

## 🚀 Quick Start Guide

### Step 1: Extract the Project

1. Extract the `grims-website` folder to your desired location
2. Open terminal/command prompt
3. Navigate to the project folder:
```bash
cd path/to/grims-website
```

### Step 2: Install Dependencies

Run this command in the project folder:
```bash
npm install
```

This will install all required packages (Next.js, Tailwind CSS, Supabase, etc.)

⏱️ **This takes 2-3 minutes**

### Step 3: Set Up Supabase

#### A. Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `grims-codm`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to Ghana (e.g., Europe West)
4. Click "Create new project"
5. ⏱️ **Wait 2-3 minutes** for setup

#### B. Get Your API Keys

1. Once ready, go to **Project Settings** (⚙️ icon)
2. Click **API** in the left sidebar
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

#### C. Set Up Database

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the `supabase-setup.sql` file from the project
4. Copy ALL the SQL code
5. Paste it into the query editor
6. Click **RUN** (or press F5)
7. ✅ You should see "Tables created successfully!"

#### D. Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email**: `admin@grims.com`
   - **Password**: `grimsadmin123`
4. Click **Create user**

#### E. Setup Storage for Direct Image Uploads (5 minutes) 🆕

**This allows you to upload tournament images straight from your laptop!**

1. Click **Storage** in the Supabase sidebar
2. Click **"New Bucket"**
3. Configure:
   - **Name**: `tournament-images`
   - **Public bucket**: Toggle **ON** ✅
4. Click **"Create bucket"**
5. Click on the **tournament-images** bucket → **Policies** tab
6. Click **"New Policy"** → **"Get started quickly"**
7. Select **"Allow public access (read)"** → **"Use this template"** → **"Save"**
8. Click **"New Policy"** again → **"For full customization"**
9. Set:
   - **Name**: `Authenticated can upload`
   - **Policy**: `INSERT`
   - **Roles**: `authenticated`
   - **SQL**: `(bucket_id = 'tournament-images'::text)`
10. **"Review"** → **"Save policy"**

✅ Done! See `STORAGE-SETUP.md` for detailed troubleshooting.

### Step 4: Configure Environment Variables

1. In the project folder, find `.env.local.example`
2. Rename it to `.env.local` (remove `.example`)
3. Open `.env.local` and replace with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**IMPORTANT:** Replace with YOUR actual Supabase URL and key!

### Step 5: Run the Development Server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

🎉 **Your website is now running locally!**

---

## 🎨 Project Structure

```
grims-website/
├── app/
│   ├── page.js                 # Home page
│   ├── leaderboard/page.js     # Leaderboard page
│   ├── tournaments/page.js     # Tournaments page
│   ├── about/page.js           # About page
│   ├── contact/page.js         # Contact page
│   ├── admin/page.js           # Admin dashboard
│   ├── layout.js               # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── Navbar.js               # Navigation bar
│   ├── Footer.js               # Footer
│   ├── Hero.js                 # Hero section
│   ├── NewsFeed.js             # CODM news feed
│   ├── MiniLeaderboard.js      # Top 3 preview
│   └── TournamentPreview.js    # Upcoming tournaments
├── lib/
│   └── supabase.js             # Supabase client
├── public/                     # Static assets (add logo here)
├── .env.local                  # Environment variables
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── next.config.js              # Next.js configuration
```

---

## 🛠️ Admin Dashboard Usage

### Accessing Admin Panel

1. Go to `http://localhost:3000/admin` (or `/admin` on live site)
2. Login with:
   - **Email**: `admin@grims.com`
   - **Password**: `grimsadmin123`

### Creating New Tournaments

1. Click "Create Tournament" button
2. Fill in tournament details:
   - **Name**: Tournament title
   - **Game Mode**: e.g., Battle Royale, Team Deathmatch, Capture the Briefcase
   - **Start Date/Time**: When the tournament begins
   - **Status**: Upcoming, Live, or Completed
3. **Add Tournament Image** (two options):
   - **Option A - Upload from Laptop**: Click upload area → Select image → See preview → Done! 
   - **Option B - Use URL**: Paste image link from Imgur, CODM website, etc.
4. Click "Create Tournament"

**Image Upload Features:**
- ✅ Drag & drop support
- ✅ Live preview before saving
- ✅ Auto-upload to Supabase Storage
- ✅ Supports JPG, PNG, WebP
- ✅ Max size: 5MB
- ✅ Remove/replace easily

**Finding Tournament Images:**
- Use CODM official images from callofduty.com
- Upload to free image hosts like Imgur, Imgbb
- Use game screenshots or custom posters
- Leave blank for default gradient background

### Entering Tournament Results

1. Click "Select Tournament" dropdown
2. Choose the tournament
3. Add player results:
   - Enter player name (use existing names or create new)
   - Enter points earned
   - Click "+ Add Player" for more entries
4. Click "Submit Results & Update Leaderboard"

**What Happens:**
- Tournament results are saved
- Player points are automatically updated (added to existing totals)
- Leaderboard ranks are recalculated
- Tournament status changes to "Completed"
- New players are automatically created if they don't exist

---

## 👥 Managing Players

### Three Ways to Add/Update Players:

**Method 1: Through Tournament Results (Recommended)**
- Enter tournament results in admin panel
- New players are auto-created
- Existing players get points added
- Rankings update automatically

**Method 2: Directly in Supabase**
1. Go to Supabase → Table Editor → `players`
2. Click "Insert row"
3. Add player_name and total_points
4. Save

**Method 3: Bulk Add via SQL**
```sql
INSERT INTO players (player_name, total_points, rank) VALUES
  ('New Player', 500, 0);
```

---

## 🎯 Adding Your Logo

1. Save your logo as `logo.png` or `logo.svg`
2. Place it in the `public/` folder
3. Update the logo placeholder in:
   - `components/Hero.js` (line ~18-26)
   - `components/Navbar.js` (line ~18-22)
   - `components/Footer.js` (line ~9-13)

Example:
```jsx
<Image src="/logo.png" alt="GRIMS Logo" width={48} height={48} />
```

---

## 🌐 Deployment to Vercel

### Prepare for Deployment

1. Create a GitHub repository
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit - GRIMS website"
git branch -M main
git remote add origin https://github.com/yourusername/grims-website.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - Click "Environment Variables"
   - Add your two variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase key
6. Click "Deploy"

⏱️ **Deployment takes 2-3 minutes**

🎉 **Your site is now LIVE!**

Vercel will give you a URL like: `https://grims-website.vercel.app`

---

## 🔧 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` exists and has the correct values

### Issue: Admin login not working
**Solution:** Verify you created the admin user in Supabase Authentication

### Issue: Tables not found
**Solution:** Run the `supabase-setup.sql` script again in Supabase SQL Editor

### Issue: News feed shows placeholder
**Solution:** This is normal. The news feed uses mock data since CODM API requires authentication

### Issue: Styles not loading
**Solution:** Clear cache and restart dev server:
```bash
rm -rf .next
npm run dev
```

---

## 📱 Testing on Mobile

While dev server is running:

1. Find your computer's IP address:
   - Windows: `ipconfig` in Command Prompt
   - Mac/Linux: `ifconfig` in Terminal
2. On your phone, connect to same WiFi
3. Open: `http://YOUR_IP:3000`

Example: `http://192.168.1.100:3000`

---

## 🎮 Features Roadmap

Future enhancements you can add:

- [ ] Player profiles with stats
- [ ] Match history tracking
- [ ] Live tournament brackets
- [ ] Image uploads for tournaments
- [ ] Real-time chat integration
- [ ] Mobile app version
- [ ] Discord bot integration
- [ ] Automated tournament scheduling

---

## 🤝 Contributing

Want to improve the site? Here's how:

1. Make your changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel will auto-deploy!

---

## 📞 Support

Need help? Contact:

- **WhatsApp**: [Join GRIMS Community](https://chat.whatsapp.com/HGVFehBnrfH7KFPikHKPcH)
- **Admin Email**: admin@grims.com

---

## 📄 License

This project is built for GRIMS community. Feel free to modify and use as needed.

---

## 🏆 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

**"We form alliance to manifest our missions"** - GRIMS

---

## 🚨 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

---

**Made with 💙 for the GRIMS CODM Community**
