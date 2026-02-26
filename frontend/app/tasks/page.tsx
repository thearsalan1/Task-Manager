'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiResponse } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface EditForm {
  title: string;
  description: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  'todo': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'done': 'bg-green-500/20 text-green-300 border border-green-500/30',
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo' });
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', status: 'todo' });
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async (pageParam = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('limit', '5');
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await apiResponse(`/task?${params.toString()}`);
      setTasks(res.data);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err: any) {
      if (err.message === 'Not authenticated' || err.message.includes('token')) {
        router.push('/login');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, router]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    try {
      setError('');
      setCreating(true);
      await apiResponse('/task', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ title: '', description: '', status: 'todo' });
      fetchTasks(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setError('');
      await apiResponse(`/task/${id}`, { method: 'DELETE' });
      const newPage = tasks.length === 1 && page > 1 ? page - 1 : page;
      fetchTasks(newPage);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({ title: task.title, description: task.description, status: task.status });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', status: 'todo' });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setError('Title and description are required');
      return;
    }
    try {
      setError('');
      setSaving(true);
      await apiResponse(`/task/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchTasks(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition hover:bg-white/15';

  const selectClass = 'bg-blue-950 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition hover:bg-blue-900';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-blue-900 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Your Tasks</h1>
          <button
            onClick={() => { apiResponse('/auth/logout', { method: 'POST' }).finally(() => router.push('/login')); }}
            className="text-sm text-blue-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            {/* ✅ bg and text on every option so they're visible in the dropdown */}
            <option value="" className="bg-blue-950 text-white">All Statuses</option>
            <option value="todo" className="bg-blue-950 text-white">Todo</option>
            <option value="in-progress" className="bg-blue-950 text-white">In Progress</option>
            <option value="done" className="bg-blue-950 text-white">Done</option>
          </select>
          <input
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} flex-1 min-w-[150px]`}
          />
          <button
            onClick={() => fetchTasks(1)}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200"
          >
            Apply
          </button>
        </div>

        {/* Create Task Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-white font-semibold mb-4">New Task</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <div className="flex gap-3 items-center">
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                <option value="todo" className="bg-blue-950 text-white">Todo</option>
                <option value="in-progress" className="bg-blue-950 text-white">In Progress</option>
                <option value="done" className="bg-blue-950 text-white">Done</option>
              </select>
              <button
                type="submit"
                disabled={creating}
                className="ml-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-blue-200 text-center py-8">Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-blue-200/60 text-center py-8">No tasks found.</p>
          ) : (
            tasks.map(t => (
              <div
                key={t.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl transition hover:bg-white/15"
              >
                {editingId === t.id ? (
                  <div className="space-y-3">
                    <input
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      className={inputClass}
                      placeholder="Title"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Description"
                    />
                    <div className="flex items-center gap-3">
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className={selectClass}
                      >
                        <option value="todo" className="bg-blue-950 text-white">Todo</option>
                        <option value="in-progress" className="bg-blue-950 text-white">In Progress</option>
                        <option value="done" className="bg-blue-950 text-white">Done</option>
                      </select>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(t.id)}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <strong className="text-white font-semibold">{t.title}</strong>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] ?? 'bg-white/10 text-white/60'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-blue-200/70 text-sm">{t.description}</p>
                      <p className="text-white/30 text-xs mt-2">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && tasks.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => fetchTasks(page - 1)}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg border border-white/20 transition"
            >
              Prev
            </button>
            <span className="text-blue-200 text-sm">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchTasks(page + 1)}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg border border-white/20 transition"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}