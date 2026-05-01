# ARU IMS Database Schema

This document outlines the current database structure for the ARU Web-Based Internship Management System.

## Overview

The database has been completely cleaned and now contains only the core tables necessary for the internship management system. All actor-specific data and tables have been removed.

## Core Tables

### 1. Users Table

The `users` table stores user authentication and profile information.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Relationships:**
- One-to-many with `internships`
- One-to-many with `applications`
- One-to-many with `reports`
- One-to-many with `evaluations`

### 2. Internships Table

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
    status ENUM('draft', 'active', 'closed', 'cancelled') DEFAULT 'draft',
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Many-to-one with `users` (creator)
- One-to-many with `applications`

### 3. Applications Table

The `applications` table tracks internship applications submitted by users.

```sql
CREATE TABLE applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'under_review', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    cover_letter TEXT NULL,
    resume_path VARCHAR(255) NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Many-to-one with `internships`
- Many-to-one with `users` (applicant)
- Many-to-one with `users` (reviewer)

### 4. Reports Table

The `reports` table stores progress reports submitted by users.

```sql
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    internship_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    week_number INT NOT NULL,
    status ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    feedback TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Many-to-one with `users` (author)
- Many-to-one with `internships`
- Many-to-one with `users` (reviewer)

### 5. Evaluations Table

The `evaluations` table stores performance evaluations for internships.

```sql
CREATE TABLE evaluations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    internship_id BIGINT UNSIGNED NOT NULL,
    evaluator_id BIGINT UNSIGNED NOT NULL,
    performance_score DECIMAL(5,2) NULL,
    technical_skills_score DECIMAL(5,2) NULL,
    communication_score DECIMAL(5,2) NULL,
    teamwork_score DECIMAL(5,2) NULL,
    overall_score DECIMAL(5,2) NULL,
    comments TEXT NULL,
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Relationships:**
- Many-to-one with `users` (evaluatee)
- Many-to-one with `internships`
- Many-to-one with `users` (evaluator)
- Many-to-one with `users` (approver)

## Database Indexes

### Primary Indexes
- All tables have primary key indexes on `id` columns

### Foreign Key Indexes
- All foreign key columns are automatically indexed by MySQL

### Additional Indexes
```sql
-- Users table
CREATE UNIQUE INDEX users_email_unique ON users(email);

-- Internships table
CREATE INDEX internships_status ON internships(status);
CREATE INDEX internships_created_by ON internships(created_by);

-- Applications table
CREATE INDEX applications_status ON applications(status);
CREATE INDEX applications_internship_id ON applications(internship_id);
CREATE INDEX applications_user_id ON applications(user_id);

-- Reports table
CREATE INDEX reports_status ON reports(status);
CREATE INDEX reports_user_id ON reports(user_id);
CREATE INDEX reports_internship_id ON reports(internship_id);

-- Evaluations table
CREATE INDEX evaluations_status ON evaluations(status);
CREATE INDEX evaluations_user_id ON evaluations(user_id);
CREATE INDEX evaluations_internship_id ON evaluations(internship_id);
```

## Data Integrity

### Constraints
- All foreign key relationships are properly enforced
- Email addresses must be unique
- Enum values are restricted to valid options
- Date fields are properly validated

### Cascading Rules
- Deleting an internship cascades to delete related applications, reports, and evaluations
- Deleting a user preserves their created internships but removes their applications, reports, and evaluations

## Migration History

The database has been cleaned and reset with the following key migrations:

1. **Core Tables Creation** - Basic tables for users, internships, applications, reports, and evaluations
2. **Data Cleanup Migration** - Removed all actor-specific data and tables
3. **Schema Optimization** - Optimized indexes and constraints for performance

## Current Status

### ✅ Clean Database
- No actor-specific tables or data
- Clean user management system
- Simplified role structure
- Optimized for new development

### ✅ Ready for Development
- Core functionality preserved
- Scalable schema design
- Proper relationships and constraints
- Comprehensive indexing

### 📊 Statistics
- Users: 0 (clean slate)
- Internships: 0 (clean slate)
- Applications: 0 (clean slate)
- Reports: 0 (clean slate)
- Evaluations: 0 (clean slate)

## Future Considerations

### Potential Enhancements
- Add user roles table for flexible permission management
- Implement soft deletes for data preservation
- Add audit logging for compliance
- Consider multi-tenant architecture

### Performance Optimizations
- Add composite indexes for complex queries
- Implement database partitioning for large datasets
- Consider read replicas for reporting queries

## Security Notes

- All passwords are hashed using Laravel's default bcrypt
- Sensitive data should be encrypted at the application level
- Regular database backups are recommended
- Access should be limited through proper user permissions
