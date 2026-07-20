# DeepTravel

DeepTravel is a full-stack travel planning platform that allows users to explore destinations, manage personalized travel plans, and organize trips through a modern web interface. The application includes secure authentication, role-based access control, destination management, trip planning, and an administrative dashboard for content management.

---

## Features

### User Features

- User registration and login using JWT authentication.
- Browse destinations from around the world.
- Search, filter, and sort destinations.
- View detailed destination information.
- Save destinations as personal trips.
- Manage trip status (Planned, Ongoing, Completed, Cancelled).
- Edit personal profile information.
- Responsive dashboard with travel statistics.

### Admin Features

- Secure administrator access.
- Add new destinations.
- Delete destinations.
- Manage destination catalog.
- Seed database with sample destinations.

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JSON Web Tokens (JWT)
- bcrypt

### Deployment

- Vercel (Frontend)
- Render / Node Server (Backend)

---

## Project Architecture

```

                 React Frontend
                        │
                        ▼
                Express REST API
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
 Authentication   Destinations      Trips
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                  MongoDB Database

```

---

## Main Features

### Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Persistent Sessions
- Logout

---

### Destination Explorer

Users can

- Browse destinations
- Search destinations
- Filter by category
- Sort by price
- Sort by rating
- View destination details

---

### Trip Dashboard

Users can

- Save destinations
- Manage planned trips
- Update trip status
- Remove trips
- Track travel statistics

---

### User Profile

Users can

- Update username
- Update email
- Update bio
- Update location

---

### Admin Panel

Administrators can

- Create destinations
- Delete destinations
- View all destinations
- Seed the database

---

## Folder Structure

```

DeepTravel/

├── frontend/
│
│   ├── src/
│   │
│   ├── App.jsx
│   ├── Dashboard.jsx
│   ├── Explore.jsx
│   ├── DestinationDetail.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Settings.jsx
│   ├── Admin.jsx
│   ├── Navbar.jsx
│   ├── AuthContext.jsx
│   └── main.jsx
│
├── api-backend/
│
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json

```

---

## Installation

### Clone

```bash
git clone https://github.com/Phinix-Morgan/DeepTravel.git
cd DeepTravel
```

---

## Backend Setup

```bash
cd api-backend

npm install
```

Create a `.env` file.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Run the backend.

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend.

```bash
npm run dev
```

---

## API Endpoints

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- PUT `/api/auth/profile`

---

### Destinations

- GET `/api/destinations`
- GET `/api/destinations/:id`
- POST `/api/destinations`
- DELETE `/api/destinations/:id`

---

### Trips

- GET `/api/trips`
- POST `/api/trips`
- PUT `/api/trips/:id`
- DELETE `/api/trips/:id`

---

## Screenshots

Add screenshots here.

- Home Page
- Explore
- Destination Details
- Dashboard
- Admin Panel
- Settings
- Login
- Signup

---

## Future Improvements

- AI itinerary generation
- Hotel booking integration
- Flight search integration
- Google Maps integration
- Weather API
- Payment gateway
- Reviews and ratings
- Wishlist
- Notifications
- Email verification
- Password reset
- Social login
- Image upload support

---

## What I Learned

This project helped me gain practical experience with

- React
- React Router
- Context API
- JWT Authentication
- Express.js
- MongoDB
- Mongoose
- REST API development
- CRUD operations
- Role-Based Authorization
- Protected Routes
- Full-stack application architecture
- Tailwind CSS
- Frontend and Backend integration

---

## License

This project is licensed under the MIT License.
