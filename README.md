# Walk for Health Website

A Vue.js website for the Walk for Health walking club.

<!-- Last updated: 2025-01-22 - Redis integration complete -->

## Features

- **Single Page Application** - Smooth scrolling between sections
- **Responsive Design** - Mobile-first approach with modern UI
- **Admin Panel** - Content management for events, photos, and club information
- **Contact Forms** - Easy communication with club members
- **Photo Gallery** - Showcase walking trails and club activities
- **Event Management** - Display upcoming walks and activities

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **Styling**: UnoCSS for utility-first CSS
- **Build Tool**: Vite for fast development
- **Hosting**: Designed for Vercel deployment (free tier)
- **Database**: Vercel KV or Supabase (free tier)
- **File Storage**: Vercel Blob Storage or Cloudinary (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd walk4health-website
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Vue components
│   └── AdminPanel.vue  # Admin dashboard component
├── assets/             # Static assets
├── App.vue            # Main application component
└── main.ts            # Application entry point
```

## Admin Features

The admin panel (accessible via the gear icon in the top-right corner) provides:

- **Event Management**: Add, edit, and delete walking events
- **Photo Management**: Upload and organize photo galleries
- **Content Management**: Update club descriptions and walking schedules

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Environment Variables

Set these in your Vercel dashboard:
- `ADMIN_EMAIL`: Admin login email
- `ADMIN_PASSWORD`: Admin login password
- `CLUB_EMAIL`: Club contact email for form submissions

## Customization

### Colors
The primary color scheme is based on the club's orange safety shirts. Update colors in `uno.config.ts`:

```typescript
colors: {
  primary: {
    500: '#f97316', // Main orange color
    // ... other shades
  }
}
```

### Content
Update club information, committee details, and walking schedules in `App.vue`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for the Walk for Health walking club. All rights reserved.

## Support

For technical support or questions about the website, contact the development team.

---

**Walk for Health** - 24 Years of Walking in the Hutt Valley
