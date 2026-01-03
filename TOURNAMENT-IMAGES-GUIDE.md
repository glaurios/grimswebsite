# 🖼️ Tournament Images Feature Guide

## ✨ What's New

Your GRIMS website now includes **tournament image support**! You can add custom images/posters to make your tournaments look even more professional and eye-catching.

---

## 📸 How to Add Tournament Images

### Method 1: When Creating New Tournaments (Admin Dashboard)

1. Go to `/admin` and login
2. Click **"Create Tournament"** button
3. Fill in tournament details
4. In the **"Tournament Image URL"** field, paste an image link
5. See live preview below the input
6. Click **"Create Tournament"**

### Method 2: Update Existing Tournaments (Supabase)

1. Go to Supabase dashboard
2. Click **Table Editor** → **tournaments**
3. Click on the tournament row you want to edit
4. Find the `image_url` column
5. Paste your image URL
6. Save changes

---

## 🔗 Where to Get Image URLs

### Option 1: Official CODM Images
Use images directly from Call of Duty website:
```
https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/CODM-S1-2025-TOUT.jpg
```

### Option 2: Free Image Hosting Services
Upload your custom tournament posters to:
- **Imgur** (https://imgur.com/) - Free, no account needed
- **ImgBB** (https://imgbb.com/) - Free image hosting
- **Cloudinary** (https://cloudinary.com/) - Professional option

**Steps:**
1. Upload your image to the hosting service
2. Copy the direct image link (should end in .jpg, .png, .webp)
3. Paste into the Image URL field

### Option 3: Your Own Server
If you have web hosting, upload images there and use the direct URL.

---

## 🎨 Image Recommendations

**Dimensions:**
- Recommended: 1920x1080 (16:9 ratio)
- Minimum: 800x450
- Maximum file size: 5MB for faster loading

**Format:**
- JPG/JPEG (best for photos)
- PNG (best for graphics with transparency)
- WebP (best compression)

**Content:**
- Tournament logo/branding
- Game mode graphics
- CODM characters or weapons
- Squad logos
- Event information overlay

---

## 💡 Example Image URLs

Here are some example CODM tournament-style images you can use:

```
https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/CODM-S1-2025-TOUT.jpg

https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/CODM-MYTHIC-RYTEC-TOUT.jpg

https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/CODM-RANKED-TOUT.jpg
```

---

## 🖥️ How Tournament Images Display

### On Tournament Cards:
- **With Image**: Shows your custom image with hover zoom effect
- **Without Image**: Shows gradient background with gamepad icon

### Features:
- ✅ Automatic responsive sizing
- ✅ Hover zoom animation
- ✅ Dark overlay gradient for text readability
- ✅ Status badge overlay (Live, Upcoming, Completed)
- ✅ Fallback to gradient if image fails to load

---

## 🛠️ Troubleshooting

### Image Not Showing?

**Check these common issues:**

1. **Invalid URL Format**
   - ❌ `example.com/image.jpg` (missing https://)
   - ✅ `https://example.com/image.jpg`

2. **Not a Direct Image Link**
   - ❌ `https://imgur.com/gallery/abc123` (gallery page)
   - ✅ `https://i.imgur.com/abc123.jpg` (direct image)

3. **Image Host Blocks Embedding**
   - Some sites don't allow images to be displayed on other websites
   - Solution: Use Imgur, ImgBB, or re-upload

4. **Large File Size**
   - Images over 5MB may load slowly
   - Solution: Compress image before uploading

### How to Get Direct Image Links

**Imgur:**
1. Upload image
2. Right-click image → "Copy image address"
3. URL should look like: `https://i.imgur.com/ABC123.jpg`

**ImgBB:**
1. Upload image
2. Copy the "Direct link" (not the viewer link)
3. URL should end with .jpg, .png, etc.

---

## 📋 Quick Reference

### Admin Dashboard - Create Tournament:
```
Name: [Tournament Name]
Mode: [Game Mode]
Date: [Start Date/Time]
Image URL: https://example.com/image.jpg  ← Paste here
Status: [Upcoming/Live/Completed]
```

### SQL - Add Image to Existing Tournament:
```sql
UPDATE tournaments 
SET image_url = 'https://example.com/your-image.jpg'
WHERE name = 'Your Tournament Name';
```

---

## 🎯 Pro Tips

1. **Brand Consistency**: Use similar style images for all tournaments
2. **Event-Specific**: Create unique images for special events
3. **Mobile-Friendly**: Make sure text in images is readable on small screens
4. **File Names**: Use descriptive names like `winter-championship-2025.jpg`
5. **Backup Images**: Keep copies of your tournament images
6. **Test Preview**: Always check the preview in admin panel before saving

---

## ✨ Example Tournament Setup

```
Tournament Name: GRIMS Winter Championship 2025
Game Mode: Battle Royale - Squad
Start Time: 2025-01-15 19:00
Image URL: https://i.imgur.com/tournament-winter.jpg
Status: Upcoming
```

**Result**: Beautiful tournament card with your custom winter-themed poster! ❄️🎮

---

## 🆘 Need Help?

- Check if your image URL works by pasting it directly in a browser
- Try a different image hosting service
- Use the default gradient (leave Image URL blank) if needed
- Contact support via WhatsApp group

---

**Happy Tournament Creating!** 🎮✨

*Remember: Images are optional. Tournaments look great with or without them!*
