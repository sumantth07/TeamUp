# ✦ TeamUp — College Teammate Finder

A full-stack platform for students to find teammates for hackathons, projects, research, and more.

**Tech Stack:** React + Vite, Supabase (Auth + PostgreSQL + RLS), Tailwind CSS, Framer Motion

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

