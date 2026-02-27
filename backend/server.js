import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import archiver from 'archiver';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'stackforge_secret';

// Auth Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ detail: 'No token provided' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user_id;
    next();
  } catch (error) {
    res.status(401).json({ detail: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ detail: 'Email already registered' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash }
    });
    
    const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, created_at: user.createdAt } });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, created_at: user.createdAt } });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// AI Generation
async function generateProjectCode(config, projectName) {
  const fieldsDescription = config.fields.map(f => 
    `- ${f.name}: ${f.type} (${f.required ? 'required' : 'optional'})`
  ).join('\n');
  
  const prompt = `Generate a COMPLETE production-ready full-stack project with ALL necessary files:

Project: ${projectName}
Frontend: ${config.frontend}
Backend: ${config.backend}
Database: ${config.database}
Auth: ${config.auth}

Database Schema:
${fieldsDescription}

Generate COMPLETE working code including:
1. Backend: server file, auth routes, CRUD API, database models/schema, middleware
2. Frontend: pages (login, signup, dashboard, data table), components, API calls
3. Config: package.json, .env.example, database setup
4. README: setup instructions with npm install && npm run dev

IMPORTANT:
- Generate 15-25 files minimum
- Include complete working auth system (${config.auth})
- Include complete CRUD for all fields
- Include frontend UI with forms and tables
- Make it production-ready and runnable
- User should only: extract ZIP → npm install → npm run dev

Return ONLY valid JSON (no markdown):
{
  "files": [
    {"path": "backend/server.js", "content": "complete server code"},
    {"path": "backend/routes/auth.js", "content": "auth routes"},
    {"path": "backend/models/User.js", "content": "user model"},
    {"path": "frontend/pages/login.jsx", "content": "login page"},
    {"path": "frontend/pages/dashboard.jsx", "content": "dashboard"},
    {"path": "package.json", "content": "dependencies"},
    {"path": ".env.example", "content": "env vars"},
    {"path": "README.md", "content": "setup guide"}
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    
    const parsed = JSON.parse(text.trim());
    
    // Ensure minimum files if AI generates too few
    if (parsed.files.length < 10) {
      return generateFallbackProject(config, projectName);
    }
    
    return parsed;
  } catch (error) {
    console.error('AI generation failed:', error);
    return generateFallbackProject(config, projectName);
  }
}

// Fallback: Generate basic but complete project structure
function generateFallbackProject(config, projectName) {
  const isNextJS = config.frontend.includes('Next.js');
  const isExpress = config.backend.includes('Express');
  const isPostgres = config.database.includes('PostgreSQL') || config.database.includes('Supabase');
  const isMongo = config.database.includes('MongoDB');
  
  const files = [];
  
  // Backend Server
  if (isExpress) {
    files.push({
      path: 'backend/server.js',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`
    });
    
    files.push({
      path: 'backend/routes/auth.js',
      content: `import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash: hashedPassword } });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user });
});

export default router;`
    });
    
    files.push({
      path: 'backend/routes/data.js',
      content: `import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const data = await prisma.data.findMany({ where: { userId: req.userId } });
  res.json(data);
});

router.post('/', authenticate, async (req, res) => {
  const data = await prisma.data.create({ data: { ...req.body, userId: req.userId } });
  res.json(data);
});

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.data.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;`
    });
    
    files.push({
      path: 'backend/middleware/auth.js',
      content: `import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};`
    });
  }
  
  // Prisma Schema
  if (isPostgres) {
    const fieldSchema = config.fields.map(f => {
      const type = f.type === 'String' ? 'String' : f.type === 'Number' ? 'Int' : 'String';
      return `  ${f.name}  ${type}${f.required ? '' : '?'}`;
    }).join('\n');
    
    files.push({
      path: 'backend/prisma/schema.prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  data         Data[]
}

model Data {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
${fieldSchema}
  createdAt DateTime @default(now())
}`
    });
  }
  
  // Frontend - Next.js
  if (isNextJS) {
    files.push({
      path: 'app/login/page.tsx',
      content: `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}`
    });
    
    files.push({
      path: 'app/dashboard/page.tsx',
      content: `'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({${config.fields.map(f => `${f.name}: ''`).join(', ')}});
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/data', { headers: { Authorization: \`Bearer \${token}\` } });
    setData(res.data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/data', formData, { headers: { Authorization: \`Bearer \${token}\` } });
    loadData();
    setFormData({${config.fields.map(f => `${f.name}: ''`).join(', ')}});
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
        ${config.fields.map(f => `<input type="text" placeholder="${f.name}" value={formData.${f.name}} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})} className="border p-2 mr-2" ${f.required ? 'required' : ''} />`).join('\n        ')}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            ${config.fields.map(f => `<th className="p-3 text-left">${f.name}</th>`).join('\n            ')}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              ${config.fields.map(f => `<td className="p-3">{item.${f.name}}</td>`).join('\n              ')}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`
    });
  }
  
  // Package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: isNextJS ? 'next dev' : 'nodemon backend/server.js',
        'dev:backend': 'nodemon backend/server.js',
        'dev:frontend': 'next dev',
        build: 'next build',
        start: 'next start',
        prisma: 'prisma generate && prisma migrate dev'
      },
      dependencies: {
        ...(isNextJS ? { next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0' } : {}),
        ...(isExpress ? { express: '^4.18.2', cors: '^2.8.5' } : {}),
        axios: '^1.6.0',
        bcryptjs: '^2.4.3',
        jsonwebtoken: '^9.0.2',
        dotenv: '^16.3.1',
        '@prisma/client': '^5.7.0',
        prisma: '^5.7.0'
      },
      devDependencies: {
        nodemon: '^3.0.2',
        ...(isNextJS ? { typescript: '^5.0.0', '@types/react': '^18.2.0', '@types/node': '^20.0.0' } : {})
      }
    }, null, 2)
  });
  
  // .env.example
  files.push({
    path: '.env.example',
    content: `DATABASE_URL="postgresql://user:password@localhost:5432/${projectName.toLowerCase()}"
JWT_SECRET=your_secret_key_here
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000`
  });
  
  // README
  files.push({
    path: 'README.md',
    content: `# ${projectName}

Generated with StackForge

## Stack
- Frontend: ${config.frontend}
- Backend: ${config.backend}
- Database: ${config.database}
- Auth: ${config.auth}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start development
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
\`\`\`

## Environment
Copy \`.env.example\` to \`.env\` and update values.

## Features
- ✅ Authentication (${config.auth})
- ✅ CRUD Operations
- ✅ Database: ${config.database}
- ✅ Production Ready
`
  });
  
  return { files };
}

// Project Routes
app.post('/api/projects/generate', authenticate, async (req, res) => {
  try {
    const { projectName, config } = req.body;
    const cliCommand = `npx murli ${projectName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const project = await prisma.project.create({
      data: {
        userId: req.userId,
        projectName,
        config,
        cliCommand,
        status: 'generating'
      }
    });
    
    const generatedData = await generateProjectCode(config, projectName);
    
    await prisma.project.update({
      where: { id: project.id },
      data: { generatedCode: JSON.stringify(generatedData), status: 'completed' }
    });
    
    res.json({ project_id: project.id, cli_command: cliCommand, status: 'completed', message: 'Project generated' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

app.get('/api/projects/history', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, projectName: true, config: true, status: true, cliCommand: true, createdAt: true }
    });
    
    res.json({ projects: projects.map(p => ({ ...p, project_name: p.projectName, cli_command: p.cliCommand, created_at: p.createdAt })) });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

app.get('/api/projects/:id/zip', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    
    if (!project || !project.generatedCode) {
      return res.status(404).json({ detail: 'Project not found' });
    }
    
    const data = JSON.parse(project.generatedCode);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${project.projectName}.zip`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    
    data.files.forEach(file => {
      archive.append(file.content, { name: file.path });
    });
    
    archive.finalize();
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
