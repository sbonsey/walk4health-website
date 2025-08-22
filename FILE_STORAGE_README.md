# Walk4Health File-Based Storage System

## 🎯 Overview

This system provides persistent data storage for the Walk4Health website using JSON files and Vercel's free tier hosting. All admin changes are automatically saved to files and persist between deployments.

## 📁 File Structure

```
walk4health-website/
├── public/
│   └── data/                    # Data files (publicly accessible)
│       ├── events.json          # All events (recurring + special)
│       ├── content.json         # Club description & walking schedule
│       └── galleries/           # Photo galleries
│           ├── gallery-1/
│           │   ├── image1.jpg
│           │   ├── image2.jpg
│           │   └── meta.json    # Gallery metadata
│           └── gallery-2/
│               ├── image1.jpg
│               └── meta.json
├── api/                         # Vercel API endpoints
│   ├── events.js               # Handle events data
│   └── content.js              # Handle club content
└── src/
    └── services/
        └── dataService.ts      # Data management service
```

## 🔧 How It Works

### 1. **Data Storage**
- **Events**: Stored in `public/data/events.json`
- **Content**: Stored in `public/data/content.json`
- **Galleries**: Each gallery gets its own folder with images and metadata

### 2. **API Endpoints**
- **GET** `/api/events` - Retrieve all events
- **POST** `/api/events` - Save events data
- **GET** `/api/content` - Retrieve club content
- **POST** `/api/content` - Save club content

### 3. **Fallback System**
- Primary: API endpoints write to JSON files
- Fallback: localStorage for offline/development use
- Automatic sync when API is available

## 🚀 Deployment on Vercel

### **Free Tier Benefits**
- ✅ **No database costs** - Everything is file-based
- ✅ **Automatic deployments** - Git push triggers deployment
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Version control** - All changes tracked in Git

### **Deployment Steps**
1. **Push to GitHub**: All changes are automatically tracked
2. **Vercel deploys**: API endpoints become available
3. **Data persists**: JSON files are updated and served
4. **Admin changes**: Immediately visible on live site

## 📊 Data Management

### **Events System**
- **Recurring Events**: Sunday walks, Tuesday walks, etc.
- **Special Events**: Christmas walks, special occasions
- **Auto-save**: Changes saved immediately
- **Validation**: Data format checked before saving

### **Content Management**
- **Club Description**: Editable club information
- **Walking Schedule**: Summer/winter times
- **Last Updated**: Automatic timestamp tracking

### **Gallery System**
- **Folder Creation**: New gallery = new folder
- **Image Storage**: Photos stored in gallery folders
- **Metadata**: JSON files track gallery information
- **Easy Management**: Add/remove galleries via admin panel

## 🔐 Admin Access

### **Login Credentials**
- **Username**: `admin`
- **Password**: `walk4health2025`

### **Admin Features**
- ✅ Add/edit/delete events
- ✅ Modify club content
- ✅ Create photo galleries
- ✅ Upload images
- ✅ Real-time updates

## 💾 Data Persistence

### **What Persists**
- ✅ **All events** (recurring + special)
- ✅ **Club content** (description + schedule)
- ✅ **Gallery metadata** (titles, descriptions, dates)
- ✅ **Image references** (file paths and organization)

### **What Happens on Deploy**
1. **New deployment** starts
2. **API endpoints** become available
3. **Data files** are served from `/data/` directory
4. **Admin changes** immediately visible
5. **No data loss** - everything preserved

## 🛠️ Development vs Production

### **Development (Local)**
- Uses localStorage for immediate testing
- API endpoints simulate file operations
- Fast iteration and testing

### **Production (Vercel)**
- Real file-based storage
- API endpoints write to actual files
- Data persists across deployments
- Global CDN serving

## 🔄 Migration Path

### **Current State**
- File-based storage with Vercel APIs
- localStorage fallback for reliability
- JSON files for data structure

### **Future Enhancements**
- **Database**: Can easily migrate to Supabase/Firebase
- **File Uploads**: Add image upload to cloud storage
- **Real-time**: WebSocket updates for live collaboration
- **Backup**: Automated backup to external storage

## 📝 Usage Examples

### **Adding a New Event**
1. Login to admin panel
2. Click "Add Recurring" or "Add Special"
3. Fill in event details
4. Click "Save Event"
5. Event immediately appears on website
6. Data saved to `events.json`

### **Creating a Gallery**
1. Go to Photos tab in admin
2. Click "Add Gallery"
3. Enter title, description, date
4. Upload images to gallery folder
5. Gallery appears on website
6. Metadata saved to `meta.json`

## 🎉 Benefits

- **Cost-effective**: Free Vercel hosting
- **Reliable**: File-based persistence
- **Scalable**: Easy to upgrade later
- **Maintainable**: Simple file structure
- **Version controlled**: All changes tracked in Git
- **Fast**: Static file serving with CDN

This system gives you a professional, scalable solution that works perfectly with Vercel's free tier while maintaining all the functionality of a traditional database-driven website!
