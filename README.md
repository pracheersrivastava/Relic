# Coursera Clone

A full-stack learning platform built with Next.js 14, Express.js, and MongoDB.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- CSS Modules with Design Tokens
- Context API for state management

### Backend
- Express.js
- MongoDB (Atlas)
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
CourseEra_Clone/
├── frontend/             # Next.js frontend
│   └── src/
│       ├── app/          # Pages (homepage, login, courses, cart, course player)
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth, Cart, and Theme context providers
│       ├── data/         # Type definitions and static UI data
│       ├── lib/          # API client
│       └── styles/       # Global styles and design tokens
│
└── backend/              # Express.js backend
    └── src/
        ├── controllers/  # Route handlers (user, course, cart, reviews, section)
        ├── models/       # Mongoose models (User, Course, Cart, Order, Enrollment, Review, Section)
        ├── routes/       # API routes
        ├── services/     # Business logic (cart service, enrollment service)
        ├── middlewares/  # JWT verification
        ├── utils/        # Utilities (ApiError, asyncHandler)
        └── db/           # Database connection
```

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3001

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with course grid, ratings from DB, and auto-scrolling carousels |
| `/login` | Login/Register with password visibility toggle |
| `/courses` | My Learning - enrolled courses |
| `/cart` | Shopping cart with checkout |
| `/course/[id]` | Course player with video, sections sidebar, and review form |

## Features

- **Homepage**: Coursera-style UI with hero banner, category cards, course grid with real ratings from database, and animated auto-scrolling course carousels
- **Authentication**: User registration and login with JWT tokens, password visibility toggle on all password fields
- **Change Password**: Modal to change password with field-specific error handling
- **Shopping Cart**: Add/remove courses with real-time updates, checkout flow, CartContext for global state
- **My Learning**: View enrolled courses after purchase
- **Course Player**: Video player with sections sidebar fetched from backend
- **Reviews & Ratings**: Submit reviews for enrolled courses, view existing reviews, ratings automatically update course averageRating and totalReviews
- **Dark Mode**: Toggle between light and dark themes with iOS-style glassmorphism effects
- **Responsive Design**: Works on desktop and mobile
- **Course Images**: Dynamic course images from Unsplash
- **Premium UI**: Modern card designs with hover effects, smooth animations, and gradient accents

## Recent Updates

- **Video Player**: Custom YouTube player with controls, keyboard shortcuts, and "Next Lesson" auto-advance popup
- **Welcome Widget**: Personalized homepage widget tracking last watched course and progress
- **Lesson Progress**: Backend tracking of completed lessons and video progress
- **Content**: Seeded "Machine Learning Fundamentals" course with 134 real video lessons (CampusX)
- **Course Sections**: Full section/lesson fetching from backend with sidebar navigation
- **Ratings System**: Dynamic course ratings from database based on user reviews
- **UI Polish**: Fixed logout issues, improved widget positioning, and enhanced responsive design

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/users/register` | No | Register new user |
| POST | `/api/v1/users/login` | No | Login user |
| POST | `/api/v1/users/logout` | Yes | Logout user |
| POST | `/api/v1/users/change-password` | Yes | Change user password |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/courses/all-courses` | No | Get all available courses (includes averageRating, totalReviews) |
| GET | `/api/v1/courses/my-courses` | Yes | Get user's enrolled courses |
| POST | `/api/v1/courses/recalculate-ratings` | No | Recalculate all course ratings from reviews |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/courses/my-courses/:courseId/review` | Yes | Submit a review for enrolled course |
| GET | `/api/v1/courses/my-courses/:courseId/review` | Yes | Get user's review for a course |

### Sections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/section/courses/:courseId/sections` | No | Get all sections for a course |
| GET | `/api/v1/section/sections/:sectionId` | No | Get a specific section |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/cart` | Yes | Get user's cart |
| POST | `/api/v1/cart/add` | Yes | Add course to cart |
| DELETE | `/api/v1/cart/remove/:courseId` | Yes | Remove course from cart |
| POST | `/api/v1/cart/pay` | Yes | Checkout (mock payment) |
| DELETE | `/api/v1/cart/clear` | Yes | Clear cart |

## Environment Variables

Create `.env` in backend folder:
```
MONGODB_URI=your_mongodb_uri
PORT=5000
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=30d
```