'use client';

import { useRouter } from 'next/navigation';
import { Code, Zap, Download, Terminal } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
            <h1 className="text-xl font-bold font-mono text-black">StackForge</h1>
          </div>
          <button 
            onClick={() => router.push('/auth')}
            className="bg-[#002FA7] text-white hover:bg-[#002480] rounded-sm px-6 py-2.5 font-medium"
          >
            Get Started
          </button>
        </div>
      </header>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 font-mono text-black text-black">
            Generate Full-Stack Projects<br />in Seconds
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            AI-powered boilerplate generator for students. Configure your stack, define your schema, and get a production-ready project instantly.
          </p>
          <button 
            onClick={() => router.push('/auth')}
            className="bg-[#002FA7] text-white hover:bg-[#002480] rounded-sm px-8 py-3.5 text-lg font-medium inline-flex items-center gap-2"
          >
            <Zap className="w-5 h-5" strokeWidth={1.5} />
            Start Building
          </button>
        </div>
      </section>

      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16 font-mono text-black">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold mb-3 font-mono text-black">1. Select Stack</h4>
              <p className="text-gray-600">Choose your frontend, backend, database, and authentication method.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold mb-3 font-mono text-black">2. Define Schema</h4>
              <p className="text-gray-600">Build your database schema visually with field names and types.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold mb-3 font-mono text-black">3. Download & Deploy</h4>
              <p className="text-gray-600">Get a complete project with authentication, CRUD APIs, and UI.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
