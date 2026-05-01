# ARU Web-Based Internship Management System

A comprehensive web-based platform for managing internships, connecting participants, organizations, mentors, and system administrators.

## Features

### Core Functionality

#### 1. User Management
- User registration and authentication
- Role-based access control
- Profile management
- Secure login/logout system

#### 2. Internship Management
- Create and manage internship opportunities
- Application tracking and status updates
- Document submission and review
- Progress monitoring

#### 3. Application System
- Online application submission
- Application status tracking
- Document uploads
- Communication tools

#### 4. Reporting and Evaluation
- Progress reports submission
- Performance evaluations
- Feedback system
- Analytics and insights

## Technology Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **React Router 6.3.0** - Client-side routing
- **Axios 1.4.0** - HTTP client
- **Bootstrap 5.2.3** - UI framework
- **React Hook Form 7.43.9** - Form management

### Backend
- **Laravel 10.x** - PHP framework
- **MySQL** - Database
- **JWT Authentication** - Token-based auth
- **RESTful API** - API architecture

## System Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── App.js             # Main application component
```

### Backend Structure
```
backend/
├── app/
│   ├── Http/Controllers/   # API controllers
│   ├── Models/            # Eloquent models
│   └── Http/Middleware/   # Custom middleware
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── routes/               # API routes
└── config/               # Configuration files
```

## Database Schema

### Core Tables

#### Users
- User authentication and profile management
- Role-based permissions
- Account status tracking

#### Internships
- Internship opportunity details
- Organization information
- Status and workflow management

#### Applications
- Application submissions
- Document attachments
- Status tracking

#### Reports
- Progress reports
- Evaluation records
- Feedback data

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/me` - Current user info

### Internships
- `GET /api/public/internships` - Public internship listings
- `GET /api/internships` - Protected internship management
- `POST /api/internships` - Create new internship
- `PUT /api/internships/{id}` - Update internship
- `DELETE /api/internships/{id}` - Delete internship

### Applications
- `GET /api/applications` - Application management
- `POST /api/applications` - Submit application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Reports
- `GET /api/reports` - Report management
- `POST /api/reports` - Submit report
- `PUT /api/reports/{id}` - Update report
- `DELETE /api/reports/{id}` - Delete report

### Evaluations
- `GET /api/evaluations` - Evaluation management
- `POST /api/evaluations` - Create evaluation
- `PUT /api/evaluations/{id}` - Update evaluation
- `DELETE /api/evaluations/{id}` - Delete evaluation

## Installation

### Prerequisites
- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- Composer
- npm

### Backend Setup
1. Clone the repository
2. Navigate to `backend` directory
3. Install dependencies: `composer install`
4. Configure environment: `cp .env.example .env`
5. Generate JWT key: `php artisan jwt:secret`
6. Run migrations: `php artisan migrate`
7. Start server: `php artisan serve`

### Frontend Setup
1. Navigate to `frontend` directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Configuration

### Environment Variables
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aru_ims
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_jwt_secret_key
```

### Frontend Configuration
```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

## Security Features

- JWT-based authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection

## Current System Status

The system has been completely cleaned of all actor-specific functionality and is now a clean foundation ready for new development:

### ✅ Clean Components
- No actor dashboards or role-specific interfaces
- Simplified authentication system
- Clean database schema
- Updated documentation

### ✅ Preserved Features
- Landing page with modern UI
- Login/authentication system
- Core API structure
- Database foundation

### ✅ Ready for Development
- Clean codebase
- Modern tech stack
- Scalable architecture
- Comprehensive documentation

## Support

For support and inquiries:
- Email: support@aru.edu.et
- Documentation: This README file
- Database Schema: See `docs/database-schema.md`

## License

This project is proprietary to Arsi University.
