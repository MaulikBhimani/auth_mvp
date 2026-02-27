'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Terminal, Plus, Trash2, Clock, LogOut } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [config, setConfig] = useState({ frontend: 'Next.js 14', backend: 'Node.js + Express', database: 'PostgreSQL', auth: 'bcrypt + JWT' });
  const [fields, setFields] = useState([{ name: 'name', type: 'String', required: true }, { name: 'email', type: 'String', required: true }]);
  const [generating, setGenerating] = useState(false);

  const stackOptions = {
    frontend: ['Next.js 14', 'React + Vite', 'Vue 3 + Vite', 'Nuxt 3', 'SvelteKit', 'Astro', 'Angular 17'],
    backend: ['Node.js + Express', 'Node.js + Fastify', 'Python + FastAPI', 'Python + Django', 'Python + Flask', 'Go + Gin', 'Java + Spring Boot', 'Ruby on Rails', 'PHP + Laravel'],
    database: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'Neon', 'Firebase Firestore', 'PlanetScale', 'Redis'],
    auth: ['bcrypt + JWT', 'bcrypt + JWT + HTTP-only Cookie', 'bcrypt + JWT + Refresh Token', 'bcrypt + JWT + RBAC', 'bcrypt + JWT + Email Verify', 'bcrypt + JWT + Rate Limiting', 'bcrypt + JWT + 2FA (TOTP)', 'NextAuth + OAuth', 'NextAuth + Credentials', 'Clerk']
  };

  const fieldTypes = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object'];

  const handleGenerate = async () => {
    if (!projectName.trim()) return toast.error('Please enter a project name');
    if (fields.some(f => !f.name.trim())) return toast.error('Please define valid fields');

    setGenerating(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API}/projects/generate`, { projectName, config: { ...config, fields } }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Project generated!');
      setTimeout(() => router.push('/history'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const cliCommand = `npx murli ${projectName.toLowerCase().replace(/\s+/g, '-') || 'project-name'}`;

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 sticky top-0 z-30 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
            <h1 className="text-xl font-bold font-mono">StackForge</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/history')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />History
            </button>
            <button onClick={() => { localStorage.clear(); router.push('/auth'); }} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-4rem)] text-black">
        <aside className="col-span-3 border-r p-6 bg-gray-50 overflow-y-auto">
          <h2 className="text-lg font-bold mb-6 font-mono">Stack Configuration</h2>
          <div className="space-y-6">
            {Object.entries(stackOptions).map(([category, options]) => (
              <div key={category}>
                <label className="text-sm font-medium text-gray-700 mb-2 block capitalize">{category}</label>
                <div className="space-y-2">
                  {options.map(option => (
                    <button key={option} onClick={() => setConfig({...config, [category]: option})} className={`w-full text-left px-3 py-2 rounded-sm border ${config[category as keyof typeof config] === option ? 'border-[#002FA7] bg-blue-50 text-[#002FA7]' : 'border-gray-200 bg-white'}`}>
                      <span className="text-sm font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="col-span-6 p-6 overflow-y-auto text-black">
          <h2 className="text-lg font-bold mb-6 font-mono ">Schema Builder</h2>
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Project Name</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full border border-gray-300 rounded-sm h-10 px-3 outline-none" placeholder="my-awesome-project" />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Database Fields</label>
              <button onClick={() => setFields([...fields, { name: '', type: 'String', required: false }])} className="text-[#002FA7] text-sm font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />Add Field
              </button>
            </div>

            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-gray-50 border-b px-3 py-2">
                <div className="col-span-5 text-xs font-medium">Field Name</div>
                <div className="col-span-4 text-xs font-medium">Type</div>
                <div className="col-span-2 text-xs font-medium">Required</div>
                <div className="col-span-1"></div>
              </div>
              <div className="divide-y">
                {fields.map((field, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2">
                    <div className="col-span-5">
                      <input type="text" value={field.name} onChange={(e) => { const f = [...fields]; f[i].name = e.target.value; setFields(f); }} className="w-full border border-gray-300 rounded-sm h-8 px-2 text-sm outline-none" />
                    </div>
                    <div className="col-span-4">
                      <select value={field.type} onChange={(e) => { const f = [...fields]; f[i].type = e.target.value; setFields(f); }} className="w-full border border-gray-300 rounded-sm h-8 px-2 text-sm outline-none">
                        {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <input type="checkbox" checked={field.required} onChange={(e) => { const f = [...fields]; f[i].required = e.target.checked; setFields(f); }} className="w-4 h-4" />
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full bg-[#002FA7] text-white rounded-sm px-6 py-3 font-medium disabled:opacity-50 mt-6">
            {generating ? 'Generating...' : 'Generate Project'}
          </button>
        </main>

        <aside className="col-span-3 bg-[#0F172A] text-gray-300 p-6 font-mono text-sm overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">// CLI Command</div>
            <div className="text-[#22C55E]">$ {cliCommand}</div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-3">// Configuration</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-gray-500">frontend:</span> <span className="text-white">{config.frontend}</span></div>
              <div><span className="text-gray-500">backend:</span> <span className="text-white">{config.backend}</span></div>
              <div><span className="text-gray-500">database:</span> <span className="text-white">{config.database}</span></div>
              <div><span className="text-gray-500">auth:</span> <span className="text-white">{config.auth}</span></div>
              <div className="mt-3"><span className="text-gray-500">fields:</span> <span className="text-white">{fields.length}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
