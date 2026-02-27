# StackForge - AI-Powered Project Generator

> Generate full-stack project boilerplates instantly with AI

## 🎯 What is StackForge?

StackForge is an AI-powered web platform designed for students that automatically generates ready-to-use full-stack project boilerplates. Simply configure your tech stack, define your database schema, and let AI create a complete, working project for you.

## ✨ Features

- **3-Panel Configurator Dashboard**
  - Left: Stack selector (React/Next.js, Node+Express/FastAPI, MongoDB/PostgreSQL, JWT/OAuth)
  - Middle: Dynamic database field builder
  - Right: Real-time CLI command preview

- **AI-Powered Generation** using Google Gemini API
- **JWT Authentication** for platform users
- **Download ZIP** functionality
- **Project History** tracking
- **Simple, Clean UI** with table/form layouts

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB running locally

### Installation

1. **Install Backend Dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure Environment:**
Create `.env` file in `app/frontend/`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=stackforge_db
GEMINI_API_KEY=AIzaSyAxUPh7pWUITS2eMLp9VQhAYI45F1DlX9M
JWT_SECRET=your_secret_key
CORS_ORIGINS=*
```

3. **Start Backend:**
```bash
cd app/frontend
python -m uvicorn server:app --reload --port 8000
```

4. **Start Frontend:**
Configure and start your React application

## 📖 Usage

1. **Sign Up** - Create your account
2. **Configure Stack** - Select your preferred technologies
3. **Define Schema** - Add custom database fields
4. **Generate** - Let AI create your project (10-30 seconds)
5. **Download** - Get your complete project as ZIP

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI:** Google Gemini API
- **Auth:** JWT

## 📚 Documentation

- [Setup Guide](SETUP.md) - Detailed installation instructions
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Production deployment guide

## 🎨 Design Philosophy

- **Swiss Minimalist** design approach
- **JetBrains Mono** font for code aesthetics
- **International Klein Blue** (#002FA7) as primary color
- **Simple, functional** table/form layouts
- **No fancy gradients** - focus on usability

## 🔑 Stack Options

Users can generate projects with:
- **Frontend:** React, Next.js
- **Backend:** Node.js + Express, Python + FastAPI, MERN, MEAN
- **Database:** MongoDB, PostgreSQL, Supabase, Neon
- **Auth:** JWT, bcrypt, OAuth

## 📝 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/projects/generate` - Generate project
- `GET /api/projects/history` - Get project history
- `GET /api/projects/{id}/zip` - Download project ZIP

## 🧪 Testing

Test Gemini API integration:
```bash
python test_gemini.py
```

## 🚀 Deployment

- **Frontend:** Vercel
- **Backend:** Railway/Render
- **Database:** MongoDB Atlas

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for details.

## 📄 License

MIT License - feel free to use for learning and projects!

## 🤝 Contributing

This is a student project. Feel free to fork and improve!

---

**Built with ❤️ for students learning full-stack development**
