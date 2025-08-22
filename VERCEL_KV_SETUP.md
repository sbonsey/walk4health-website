# Vercel KV Setup Guide (Updated for Marketplace)

## 🚨 **CRITICAL ISSUE FIXED: Environment Variable Naming**

The main problem was that your API endpoints were looking for the wrong environment variable names. I've updated the code to support both naming conventions.

### **What Was Wrong:**
- ❌ API was looking for `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- ❌ Vercel KV actually provides `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- ❌ This caused all API calls to fail, falling back to localStorage

### **What I Fixed:**
- ✅ Updated API endpoints to check for both naming conventions
- ✅ Added better error logging and debugging
- ✅ Modified frontend to prioritize API over localStorage in production
- ✅ Created proper `vercel.json` configuration

## 🚀 **Setting Up Upstash Redis for Walk4Health**

### **What We've Implemented:**
- ✅ **Upstash Redis Integration**: Replaced file system with Redis database
- ✅ **API Endpoints**: Updated to use Redis instead of files
- ✅ **Data Service**: Modified to work with Redis API
- ✅ **Configuration**: Added vercel.json with Redis environment variables
- ✅ **Environment Variable Fallbacks**: Support for both naming conventions

### **What You Need to Do Next:**

#### **Step 1: Create Upstash Redis Database (Marketplace)**
1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Select your Walk4Health project**
3. **Go to "Storage" tab**
4. **Click "Create Database"**
5. **Select "Marketplace Database Providers"**
6. **Choose "Upstash"** (Serverless DB with Redis)
7. **Click "Create"**
8. **Follow Upstash setup** (create account if needed)
9. **Choose a plan** (Free tier: 10,000 requests/month, 256MB storage)

#### **Step 2: Get Environment Variables**
After creating the Upstash Redis database, Vercel will show you these values:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

#### **Step 3: Add Environment Variables to Vercel**
1. **In your Vercel project dashboard**
2. **Go to "Settings" → "Environment Variables"**
3. **Add each variable** with the values from Step 2:
   - Name: `UPSTASH_REDIS_REST_URL`, Value: `https://your-db.upstash.io`
   - Name: `UPSTASH_REDIS_REST_TOKEN`, Value: `your-token-here`
4. **Make sure to select all environments** (Production, Preview, Development)
5. **Click "Save"**

#### **Step 4: Redeploy**
1. **Go to "Deployments" tab**
2. **Click "Redeploy"** on your latest deployment
3. **Wait for deployment to complete**

## 🎯 **What This Gives You:**

### **✅ Real Persistence:**
- Events saved to Upstash Redis database
- Content saved to Upstash Redis database
- Data survives all deployments
- No more read-only file system errors

### **✅ Free Tier Benefits:**
- 10,000 requests/month (plenty for events and content)
- 256MB storage (more than enough)
- Global edge network
- Automatic scaling
- No database management needed

### **✅ Same Admin Interface:**
- No changes to your admin panel
- Same functionality, better storage
- Works both locally and on Vercel

## 🔧 **How It Works Now:**

1. **Admin adds event** → API endpoint receives data
2. **API saves to Upstash Redis** → Database stores the data
3. **Website reads from Redis** → Shows updated content
4. **Data persists** → Survives all deployments and refreshes

## 🚨 **Important Notes:**

- **Local Development**: Still works with localStorage fallback
- **Vercel Production**: Uses Upstash Redis database for real persistence
- **Environment Variables**: Must be set in Vercel dashboard
- **Redeploy Required**: After setting environment variables
- **Marketplace Service**: Upstash Redis is a third-party service (very reliable)

## 🧪 **Testing Your Setup:**

After deployment, you can test if everything is working:

1. **Visit your deployed site**
2. **Go to Admin Panel**
3. **Try to add/edit an event**
4. **Check browser console for logs**
5. **Visit `/api/test` endpoint to see environment variable status**

## 🎉 **After Setup:**

Once Upstash Redis is configured:
- ✅ **Events will persist** across deployments
- ✅ **Content will persist** across deployments
- ✅ **No more 500 errors** in Vercel logs
- ✅ **Full admin functionality** working on Vercel
- ✅ **No more localStorage fallback** in production

## 💡 **Need Help?**

If you encounter issues:
1. **Check Vercel logs** for Redis connection errors
2. **Verify environment variables** are set correctly
3. **Ensure Upstash Redis database** is created and active
4. **Redeploy** after any configuration changes
5. **Test the `/api/test` endpoint** to see what environment variables are available

**This setup will give you a production-ready, persistent admin system that works perfectly on Vercel using Upstash Redis!** 🚀

## 🔍 **Debugging Tips:**

- The `/api/test` endpoint now shows all available environment variables
- Check browser console for detailed logging about API calls
- In production, the app will fail fast if Redis isn't configured (no silent localStorage fallback)
