# RAIMS — Resource & Asset Inventory Management System

A full-stack application for managing resource allocation, asset inventory, borrowing workflows, and procurement processes.

## Project Structure

```
raims/
├── client/                 # React + Vite frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API & mock services
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── config/            # Database & environment config
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Request handlers
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Helper functions
│   ├── uploads/           # File storage
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
├── package.json           # Root workspace config
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (for database)

### 1. Root Setup
```bash
cd raims
npm install
```

### 2. Frontend Setup
```bash
cd client
npm install
npm install -D tailwindcss postcss autoprefixer vite @vitejs/plugin-react
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3. Backend Setup
```bash
cd ../server
npm install
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet morgan multer nodemailer express-validator
npm run dev  # requires nodemon in dev
```

Backend API will be available at `http://localhost:5000/api/v1`

## Development Workflow

### Frontend Development
```bash
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd server
npm install -D nodemon
npm run dev          # Start with hot reload
# or
npm start            # Run normally
```

## Environment Configuration

1. Copy `.env.example` to `.env` in the root directory
2. Update the values with your local configuration:
   - MongoDB connection string
   - JWT secret
   - Email credentials (optional)

## Build Modules (Implementation Order)

1. **Auth & Users** - Login, registration, user management
2. **Asset Registry** - Create, update, view assets
3. **Search** - Search and filter assets
4. **Resource Requests** - Request assets with approval workflow
5. **Checkout/Borrowing** - Track active borrowings and overdue items
6. **Locations & Reuse** - Location management and reuse recommendations
7. **Procurement** - Purchase order and procurement workflow
8. **Notifications** - Alert system and notification feed
9. **Reports** - Analytics and dashboards

## Key Technologies

### Frontend
- React 18+
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts (for analytics)

### Backend
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt (password hashing)
- Multer (file uploads)
- Nodemailer (email)

## API Documentation

API endpoints follow RESTful conventions under `/api/v1/`:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /assets` - List assets
- `POST /assets` - Create asset
- `GET /requests` - List requests
- `POST /requests` - Create request
- ... (and more)

Full API documentation to be added as endpoints are implemented.

## Contributing

Follow the build module order when implementing features. Each module should include:
- Frontend pages and components
- Backend models, controllers, and routes
- Mock data (frontend during development)
- Integration tests (as needed)

## License

ISC
