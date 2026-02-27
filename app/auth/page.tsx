'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Terminal } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API}/auth/login` : `${API}/auth/signup`;
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const response = await axios.post(endpoint, payload);
      
      localStorage.setItem('auth_token', response.data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Terminal className="w-8 h-8 text-[#002FA7]" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold font-mono text-black">StackForge</h1>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 font-mono text-black">{isLogin ? 'Login' : 'Sign Up'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-black mb-1.5 block">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-300 rounded-sm h-10 px-3 outline-none text-black" required={!isLogin} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-black mb-1.5 block">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded-sm h-10 px-3 outline-none text-black" required />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1.5 block">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-gray-300 rounded-sm h-10 px-3 outline-none text-black" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#002FA7] text-white hover:bg-[#002480] rounded-sm px-6 py-2.5 font-medium disabled:opacity-50 ">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#002FA7] text-sm font-medium">
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
