'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Terminal, Download, ArrowLeft, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export default function History() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API}/projects/history`, { headers: { Authorization: `Bearer ${token}` } });
        setProjects(response.data.projects);
      } catch (error) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleDownload = async (projectId: string, projectName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API}/projects/${projectId}/zip`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#002FA7]" />
            <h1 className="text-xl font-bold font-mono">StackForge</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 text-black" >
        <h2 className="text-3xl font-bold mb-8 font-mono">Project History</h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 text-[#002FA7] animate-spin mx-auto" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-sm">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No projects yet</p>
            <button onClick={() => router.push('/dashboard')} className="bg-[#002FA7] text-white rounded-sm px-6 py-2.5 font-medium">
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-sm overflow-hidden text-black">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase font-mono">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase font-mono">Stack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase font-mono">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase font-mono">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase font-mono">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((project: any) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{project.project_name}</div>
                      <div className="text-sm text-gray-500 font-mono">{project.cli_command}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{project.config.frontend} • {project.config.backend}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className="text-sm capitalize">{project.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(project.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {project.status === 'completed' && (
                        <button onClick={() => handleDownload(project.id, project.project_name)} className="text-[#002FA7] text-sm font-medium flex items-center gap-1">
                          <Download className="w-4 h-4" />Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
