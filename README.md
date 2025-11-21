# EduAccess - Educational Resource Platform

![EduAccess](https://img.shields.io/badge/EduAccess-Education--Platform-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![AWS](https://img.shields.io/badge/AWS-S3-orange)

A full-stack educational resource sharing platform built with modern technologies. EduAccess enables students, teachers, and educational institutions to share, discover, and manage educational resources efficiently.

##  Features

###  Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Student, Teacher, Admin, Alumni)
- Secure password hashing with bcrypt

###  Resource Management
- File upload/download with AWS S3 integration
- Advanced search with filters (subject, grade, school, tags)
- Resource moderation workflow with admin approval
- Offline PWA support with background sync

###  School System
- School profiles with statistics and analytics
- Institution-based resource organization
- School admin management

###  Admin Features
- Moderation dashboard for content approval
- User management with role control
- School management and analytics
- Platform statistics and insights

### PWA & Offline Support
- Progressive Web App capabilities
- Offline file storage using IndexedDB
- Background sync for downloads
- Installable on mobile and desktop

##  Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- AWS SDK v3 for S3 storage
- Multer for file uploads
- Jest + Supertest for testing

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- React Query for data fetching
- PWA with service workers
- localForage for offline storage

## Installation

### Prerequisites
- Node.js 18+
- MongoDB
- AWS Account (for S3 file storage)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eduaccess-platform.git
cd eduaccess-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
```

Edit `backend/.env`:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=eduaccess-bucket-yourname
STORAGE_DRIVER=s3

# App Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduaccess
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=EduAccess
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

##  Usage

### Default Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eduaccess.com | admin123 |
| Teacher | teacher@eduaccess.com | teacher123 |
| Student | student@eduaccess.com | student123 |

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/api-docs

## 🗂️ Project Structure

```
eduaccess-platform/
├── backend/
│   ├── config/          # Database and AWS configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic and storage services
│   ├── middlewares/     # Custom middleware
│   └── tests/           # Backend test suite
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API and storage services
│   │   └── tests/       # Frontend test suite
│   └── public/          # PWA assets
└── README.md
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Coverage

```bash
# Backend coverage
cd backend
npm test -- --coverage

# Frontend coverage
cd frontend
npm run test:coverage
```

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | User logout |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get resources with filtering |
| POST | `/api/resources` | Upload new resource |
| GET | `/api/resources/:id` | Get resource details |
| GET | `/api/resources/:id/download` | Download resource |

### Schools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schools` | List all schools |
| GET | `/api/schools/:id` | Get school details |
| GET | `/api/schools/:id/resources` | Get school resources |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/moderation/pending` | Get pending resources |
| POST | `/api/moderation/resources/:id/approve` | Approve resource |
| POST | `/api/moderation/resources/:id/reject` | Reject resource |

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### Build for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend (ready for production)
cd backend
npm start
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI design inspiration from Dribbble "Education Dashboard UI"
- Icons by [Lucide React](https://lucide.dev/)
- PWA capabilities with [Vite PWA plugin](https://vite-pwa-org.netlify.app/)

---

**EduAccess** - Connecting educators and students through shared knowledge and resources. 