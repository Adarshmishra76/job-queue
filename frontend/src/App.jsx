
import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const STATUSES = ['pending', 'running', 'completed', 'failed'];
const TYPES = ['email', 'report', 'sync', 'cleanup'];

const badgeClasses = {
  pending: 'bg-amber-100 text-amber-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    try {
      setJobs(await api.list());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      await api.create({ title: title.trim(), type });
      setTitle('');
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onStatus(job, status) {
    try {
      await api.updateStatus(job.id, status);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onDelete(job) {
    try {
      await api.remove(job.id);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(
    () => (filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)),
    [jobs, filter]
  );

  const counts = useMemo(() => {
    const c = { all: jobs.length };
    for (const s of STATUSES) c[s] = jobs.filter((j) => j.status === s).length;
    return c;
  }, [jobs]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* HEADER */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-semibold">Job Queue Dashboard</h1>
          </div>
          <button
      onClick={() => alert('Sign in coming soon')}
      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
    >
      Sign In
    </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={onCreate}
            className="flex gap-2 mb-6 bg-white p-3 rounded-lg shadow-sm"
          >
            <input
              placeholder="Job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </form>

          {error && (
            <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 text-xl leading-none"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm border ${
                filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({counts.all})
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm border capitalize ${
                  filter === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No jobs
                      </td>
                    </tr>
                  )}
                  {filtered.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{job.title}</td>
                      <td className="px-4 py-3 text-gray-600">{job.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs capitalize ${badgeClasses[job.status]}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <select
                            value={job.status}
                            onChange={(e) => onStatus(job, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => onDelete(job)}
                            disabled={job.status === 'running'}
                            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Job Queue Dashboard</span>
        </div>
      </footer>
    </div>
  );
}