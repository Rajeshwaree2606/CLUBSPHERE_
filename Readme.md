# Campus Club Management Suite (ClubSphere)

> A centralized, secure, and scalable platform to streamline campus club operations, event management, and student engagement.

---

## Overview

Campus Club Management Suite (ClubSphere) is a full-stack application designed to replace fragmented tools like WhatsApp, spreadsheets, and manual records with a unified digital platform.

It enables seamless management of:
- Clubs 
- Events 
- Attendance 
- Announcements 
- Budgets 

---

## Features

### Authentication & Security
- JWT-based authentication
  - Secure login system
  - Token-based session handling
- Password hashing using bcrypt
- Role-Based Access Control (RBAC)
  - Super Admin
  - Club Admin
  - Member
  - Alumni

---

### Club Management
- Create and manage clubs
- Add/remove members
- Assign club admins
- View club member list

---

### Event Management
- Create events
- Edit and delete events
- RSVP system for members
- Event visibility control

---

### Attendance Tracking
- Admin marks attendance
- Real-time attendance storage
- Members can view attendance history

---

### Announcements & Notifications
- Admin posts announcements
- Notifications sent to members
- Firebase push notifications (if enabled)
- Notification history tracking

---

### Dashboard (Role-Based)
- Admin Dashboard
  - Member count
  - Event management
  - Attendance summary
- Member Dashboard
  - Joined clubs
  - Upcoming events
  - Notifications

---

## Problem It Solves

Most colleges rely on:
- WhatsApp groups ❌
- Excel sheets ❌
- Manual attendance ❌

This leads to:
- Data inconsistency
- Poor communication
- Lack of transparency
- Inefficient workflows

👉 ClubSphere solves this using a centralized, structured, and scalable system.

---

## Tech Stack

### Frontend
- React Native
- React Navigation
- Axios

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL (Primary relational database)
- MongoDB (Notifications & logs)

### Security
- JWT Authentication
- Bcrypt
- Role-Based Access Control (RBAC)

### Tools
- Postman
- Git & GitHub
- VS Code

---

## System Workflow

1. User registers or logs in
2. JWT token is generated
3. Role is assigned (Admin/Member/etc.)
4. Admin creates clubs/events
5. Members receive notifications
6. Attendance is recorded
7. Data is stored in database

---

## Database Design

Main Tables:
- Users
- Clubs
- ClubMembers (Many-to-Many)
- Events
- Attendance
- Announcements
- Notifications
- Budgets
- Certificates

---

## Advantages

- Centralized system (no scattered tools)
- Secure authentication & RBAC
- Real-time updates and notifications
- Scalable backend architecture
- Improved student engagement
- Transparent attendance & budgeting

---

## Future Enhancements

- QR-based attendance system
- Event analytics dashboard
- Automatic certificate generation
- Budget analytics visualization
- Dark mode support
- Advanced search & filters

---

## Testing & Validation

- API testing using Postman
- Role-based access verification
- End-to-end workflow testing
- Performance optimization (< 2s response time)

---

## Installation & Setup

### Clone Repository
```bash
git clone https://github.com/your-username/CLUBSPHERE.git
cd CLUBSPHERE
