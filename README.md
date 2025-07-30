# Smart Campus Hub

A comprehensive university management platform that streamlines campus life through integrated features for students, teachers, and administrators.

## 🚀 Features

### Core Features
- **Student/Teacher Portals** - Role-based dashboards with personalized content
- **Course Management** - Create, manage, and enroll in courses
- **Assignment Submission System** - Digital assignment handling with file uploads and grading
- **Event Calendar** - Campus-wide event management and registration
- **Campus Marketplace** - Buy/sell platform for students and staff
- **Lost & Found** - Report and claim lost items with image support
- **Complaint System** - Submit and track campus-related complaints

### User Roles
- **Students**: Course enrollment, assignment submission, event registration, marketplace participation
- **Teachers**: Course creation, assignment management, grading, event organization
- **Administrators**: User management, system oversight, complaint handling, analytics

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **Socket.io** for real-time features
- **Express Validator** for input validation

### Frontend
- **React** with functional components and hooks
- **React Router** for navigation
- **React Query** for state management and API calls
- **React Hook Form** for form handling
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-campus-hub
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost/smart-campus-hub
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. **Create upload directories**
```bash
mkdir -p uploads/assignments uploads/marketplace uploads/lostfound uploads/complaints
```

### Frontend Setup

1. **Install frontend dependencies**
```bash
cd client
npm install
```

2. **Start the development servers**

Backend (from root directory):
```bash
npm run dev
```

Frontend (from client directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Usage

### Initial Setup

1. **Create an Admin Account**
   - Navigate to `/register`
   - Select "Admin" role
   - Complete registration

2. **Create Test Users**
   - Create student accounts with different departments
   - Create teacher accounts for course management

### Key Workflows

#### For Students:
1. **Course Enrollment**
   - Browse available courses
   - Enroll in desired courses
   - View course materials and schedule

2. **Assignment Submission**
   - View assigned tasks
   - Upload assignment files
   - Track submission status and grades

3. **Event Participation**
   - Browse campus events
   - Register for events
   - Receive reminders

#### For Teachers:
1. **Course Management**
   - Create new courses
   - Add course materials
   - Manage student enrollment

2. **Assignment Handling**
   - Create assignments with due dates
   - Review submissions
   - Provide grades and feedback

3. **Event Organization**
   - Schedule campus events
   - Manage registrations
   - Track attendance

#### For Administrators:
1. **User Management**
   - View all users
   - Manage user roles and permissions
   - Monitor system activity

2. **Complaint Handling**
   - Review submitted complaints
   - Assign to appropriate staff
   - Track resolution progress

3. **System Oversight**
   - Monitor platform usage
   - Generate reports
   - Manage system settings

## 📁 Project Structure

```
smart-campus-hub/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── models/                # MongoDB schemas
├── routes/                # Express routes
├── middleware/            # Custom middleware
├── uploads/               # File storage
├── server.js             # Express server
├── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Different permissions for each user type
- **Input Validation** - Server-side validation using Express Validator
- **File Upload Security** - File type and size restrictions
- **CORS Protection** - Cross-origin request security

## 🚀 Deployment

### Production Build

1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Set production environment variables**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-cloud-db
JWT_SECRET=your-production-secret
```

3. **Start the production server**
```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost/smart-campus-hub |
| `JWT_SECRET` | JWT signing secret | (required) |
| `EMAIL_USER` | SMTP email username | (optional) |
| `EMAIL_PASS` | SMTP email password | (optional) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@smartcampushub.com or create an issue in the repository.

## 🔄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Course Endpoints
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (teacher/admin)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course (student)

### Assignment Endpoints
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment (teacher)
- `POST /api/assignments/:id/submit` - Submit assignment (student)

### Event Endpoints
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event

### Marketplace Endpoints
- `GET /api/marketplace` - List items
- `POST /api/marketplace` - Create listing
- `POST /api/marketplace/:id/interest` - Express interest

### Lost & Found Endpoints
- `GET /api/lostfound` - List items
- `POST /api/lostfound` - Report item
- `POST /api/lostfound/:id/claim` - Claim item

### Complaint Endpoints
- `GET /api/complaints` - List complaints (admin/teacher)
- `POST /api/complaints` - Submit complaint
- `PUT /api/complaints/:id` - Update complaint status (admin)

---

**Smart Campus Hub** - Making campus life smarter, one feature at a time! 🎓