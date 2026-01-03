# 🎨 Adding Your GRIMS Logo

## 📍 Where to Put Your Logo

Your logo should be placed in the **`public`** folder of your project.

---

## 📂 Step-by-Step Instructions

### Step 1: Prepare Your Logo

**Recommended Specifications:**
- **Format**: PNG (with transparent background) or JPG
- **Size**: 500x500px or 1000x1000px (square works best)
- **File Size**: Under 500KB
- **Name**: `logo.png` or `logo.jpg`

**Design Tips:**
- Square or circular logo works best
- High contrast (logo should be visible on dark background)
- Clear and recognizable
- Not too detailed (should look good small)

---

### Step 2: Add Logo to Project

1. **Locate the `public` folder** in your project:
   ```
   grims-website/
   └── public/         ← Put logo here!
       └── logo.png    ← Your logo file
   ```

2. **Name your logo file**: `logo.png` (or `logo.jpg`)

3. **Copy your logo** into the `public` folder

---

### Step 3: Verify Logo Appears

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open** `http://localhost:3000`

3. **Check these locations**:
   - ✅ Top of homepage (large logo in center)
   - ✅ Navbar (small logo in top-left corner)

---

## 🎯 Where Your Logo Appears

### 1. Homepage Hero Section
- **Location**: Center of page, top section
- **Size**: 128x128px (large)
- **Effect**: Glowing pulse animation
- **Style**: Rounded square with shadow

### 2. Navbar
- **Location**: Top-left corner
- **Size**: 48x48px (small)
- **Effect**: Scales up on hover
- **Style**: Rounded square

### 3. Footer
- **Location**: Bottom-left of footer
- **Size**: 40x40px (tiny)
- **Effect**: None
- **Style**: Rounded square

---

## 🔄 Different File Names

If your logo has a different name, update these files:

### Hero.js (line ~18):
```javascript
<Image
  src="/your-logo-name.png"  // Change this
  alt="GRIMS Logo"
  fill
  className="object-cover"
  priority
/>
```

### Navbar.js (line ~24):
```javascript
<Image
  src="/your-logo-name.png"  // Change this
  alt="GRIMS Logo"
  fill
  className="object-cover"
  onError={() => setLogoError(true)}
/>
```

---

## 🎨 Logo Best Practices

### Good Logo Examples:
- ✅ Clear, bold text or symbol
- ✅ High contrast colors
- ✅ Transparent background (PNG)
- ✅ Square aspect ratio
- ✅ Simple, recognizable design

### Avoid:
- ❌ Too much detail (gets lost when small)
- ❌ Low contrast (hard to see)
- ❌ Non-square shapes (gets cropped)
- ❌ Large file sizes (slows loading)

---

## 🖼️ Creating a Logo (If You Don't Have One)

### Free Logo Makers:
1. **Canva** (https://canva.com) - Easy templates
2. **LogoMakr** (https://logomakr.com) - Simple editor
3. **Hatchful** (https://hatchful.shopify.com) - Quick generator

### Design Ideas for GRIMS:
- Military badge/emblem
- Crosshair with "GRIMS" text
- Shield with squad insignia
- Tactical team logo
- Gaming controller themed

---

## 🔧 Troubleshooting

### Logo Not Showing?

**1. Check file name:**
- Must be exactly `logo.png` (lowercase)
- Or update code with your filename

**2. Check file location:**
```
✅ Correct: grims-website/public/logo.png
❌ Wrong: grims-website/logo.png
❌ Wrong: grims-website/public/images/logo.png
```

**3. Clear browser cache:**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

**4. Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Logo Looks Blurry?

**Solution:** Use a higher resolution image
- Current size → Multiply by 2
- 500x500 → Use 1000x1000
- Save as PNG for best quality

### Logo Has Wrong Colors?

**Your logo should work on dark backgrounds**
- If logo is dark, add white/light version
- If logo has white background, remove it (use PNG transparency)
- Test on dark background before using

---

## 🎯 Fallback System

**Don't have a logo yet?** No problem!

The website has a **built-in fallback**:
- Shows gradient square with "GRIMS" text
- Looks professional
- Works until you add your logo
- No errors or broken images

---

## 📱 Logo on Mobile

Your logo automatically adjusts for mobile:
- **Homepage**: Full size, centered
- **Navbar**: Small size, always visible
- **Responsive**: Looks good on all screen sizes

---

## ✨ Quick Checklist

Before adding your logo:
- [ ] Logo is square (or circular)
- [ ] File named `logo.png`
- [ ] File size under 500KB
- [ ] Placed in `public/` folder
- [ ] Looks good on dark background
- [ ] High quality/resolution
- [ ] Transparent background (if PNG)

---

## 🎊 Example Structure

```
grims-website/
├── public/
│   ├── logo.png          ← Your logo here! ✅
│   ├── favicon.ico       ← Optional: Browser tab icon
│   └── og-image.png      ← Optional: Social media preview
├── app/
├── components/
└── ...
```

---

## 💡 Pro Tips

1. **Use PNG with transparency** for best results
2. **Make it square** (1:1 aspect ratio)
3. **High resolution** (at least 500x500px)
4. **Compress** before uploading (use TinyPNG.com)
5. **Test on mobile** after adding

---

**Your logo will make your website even more professional and branded!** 🎨✨

Just drop `logo.png` in the `public` folder and refresh! 🚀
