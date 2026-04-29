# ARU Internship Management System - Database Schema

## Overview

This document describes the database schema for the ARU Web-Based Internship Management System. The system uses MySQL as the primary database and follows Laravel's Eloquent ORM conventions.

## Database Tables

### 1. Users Table

The `users` table stores user account information for all system actors.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    role ENUM('admin', 'coordinator', 'student', 'company', 'examiner') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Relationships:**
- One-to-many with `applications` (as student)
- One-to-many with `applications` (as coordinator)
- One-to-many with `internships` (as coordinator)
- One-to-many with `reports` (as student)
- One-to-many with `reports` (as examiner)
- One-to-many with `evaluations` (as examiner)

### 2. Companies Table

The `companies` table stores information about companies offering internships.

```sql
CREATE TABLE companies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    description TEXT NULL,
    website VARCHAR(255) NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Relationships:**
- One-to-many with `internships`
- One-to-many with `evaluations`

### 3. Internships Table

The `internships` table stores information about available internship positions.

```sql
CREATE TABLE internships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('full-time', 'part-time', 'remote', 'hybrid') NOT NULL,
    duration_weeks INT NOT NULL,
    stipend DECIMAL(10,2) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'active', 'closed', 'completed') NOT NULL,
    requirements TEXT NULL,
    responsibilities TEXT NULL,
    max_applicants INT DEFAULT 1,
    current_applicants INT DEFAULT 0,
    company_id BIGINT UNSIGNED NOT NULL,
    coordinator_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Belongs to `company`
- Belongs to `user` (coordinator)
- One-to-many with `applications`
- Has-many-through with `reports` via `applications`
- Has-many-through with `evaluations` via `applications`

### 4. Applications Table

The `applications` table tracks student applications for internships.

```sql
CREATE TABLE applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cover_letter TEXT NULL,
    resume_path VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    applied_date DATE NOT NULL,
    approved_date DATE NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    internship_id BIGINT UNSIGNED NOT NULL,
    coordinator_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Belongs to `user` (student)
- Belongs to `internship`
- Belongs to `user` (coordinator)
- One-to-many with `reports`
- One-to-many with `evaluations`

### 5. Reports Table

The `reports` table stores internship reports submitted by students.

```sql
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('weekly', 'monthly', 'final') NOT NULL,
    report_date DATE NOT NULL,
    status ENUM('submitted', 'reviewed', 'approved', 'rejected') DEFAULT 'submitted',
    feedback TEXT NULL,
    file_path VARCHAR(255) NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    application_id BIGINT UNSIGNED NOT NULL,
    examiner_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Belongs to `user` (student)
- Belongs to `application`
- Belongs to `user` (examiner)

### 6. Evaluations Table

The `evaluations` table stores performance evaluations for students.

```sql
CREATE TABLE evaluations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    technical_skills INT DEFAULT 0,
    communication_skills INT DEFAULT 0,
    problem_solving INT DEFAULT 0,
    teamwork INT DEFAULT 0,
    time_management INT DEFAULT 0,
    overall_performance INT DEFAULT 0,
    strengths TEXT NULL,
    weaknesses TEXT NULL,
    recommendations TEXT NULL,
    type ENUM('midterm', 'final') NOT NULL,
    evaluation_date DATE NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    application_id BIGINT UNSIGNED NOT NULL,
    examiner_id BIGINT UNSIGNED NOT NULL,
    company_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
```

**Relationships:**
- Belongs to `user` (student)
- Belongs to `application`
- Belongs to `user` (examiner)
- Belongs to `company`

## Entity Relationship Diagram

```
Users (1) -----> (N) Applications (N) <----- (1) Internships (N) -----> (1) Companies
   |                  |                     |
   |                  |                     |
   |                  v                     v
   |              Reports               Applications
   |                  |                     |
   |                  |                     |
   |                  v                     v
   |              Evaluations            Evaluations
   |                  |
   |                  |
   v              Users (Examiner)
Users (Examiner)
```

## Indexes

### Recommended Indexes

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Companies table indexes
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_verified ON companies(is_verified);

-- Internships table indexes
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_type ON internships(type);
CREATE INDEX idx_internships_company ON internships(company_id);
CREATE INDEX idx_internships_coordinator ON internships(coordinator_id);
CREATE INDEX idx_internships_dates ON internships(start_date, end_date);

-- Applications table indexes
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_internship ON applications(internship_id);
CREATE INDEX idx_applications_coordinator ON applications(coordinator_id);
CREATE INDEX idx_applications_dates ON applications(applied_date, approved_date);

-- Reports table indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_student ON reports(student_id);
CREATE INDEX idx_reports_application ON reports(application_id);
CREATE INDEX idx_reports_examiner ON reports(examiner_id);
CREATE INDEX idx_reports_date ON reports(report_date);

-- Evaluations table indexes
CREATE INDEX idx_evaluations_type ON evaluations(type);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_application ON evaluations(application_id);
CREATE INDEX idx_evaluations_examiner ON evaluations(examiner_id);
CREATE INDEX idx_evaluations_company ON evaluations(company_id);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date);
```

## Data Constraints and Validation

### Business Rules

1. **User Roles**: Each user must have exactly one role from the predefined enum.
2. **Application Status**: Applications can only transition through valid status changes:
   - pending → approved
   - pending → rejected
   - pending → withdrawn
   - approved → completed (automatic)
3. **Report Status**: Reports follow the workflow: submitted → reviewed → approved/rejected
4. **Evaluation Scores**: All skill scores must be between 1 and 10.
5. **Internship Dates**: End date must be after start date.
6. **Application Limits**: Cannot exceed max_applicants for an internship.

### Data Integrity

1. **Foreign Key Constraints**: All foreign key relationships are enforced.
2. **Check Constraints**: 
   - Evaluation scores between 1-10
   - Stipend values non-negative
   - Duration weeks positive
3. **Unique Constraints**: Email addresses must be unique across users.

## Security Considerations

1. **Password Storage**: All passwords are hashed using Laravel's bcrypt implementation.
2. **Sensitive Data**: Personal information (phone, address) should be handled according to privacy regulations.
3. **Access Control**: Role-based access is enforced at the application level.
4. **Audit Trails**: Created_at and updated_at timestamps provide basic audit functionality.

## Performance Considerations

1. **Indexing Strategy**: Indexes are optimized for common query patterns.
2. **Query Optimization**: Use eager loading (Eloquent relationships) to avoid N+1 queries.
3. **Database Partitioning**: Consider partitioning large tables by date for better performance.
4. **Caching**: Implement Redis caching for frequently accessed data.

## Migration Strategy

1. **Version Control**: All schema changes are managed through Laravel migrations.
2. **Rollback Capability**: Each migration includes rollback functionality.
3. **Data Seeding**: Essential data is seeded through Laravel seeders.
4. **Backup Strategy**: Regular backups before major schema changes.

## Future Enhancements

1. **Audit Logging**: Add comprehensive audit logging for compliance.
2. **Soft Deletes**: Implement soft deletes for data recovery.
3. **Full-text Search**: Add full-text search capabilities for internships.
4. **Data Archiving**: Implement archiving strategy for historical data.
