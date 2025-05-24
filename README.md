# Healthcare Real-time Doctor Availability System

A comprehensive MediConnectlication built with Next.js, Prisma, PostgreSQL, and real-time WebSocket communication.

## 🏥 Features

### Core Functionality
- **Real-time Doctor Availability**: Doctors can toggle online/offline status with instant updates
- **Patient Notifications**: Automatic email notifications when doctors come online
- **Appointment Management**: Complete booking and management system
- **Role-based Authentication**: JWT-based auth with Doctor/Patient roles
- **Real-time Updates**: WebSocket integration for live status updates

### Advanced Features
- **Analytics Dashboard**: Comprehensive insights and metrics
- **Profile Management**: User profile customization
- **Responsive Design**: Mobile-first responsive UI
- **Production Ready**: Error handling, logging, and security features

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Email**: Resend
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Resend account for email notifications

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd healthcare-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="your-super-secret-jwt-key"
   RESEND_API_KEY="your-resend-api-key"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   npm run db:push
   npm run db:generate
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors (with filters)
- `GET /api/doctors/online` - Get online doctors
- `PUT /api/doctors/status` - Update doctor online status

### Appointment Endpoints
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Analytics Endpoints
- `GET /api/analytics` - Get system analytics

## 🏗️ Database Schema

### Core Models
- **User**: Base user information
- **Doctor**: Doctor-specific data and status
- **Patient**: Patient-specific data
- **Appointment**: Appointment management
- **Notification**: Email notification tracking

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- API route protection middleware
- Input validation and sanitization
- Error handling and logging

## 📱 User Roles

### Doctor
- Toggle online/offline status
- View and manage appointments
- Update profile and speciality
- Real-time patient notifications

### Patient
- View online doctors
- Book appointments
- Receive email notifications
- Manage appointment history

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
\`\`\`env
DATABASE_URL="your-production-postgresql-url"
JWT_SECRET="your-production-jwt-secret"
RESEND_API_KEY="your-resend-api-key"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📊 Monitoring and Analytics

The application includes comprehensive analytics:
- User registration trends
- Appointment statistics
- Doctor availability metrics
- Email notification tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added analytics dashboard
- **v1.2.0**: Enhanced appointment management
- **v1.3.0**: Production optimizations

## 🎯 Roadmap

- [ ] Video consultation integration
- [ ] Mobile app development
- [ ] Advanced scheduling features
- [ ] Multi-language support
- [ ] Payment integration
\`\`\`

Production configuration file:
