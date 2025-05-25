# MediConnect - Real-time Doctor Availability System

A comprehensive healthcare application built with Next.js, Prisma, PostgreSQL, and real-time WebSocket communication that enables seamless doctor-patient interactions through real-time availability tracking and instant notifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Architecture Decisions](#architecture-decisions)
- [Challenges Faced](#challenges-faced)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Roadmap](#roadmap)

## 🏥 Overview

**Project Type**: Web-based Healthcare Application  
**Task Title**: Real-time Doctor Availability & Notification System (MVP)

MediConnect is a proof-of-concept healthcare system that solves the critical problem of real-time doctor availability tracking. The platform enables:

- **Doctors** to log in and update their status (Online/Offline) in real-time
- **Patients** to view currently available doctors instantly
- **Automatic notifications** via email when doctors come online
- **Real-time updates** across all connected clients using WebSocket technology

## 🌟 Features

### Core Functionality
- ✅ **Real-time Doctor Availability**: Doctors can toggle online/offline status with instant updates
- ✅ **Patient Notifications**: Automatic email notifications when doctors come online
- ✅ **Appointment Management**: Complete booking and management system
- ✅ **Role-based Authentication**: JWT-based auth with Doctor/Patient roles
- ✅ **Real-time Updates**: WebSocket integration for live status updates
- ✅ **Responsive Design**: Mobile-first responsive UI

### Advanced Features
- 📊 **Analytics Dashboard**: Comprehensive insights and metrics
- 👤 **Profile Management**: User profile customization with specializations
- 🔐 **Security**: Production-ready error handling, logging, and security features
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🎨 **Modern UI/UX**: Built with Tailwind CSS and shadcn/ui components

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **Real-time**: WebSocket integration

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)

### Database & Services
- **Database**: PostgreSQL (Neon recommended)
- **Email Service**: Resend
- **Real-time Communication**: WebSocket/Socket.IO

### Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (Neon, Railway, or local)
- **Resend** account for email notifications
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sajalbatra/MediConnect.git
cd MediConnect
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Environment Variables

```bash
cp .env.example .env
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed database with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

### 6. Access the Application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mediconnect"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Optional: For production
NODE_ENV="development"
```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ |
| `RESEND_API_KEY` | API key for email notifications | ✅ |
| `NEXTAUTH_URL` | Base URL of your application | ✅ |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js encryption | ✅ |

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your `.env` file

### Using Local PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb mediconnect

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/mediconnect"
```

## 📚 API Documentation

### Base URL
```
Local: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (doctor or patient).

**Request Body:**
```json
{
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "DOCTOR", // or "PATIENT"
  "specialization": "Cardiology" // required for doctors
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "name": "Dr. John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Dr. John Doe",
    "email": "john@example.com",
    "role": "DOCTOR"
  }
}
```

### Doctor Endpoints

#### GET `/api/doctors`
Get all doctors with optional filters.

**Query Parameters:**
- `specialization`: Filter by specialization
- `online`: Filter by online status

**Response:**
```json
{
  "doctors": [
    {
      "id": "doctor-id",
      "name": "Dr. John Doe",
      "specialization": "Cardiology",
      "isOnline": true,
      "lastOnline": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET `/api/doctors/online`
Get currently online doctors.

#### PUT `/api/doctors/status`
Update doctor's online status.

**Request Body:**
```json
{
  "isOnline": true
}
```

### Appointment Endpoints

#### GET `/api/appointments`
Get user's appointments.

#### POST `/api/appointments`
Create new appointment.

**Request Body:**
```json
{
  "doctorId": "doctor-id",
  "scheduledFor": "2024-01-15T14:00:00Z",
  "reason": "Regular checkup"
}
```

#### PUT `/api/appointments/[id]`
Update appointment status.

#### DELETE `/api/appointments/[id]`
Cancel appointment.

### User Endpoints

#### GET `/api/users/profile`
Get user profile information.

#### PUT `/api/users/profile`
Update user profile.

### Analytics Endpoints

#### GET `/api/analytics`
Get system analytics (admin/doctor only).

**Response:**
```json
{
  "totalUsers": 150,
  "totalDoctors": 25,
  "totalPatients": 125,
  "onlineDoctors": 8,
  "appointmentsToday": 12,
  "emailsSent": 45
}
```

## 🏗️ Database Schema

### Core Models

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(PATIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  doctor    Doctor?
  patient   Patient?
}
```

#### Doctor
```prisma
model Doctor {
  id             String   @id @default(cuid())
  specialization String
  isOnline       Boolean  @default(false)
  lastOnline     DateTime?
  
  // Relations
  user           User         @relation(fields: [userId], references: [id])
  userId         String       @unique
  appointments   Appointment[]
}
```

#### Patient
```prisma
model Patient {
  id           String   @id @default(cuid())
  dateOfBirth  DateTime?
  phoneNumber  String?
  
  // Relations
  user         User         @relation(fields: [userId], references: [id])
  userId       String       @unique
  appointments Appointment[]
}
```

#### Appointment
```prisma
model Appointment {
  id           String            @id @default(cuid())
  scheduledFor DateTime
  reason       String?
  status       AppointmentStatus @default(SCHEDULED)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  
  // Relations
  doctor       Doctor   @relation(fields: [doctorId], references: [id])
  doctorId     String
  patient      Patient  @relation(fields: [patientId], references: [id])
  patientId    String
}
```

#### Notification
```prisma
model Notification {
  id        String   @id @default(cuid())
  email     String
  subject   String
  content   String
  sent      Boolean  @default(false)
  sentAt    DateTime?
  createdAt DateTime @default(now())
}
```

### Enums

```prisma
enum Role {
  DOCTOR
  PATIENT
  ADMIN
}

enum AppointmentStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

## 👥 User Roles

### 🩺 Doctor
- **Authentication**: Login with email/password
- **Status Management**: Toggle online/offline status in real-time
- **Appointment Management**: View and manage patient appointments
- **Profile Management**: Update specialization and personal information
- **Dashboard Access**: View appointment statistics and patient information

### 🏥 Patient
- **Authentication**: Register and login with email/password
- **Doctor Discovery**: View list of currently online doctors
- **Appointment Booking**: Schedule appointments with available doctors
- **Notifications**: Receive email alerts when doctors come online
- **History**: View appointment history and status updates

### 👨‍💼 Admin (Future Enhancement)
- **System Analytics**: Access comprehensive system metrics
- **User Management**: Manage doctor and patient accounts
- **System Configuration**: Configure notification settings and system parameters

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for doctors and patients
- **Protected API Routes**: Middleware-based route protection
- **Password Security**: Bcrypt hashing for password storage

### Data Protection
- **Input Validation**: Comprehensive request validation using Zod schemas
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Security Headers
- **Content Security Policy**: Protection against XSS attacks
- **Rate Limiting**: API endpoint rate limiting (future enhancement)
- **HTTPS Enforcement**: Secure connections in production

## 🏛️ Architecture Decisions

### 1. **Next.js Full-Stack Architecture**
**Decision**: Use Next.js with API routes for both frontend and backend.

**Reasoning**:
- Single codebase for frontend and backend
- Excellent TypeScript support
- Built-in optimizations (image optimization, code splitting)
- Server-side rendering capabilities
- Simplified deployment process

### 2. **Prisma ORM with PostgreSQL**
**Decision**: Use Prisma as the database ORM with PostgreSQL.

**Reasoning**:
- Type-safe database queries
- Automatic migration generation
- Excellent TypeScript integration
- Powerful query capabilities
- Strong community support

### 3. **JWT Authentication**
**Decision**: Implement JWT-based authentication instead of session-based.

**Reasoning**:
- Stateless authentication suitable for API-first architecture
- Easy to scale horizontally
- Mobile app compatibility (future enhancement)
- No server-side session storage required

### 4. **Real-time Updates with WebSocket**
**Decision**: Use WebSocket for real-time doctor status updates.

**Reasoning**:
- Instant status updates across all connected clients
- Better user experience than polling
- Efficient bandwidth usage
- Supports bi-directional communication

### 5. **Email Notifications with Resend**
**Decision**: Use Resend for email notifications instead of SMTP.

**Reasoning**:
- Modern API-first email service
- Excellent deliverability rates
- Simple integration
- Built-in templates and analytics

## 🧗 Challenges Faced

### 1. **Real-time Status Synchronization**
**Challenge**: Ensuring all clients receive doctor status updates instantly.

**Solution**:
- Implemented WebSocket connections with proper connection management
- Added fallback polling mechanism for connection failures
- Implemented client-side state synchronization with server state

### 2. **Email Notification Performance**
**Challenge**: Sending emails to all patients when doctors come online without blocking the main thread.

**Solution**:
- Implemented background job processing for email notifications
- Added email queue with retry mechanism
- Optimized database queries to fetch patient email lists efficiently

### 3. **Authentication State Management**
**Challenge**: Managing authentication state across different components and API calls.

**Solution**:
- Used Zustand for global state management
- Implemented automatic token refresh mechanism
- Added proper error handling for expired tokens

### 4. **Database Schema Design**
**Challenge**: Designing a flexible schema that supports both doctors and patients with different requirements.

**Solution**:
- Created a base User model with role-specific extensions (Doctor, Patient)
- Used Prisma's relation features for proper data modeling
- Implemented proper indexing for performance optimization

### 5. **Mobile Responsiveness**
**Challenge**: Creating a responsive design that works well on all device sizes.

**Solution**:
- Adopted mobile-first design approach
- Used Tailwind CSS responsive utilities
- Implemented progressive enhancement for desktop features

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth
```

### Test Structure

```
__tests__/
├── components/          # Component tests
├── pages/              # Page integration tests
├── api/                # API endpoint tests
├── utils/              # Utility function tests
└── setup.js            # Test configuration
```

### Test Coverage Goals

- **Components**: 80%+ coverage
- **API Routes**: 90%+ coverage
- **Utility Functions**: 95%+ coverage
- **Critical User Flows**: 100% coverage

### Example Test

```typescript
// __tests__/api/auth/login.test.ts
import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

describe('/api/auth/login', () => {
  it('should authenticate valid user', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'doctor@example.com',
        password: 'password123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('doctor@example.com');
  });
});
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on each push

3. **Environment Variables for Production**
   ```env
   DATABASE_URL="your-production-postgresql-url"
   JWT_SECRET="your-production-jwt-secret"
   RESEND_API_KEY="your-resend-api-key"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-production-nextauth-secret"
   NODE_ENV="production"
   ```

### Alternative Deployment Options

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t mediconnect .
docker run -p 3000:3000 mediconnect
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Error monitoring setup (Sentry)
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured

## 📊 Monitoring and Analytics

### System Analytics

The application includes comprehensive analytics dashboard:

#### Key Metrics Tracked
- **User Metrics**: Registration trends, active users, role distribution
- **Doctor Metrics**: Online status patterns, availability statistics
- **Appointment Metrics**: Booking rates, completion rates, cancellation patterns
- **Email Metrics**: Notification delivery rates, open rates
- **System Metrics**: API response times, error rates, uptime

#### Analytics Implementation

```typescript
// Example analytics query
const analytics = await prisma.$transaction([
  prisma.user.count(),
  prisma.doctor.count({ where: { isOnline: true } }),
  prisma.appointment.count({
    where: {
      scheduledFor: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  })
]);
```

### Performance Monitoring

- **Response Time Tracking**: Monitor API endpoint performance
- **Error Rate Monitoring**: Track and alert on error spikes
- **Real-time Connection Monitoring**: WebSocket connection health
- **Database Performance**: Query performance and connection pool monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/sajalbatra/MediConnect.git
   cd MediConnect
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **Submit Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all checks pass

### Code Style Guidelines

- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **Commit Messages**: Follow conventional commit format

### Contribution Areas

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 MediConnect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Email**: Contact the development team at support@mediconnect.app

### Common Issues

#### Database Connection Issues
```bash
# Check database URL format
DATABASE_URL="postgresql://username:password@host:port/database"

# Test connection
npm run db:test-connection
```

#### Email Notifications Not Working
```bash
# Verify Resend API key
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### WebSocket Connection Issues
- Check firewall settings
- Verify WebSocket support in browser
- Check network proxy configurations

### Troubleshooting Guide

1. **Clear Browser Cache**: For UI-related issues
2. **Restart Development Server**: For hot-reload issues
3. **Check Environment Variables**: For configuration issues
4. **Update Dependencies**: For compatibility issues

## 🌟 Acknowledgments

- **Next.js Team** - For the amazing full-stack framework
- **Prisma Team** - For the excellent database toolkit
- **Vercel** - For seamless deployment platform
- **shadcn/ui** - For beautiful UI components
- **Open Source Community** - For the incredible libraries and tools

---

**Made with ❤️ by the NullSphere Labs**

*Connecting Healthcare, One Click at a Time*