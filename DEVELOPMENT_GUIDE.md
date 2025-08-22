# Walk4Health Development Guide

## 🚨 **Why Files Aren't Updating in Development**

### **The Problem:**
When running the website locally (`npm run dev`), the API endpoints in the `/api` folder don't run, so file updates don't happen automatically.

### **What Happens:**
- ✅ **Events are saved** to localStorage (survives page refresh)
- ❌ **Files are NOT updated** in `/public/data/` folder
- ✅ **On Vercel production** - files update automatically via API

## 🔧 **Development Workflow**

### **Option 1: Manual File Updates (Recommended for Development)**
1. **Add/Edit events** in admin panel
2. **Check browser console** for the new data
3. **Manually update** the JSON files with the new data
4. **Refresh page** to see changes

### **Option 2: Use Production API (Advanced)**
1. **Deploy to Vercel** (even just for testing)
2. **Use the live API** endpoints
3. **Files update automatically**

## 📝 **How to Manually Update Files**

### **When You Add/Edit Events:**
1. **Open browser console** (F12 → Console)
2. **Look for messages** like:
   ```
   📝 Development Mode: To update events.json, manually update the file:
   📁 File path: public/data/events.json
   📊 New data: { recurringEvents: [...], specialEvents: [...] }
   ```
3. **Copy the new data** from console
4. **Update** `public/data/events.json` with the new data
5. **Refresh the page** to see changes

### **When You Edit Club Content:**
1. **Same process** but for `public/data/content.json`
2. **Look for content updates** in console
3. **Update the content file** manually

## 🎯 **Current Status**

### **✅ Working in Development:**
- Admin panel functionality
- Event management (add/edit/delete)
- Content editing
- Data persistence in localStorage
- Console logging of changes

### **❌ Not Working in Development:**
- Automatic file updates
- API endpoint functionality

### **✅ Working in Production (Vercel):**
- Everything works automatically
- Files update via API endpoints
- Full persistence and functionality

## 🚀 **Quick Test - Verify Events Are Working**

1. **Login as admin** (gray lock icon → `admin` / `walk4health2025`)
2. **Add a new event** (recurring or special)
3. **Check browser console** - you should see the new event data
4. **Refresh the page** - the event should still be there (localStorage)
5. **Check the console** for file update instructions

## 💡 **Development vs Production**

### **Development (Local):**
- Uses localStorage for immediate testing
- Shows console messages for manual file updates
- Perfect for testing functionality
- Requires manual file updates for persistence

### **Production (Vercel):**
- Uses API endpoints for automatic file updates
- Full persistence and functionality
- No manual intervention needed
- Perfect for end users

## 🔄 **Recommended Workflow**

1. **Develop locally** - test all functionality
2. **Use console logs** to see what data should be saved
3. **Manually update files** when you want to persist changes
4. **Deploy to Vercel** for full automatic functionality
5. **Test production** to ensure everything works

## 🎉 **Benefits of This Approach**

- ✅ **Fast development** - no API setup needed locally
- ✅ **Full functionality** - test everything locally
- ✅ **Clear feedback** - console shows exactly what to update
- ✅ **Production ready** - works perfectly on Vercel
- ✅ **No database costs** - file-based storage

This development approach gives you the best of both worlds: fast local development with full production functionality! 🚀
