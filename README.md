# 🏡 HabiWise
### "Find Smart. Live Better."

HabiWise is a modern housing and roommate-matching platform built with React, Vite, and Firebase. It helps students and young professionals discover properties, compare shared living options, connect with compatible roommates, and manage requests in real time.

## 📌 Problem Statement
Finding the right place to live is still fragmented and time-consuming. People often need to search across multiple platforms, manually compare rooms, verify compatibility with roommates, and coordinate visits or requests without a single streamlined experience.

## 💡 Solution
HabiWise brings property discovery, roommate matching, connection requests, and booking flows into one responsive web app. It supports real-time interaction, demo-mode local storage fallback, and a polished dashboard experience for both seekers and property owners.

## ✨ Features
- Property listings with rich detail views
- Roommate matching and compatibility scoring
- Connection request flow with pending, matched, and passed states
- Owner and seeker dashboards with role-based views
- Booking and visit scheduling flow
- Firebase integration with demo-friendly localStorage fallback
- Responsive UI designed for smooth browsing on desktop and mobile

## 🛠️ Tech Stack
- Frontend: React 19, Vite
- Routing: React Router DOM
- Backend / BaaS: Firebase Firestore and Authentication
- Styling: Tailwind CSS, PostCSS, Autoprefixer
- Deployment: Vercel

## 🚀 Getting Started (local setup)
1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env` using the values from `.env.example`.
4. Start the development server:

```bash
npm run dev
```

5. Open the app in your browser at the local Vite URL shown in the terminal.

### Production build

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

## 📁 Folder Structure
```text
HabiWise/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ ConnectionBell.jsx
│  │  ├─ FilterSidebar.jsx
│  │  ├─ MatchCard.jsx
│  │  ├─ MyConnections.jsx
│  │  ├─ MyMatches.jsx
│  │  ├─ Navbar.jsx
│  │  ├─ PropertyCard.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ SharedPods.jsx
│  │  └─ Spinner.jsx
│  ├─ context/
│  │  └─ AuthContext.jsx
│  ├─ data/
│  │  ├─ candidates.js
│  │  └─ properties.js
│  ├─ firebase/
│  │  └─ config.js
│  ├─ pages/
│  │  ├─ DashboardPage.jsx
│  │  ├─ ExpenseDashboard.jsx
│  │  ├─ LandingPage.jsx
│  │  ├─ ListingsPage.jsx
│  │  ├─ LoginPage.jsx
│  │  ├─ MaintenancePage.jsx
│  │  ├─ PostPropertyPage.jsx
│  │  ├─ PropertyDetailPage.jsx
│  │  ├─ RoommateMatchPage.jsx
│  │  ├─ RoommateResultsPage.jsx
│  │  └─ SignupPage.jsx
│  ├─ utils/
│  │  ├─ connectionHelpers.js
│  │  ├─ feeCalculator.js
│  │  ├─ matchingLogic.js
│  │  ├─ seedProperties.js
│  │  ├─ splitLogic.js
│  │  └─ trustScore.js
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ package.json
├─ vite.config.js
└─ vercel.json
```

## 👥 Team
- Product Design and Development: HabiWise Core Team
- Frontend Engineering: React / Vite UI implementation
- Platform Integration: Firebase, routing, and deployment setup

## 🔗 Live Demo
Live demo URL: https://lab-102-bug-bluster.vercel.app/

If you share the final Vercel URL, replace the placeholder above with the live production link.