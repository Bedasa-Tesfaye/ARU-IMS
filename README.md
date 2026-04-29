# ARU Web-Based Internship Management System

A comprehensive web-based system for managing internships, connecting students, companies, coordinators, examiners, and administrators.

## Features

### Actors and Their Capabilities

#### 1. Internship Coordinator
- Register eligible students
- Approve internship applications
- Assign examiners/supervisors to students
- Submit internship documents

#### 2. Student
- Apply for internships
- Submit internship documents
- Submit reports
- View internship status
- View feedback from examiners

#### 3. Company
- Post internship opportunities
- Review student applications
- Submit company evaluation
- Review student reports

#### 4. Examiner
- Evaluate students
- Provide feedback
- Review reports

#### 5. System Administrator
- Generate reports
- Monitor system activities

#### 6. AI Module
- Provide AI-based recommendations
- Generate risk alerts
- Support monitoring internship progress

## Technology Stack

### Backend
- PHP with Laravel framework
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React.js
- Bootstrap/Tailwind CSS for styling
- Axios for API calls

### Database
- MySQL as the relational database management system for storing and managing internship data. MySQL provides efficient data storage, fast query processing, and strong support for relational data modeling, making it suitable for handling internship records securely and reliably.

### AI Integration
- Python-based AI service
- Machine learning models for recommendations and risk detection

## Project Structure

```
ARU IMS/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Providers/
│   │   └── Services/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── storage/
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── ai-module/
│   ├── models/
│   ├── services/
│   └── app.py
├── docs/
│   └── database-schema.md
└── README.md
```

## Installation

### Prerequisites
- PHP >= 8.0
- Composer
- Node.js >= 16
- npm
- Python >= 3.8
- MySQL/MariaDB

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### AI Module Setup
```bash
cd ai-module
pip install -r requirements.txt
python app.py
```

## Environment Variables

### Backend .env
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aru_internship
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your_jwt_secret_key
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:8000/api
```

## API Documentation

API documentation will be available at `/api/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
