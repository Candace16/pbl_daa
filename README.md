# BookMyShow Clone - Complete Full Stack Application

A complete movie booking platform built with Next.js, Node.js, MongoDB, Redis, and Kafka featuring real-time seat selection, payment integration, and race condition handling.

## 🚀 Features

### Frontend (Next.js)
- **Modern UI/UX** with Tailwind CSS and shadcn/ui components
- **Real-time seat selection** with WebSocket integration
- **Authentication system** (Login/Register)
- **Movie browsing** with search and filters
- **Showtime selection** with date/time/format options
- **Seat booking** with real-time availability
- **Payment integration** with Razorpay
- **Booking management** (view, cancel bookings)
- **Responsive design** for all devices

### Backend (Node.js/Express)
- **RESTful API** with comprehensive endpoints
- **Real-time WebSocket** communication
- **JWT Authentication** with role-based access
- **MongoDB** with Mongoose ODM
- **Redis** for caching and session management
- **Kafka** for event streaming and messaging
- **Race condition handling** for seat booking
- **Payment gateway integration**
- **Email notifications**
- **Automated cleanup jobs**

### Key Technical Features
- **Race Condition Prevention**: Redis locks for seat booking
- **Real-time Updates**: WebSocket for live seat availability
- **Event Streaming**: Kafka for booking/payment events
- **Caching**: Redis for improved performance
- **Security**: JWT tokens, input validation, rate limiting
- **Scalability**: Microservice-ready architecture

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Socket.io-client
- Lucide React icons

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Redis
- Apache Kafka
- Socket.io
- JWT Authentication
- Razorpay Payment Gateway
- Nodemailer
- Node-cron

### DevOps
- Docker & Docker Compose
- Environment configuration
- Automated seeding

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Redis** server
- **Apache Kafka** (optional for development)
- **Docker & Docker Compose** (recommended)

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd bookmyshow-clone
\`\`\`

### 2. Start All Services
\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)
- Backend API (port 5000)
- Frontend (port 3000)

### 3. Seed the Database
\`\`\`bash
docker exec bookmyshow-backend npm run seed
\`\`\`

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 🔧 Manual Setup (Development)

### 1. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

Create `.env` file:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=bookmyshow-backend
FRONTEND_URL=http://localhost:3000
\`\`\`

Start the backend:
\`\`\`bash
npm run dev
\`\`\`

Seed the database:
\`\`\`bash
npm run seed
\`\`\`

### 2. Frontend Setup

\`\`\`bash
cd frontend
npm install
\`\`\`

Create `.env.local` file:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
\`\`\`

Start the frontend:
\`\`\`bash
npm run dev
\`\`\`

## 📱 Usage Guide

### 1. User Registration/Login
- Visit http://localhost:3000
- Click "Sign in" to register or login
- Use demo credentials or create new account

### 2. Browse Movies
- View featured movies on homepage
- Use search functionality
- Filter by genre, language, etc.

### 3. Book Tickets
- Select a movie
- Choose showtime, date, and format
- Select number of seats
- Choose specific seats (real-time updates)
- Complete payment

### 4. Manage Bookings
- View booking history
- Cancel bookings (if allowed)
- Download tickets

## 🔐 Demo Accounts

After seeding, you can use these accounts:

**Admin User:**
- Email: admin@bookmyshow.com
- Password: admin123

**Theater Owner:**
- Email: owner@pvr.com
- Password: owner123

## 🏗️ Architecture Overview

### Database Schema
- **Users**: Authentication and profile management
- **Movies**: Movie catalog with metadata
- **Theaters**: Theater and screen management
- **Showtimes**: Show scheduling and pricing
- **Bookings**: Ticket booking records

### Real-time Features
- **WebSocket connections** for live seat updates
- **Redis locks** prevent race conditions
- **Kafka events** for system-wide notifications
- **Automatic cleanup** of expired seat holds

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

#### Movies
- `GET /api/movies` - List movies
- `GET /api/movies/:id` - Get movie details

#### Showtimes
- `GET /api/showtimes/:movieId` - Get showtimes for movie

#### Seats
- `GET /api/seats/:showtimeId` - Get seat layout
- `POST /api/seats/hold` - Hold seats temporarily
- `POST /api/seats/release` - Release held seats

#### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

#### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
\`\`\`

#### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
\`\`\`

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd backend
npm test
\`\`\`

### Frontend Testing
\`\`\`bash
cd frontend
npm test
\`\`\`

## 📦 Deployment

### Production Build

#### Backend
\`\`\`bash
cd backend
npm run build
npm start
\`\`\`

#### Frontend
\`\`\`bash
cd frontend
npm run build
npm start
\`\`\`

### Docker Production
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Redis Connection Error**
   - Ensure Redis server is running
   - Check Redis configuration

3. **Kafka Connection Error**
   - Ensure Kafka and Zookeeper are running
   - Check broker configuration

4. **Port Already in Use**
   - Change ports in docker-compose.yml
   - Kill existing processes

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the documentation
- Contact the development team

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Loyalty program
- [ ] Advanced recommendation engine
- [ ] Microservices architecture
- [ ] Kubernetes deployment

---

**Happy Coding! 🎬🍿**
