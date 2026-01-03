# 📦 Supabase Storage Setup Guide

## 🎯 Purpose

This guide shows you how to set up Supabase Storage so you can **upload tournament images directly from your laptop** without using external services like Imgur.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Storage Bucket

1. **Go to your Supabase project dashboard**
2. Click **"Storage"** in the left sidebar (icon looks like a folder)
3. Click **"Create a new bucket"** or **"New Bucket"** button
4. Fill in the details:
   ```
   Name: tournament-images
   Public bucket: YES (toggle ON) ✅
   File size limit: 5MB (optional)
   Allowed MIME types: image/* (optional)
   ```
5. Click **"Create bucket"**

### Step 2: Set Up Public Access Policy

1. Click on your newly created **"tournament-images"** bucket
2. Click the **"Policies"** tab at the top
3. You'll see "No policies created yet"
4. Click **"New Policy"** button
5. Choose **"Get started quickly"** option
6. Select **"Allow public access (read)"** template
7. Click **"Use this template"**
8. Review and click **"Save policy"**

**Alternative (Full Customization):**
If you prefer full control:
1. Click **"New Policy"** → **"For full customization"**
2. Fill in:
   ```
   Policy name: Public Tournament Images
   Policy definition: SELECT
   Target roles: public, authenticated
   ```
3. In the SQL editor, paste:
   ```sql
   (bucket_id = 'tournament-images'::text)
   ```
4. Click **"Review"** → **"Save policy"**

### Step 3: Add Upload Policy (Admin Only)

1. Still in the **Policies** tab
2. Click **"New Policy"** again
3. Choose **"For full customization"**
4. Fill in:
   ```
   Policy name: Authenticated users can upload
   Policy definition: INSERT
   Target roles: authenticated
   ```
5. SQL policy:
   ```sql
   (bucket_id = 'tournament-images'::text)
   ```
6. Click **"Review"** → **"Save policy"**

### Step 4: Add Update/Delete Policies (Optional)

Repeat the process for UPDATE and DELETE operations if you want admins to be able to replace or remove images.

---

## ✅ Verify Setup

### Check Your Policies

You should have at least these policies:
- ✅ **SELECT (public)** - Anyone can view images
- ✅ **INSERT (authenticated)** - Admins can upload
- ✅ **UPDATE (authenticated)** - Optional: Admins can replace
- ✅ **DELETE (authenticated)** - Optional: Admins can delete

### Test Upload

1. Go to your website: `/admin`
2. Click **"Create Tournament"**
3. Click the upload area
4. Select an image from your laptop
5. You should see a preview
6. Submit the tournament
7. Check if the image appears on the tournament card

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"

**Solution:** Your INSERT policy is missing or incorrect.

1. Go to Storage → tournament-images → Policies
2. Make sure you have an INSERT policy for authenticated users
3. SQL should be: `(bucket_id = 'tournament-images'::text)`

### Error: "Failed to upload image"

**Possible causes:**
1. **Bucket doesn't exist** - Create it following Step 1
2. **Wrong bucket name** - Must be exactly "tournament-images"
3. **Not logged in** - Make sure you're logged into admin panel
4. **File too large** - Keep images under 5MB

### Images Upload But Don't Display

**Solution:** Your SELECT policy is missing or bucket isn't public.

1. Make sure bucket is set to **Public**
2. Check SELECT policy exists for "public" role
3. Try accessing image URL directly in browser

### Can't Access Storage in Sidebar

**Solution:** Storage is only available on paid Supabase plans in some regions.

**Workaround:** Continue using the URL method with Imgur/ImgBB (still works great!)

---

## 📊 Storage Limits (Free Tier)

- **Storage space**: 1 GB
- **Bandwidth**: 2 GB per month
- **File uploads**: Unlimited number

**How many tournament images can you store?**
- Average image: 200-500 KB
- 1 GB = ~2,000-5,000 images
- More than enough for tournaments! ✅

---

## 🎨 Best Practices

### Image Optimization

Before uploading, optimize images:
1. **Resize**: 1920x1080 or 1280x720 (perfect for web)
2. **Compress**: Use tools like TinyPNG or Squoosh
3. **Format**: JPG for photos, PNG for graphics, WebP for best compression

### Naming Convention

The system auto-generates unique filenames like:
```
1704315789-abc123.jpg
```
This prevents naming conflicts.

### Organize Later

You can create folders in the bucket:
```
tournament-images/
├── 2025/
│   ├── january/
│   └── february/
└── 2026/
```

To use folders, update the upload path in admin code.

---

## 🔐 Security Notes

### Why Public Bucket?

Tournament images need to be visible to all website visitors, so the bucket must be public. This is safe because:
- Only tournament images are stored here
- No sensitive data
- Only admins can upload (authenticated users)
- Anyone can view (like a CDN)

### Admin Only Uploads

Only users who are:
1. Logged into admin panel
2. Authenticated with Supabase
3. Have valid credentials

...can upload images. Regular visitors cannot.

---

## 🆘 Still Having Issues?

### Option 1: Use URL Method

If Storage setup is too complex, you can still use the URL input method:
1. Upload to Imgur/ImgBB
2. Paste URL in tournament form
3. Works exactly the same!

### Option 2: Contact Support

- Check Supabase documentation: https://supabase.com/docs/guides/storage
- Join Supabase Discord for help
- Post in GRIMS WhatsApp group

---

## 🎯 Quick Reference Commands

### Check if Bucket Exists (SQL Editor)
```sql
SELECT * FROM storage.buckets WHERE name = 'tournament-images';
```

### Check Policies (SQL Editor)
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'tournament-images';
```

### Manual Image Upload (Supabase Dashboard)
1. Storage → tournament-images
2. Click "Upload file"
3. Select image
4. Copy public URL

---

## ✨ You're Done!

Once setup is complete:
- ✅ Upload images directly from laptop
- ✅ No external services needed
- ✅ Images hosted on Supabase
- ✅ Fast and reliable
- ✅ Professional workflow

**Enjoy your new upload feature!** 🚀📸
