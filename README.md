# ✦ TeamUp — College Teammate Finder

A full-stack platform for students to find teammates for hackathons, projects, research, and more.

**Tech Stack:** React + Vite, Supabase (Auth + PostgreSQL + RLS), Tailwind CSS, Framer Motion

---

## 🚀 Setup Guide

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to finish provisioning (~2 min)

---

### Step 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Paste the entire contents and click **Run**
4. You should see "Success" — all tables, RLS policies, triggers, and views are created

---

### Step 3 — Configure Google OAuth

#### In Supabase:
1. Go to **Authentication → Providers → Google**
2. Enable it
3. You'll need a **Client ID** and **Client Secret** from Google Cloud

#### In Google Cloud Console:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URIs:**
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   (Find your project ref in Supabase → Settings → General)
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase → Authentication → Google provider

#### To allow college Gmail accounts:
- Google OAuth already works with any Gmail including `@college.edu` accounts
- No extra config needed — all Google accounts work by default
- If you want to restrict to specific domains, go to Supabase → Authentication → Email → and add domain restrictions (optional)

#### Set your site URL in Supabase:
- Go to **Authentication → URL Configuration**
- Set **Site URL** to: `http://localhost:5173` (for dev) or your production URL
- Add to **Redirect URLs**: `http://localhost:5173/auth/callback`

---

### Step 4 — Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values from Supabase → **Project Settings → API**:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Step 5 — Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

### Step 6 — Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, or any static host.

#### For Vercel deployment:
1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update your Supabase Site URL and Redirect URLs to your production domain

---

## 📁 Project Structure

```
teamup/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.jsx       # Google sign-in modal
│   │   │   └── ProtectedRoute.jsx  # Auth guard
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # Page wrapper
│   │   │   └── Navbar.jsx          # Top navigation
│   │   ├── posts/
│   │   │   ├── PostCard.jsx        # Feed post card
│   │   │   ├── Filters.jsx         # Sidebar filters
│   │   │   ├── Comment.jsx         # Nested comment component
│   │   │   └── ApplyModal.jsx      # Application form modal
│   │   └── ui/
│   │       └── Ticker.jsx          # Bottom scrolling ticker
│   ├── hooks/
│   │   └── useAuth.jsx             # Auth context + hook
│   ├── lib/
│   │   ├── supabase.js             # Supabase client
│   │   └── constants.js            # Categories, helpers
│   ├── pages/
│   │   ├── HomePage.jsx            # Feed + search + filters
│   │   ├── PostDetailPage.jsx      # Full post + comments + apply
│   │   ├── CreatePostPage.jsx      # Create new post form
│   │   ├── ProfilePage.jsx         # Public user profile
│   │   ├── EditProfilePage.jsx     # Edit profile + hackathons
│   │   ├── MyPostsPage.jsx         # My posts + applicant management
│   │   ├── MyApplicationsPage.jsx  # My applications tracker
│   │   ├── AuthCallbackPage.jsx    # OAuth redirect handler
│   │   └── NotFoundPage.jsx        # 404
│   ├── styles/
│   │   └── globals.css             # Tailwind + global styles
│   ├── App.jsx                     # Router setup
│   └── main.jsx                    # Entry point
├── supabase/
│   └── schema.sql                  # Full DB schema + RLS policies
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔒 Privacy Model

| Data | Public | Logged In | Post Owner |
|------|--------|-----------|------------|
| Username | ✅ | ✅ | ✅ |
| Full Name | ✅ | ✅ | ✅ |
| College | ✅ | ✅ | ✅ |
| Skills/Bio | ✅ | ✅ | ✅ |
| Location | ❌ | ❌ | ✅ (via applicant profile) |
| Email | ❌ | ❌ | ✅ (via applicant profile) |
| LinkedIn | ❌ | ❌ | ✅ (shown in applicant panel) |
| Applications | ❌ | Own only | All applicants to their posts |

---

## ✨ Features

- **Browse without login** — anyone can view posts and profiles
- **Google OAuth** — sign in with any Google/college Gmail
- **Post listings** — hackathons, team projects, research, startups, design challenges, case competitions
- **Search & filters** — by category, mode, college, date range
- **Reddit-style comments** — nested replies, upvotes, collapse
- **Apply system** — apply with name, skills, message; one application per post
- **Applicant management** — accept/decline applicants, see their full details
- **User profiles** — skills, bio, links, hackathon history
- **Bookmarks** — save posts for later
- **Auto-close** — posts auto-close after event date

---

## 🎨 Design

Black + electric blue theme inspired by underground culture aesthetics.
Fonts: Space Mono (display/mono) + DM Sans (body)
