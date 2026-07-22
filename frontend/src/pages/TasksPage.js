import React, { useCallback, useEffect, useState } from "react";
import { taskAPI, projectAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const getStatusBadge = (s) => ({ 'Pending': 'badge-pending', 'In Progress': 'badge-inprogress', 'Completed': 'badge-completed' }[s] || '');

function TaskModal({ task, projects, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '', description: task?.description || '',
    status: task?.status || 'Pending', priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    project: task?.project?._id || task?.project || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (!form.project) e.project = 'Project is required';
    if (!form.assignedTo) e.assignedTo = 'Assigned user is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (task) {
        await taskAPI.update(task._id, form);
        toast.success('Task updated');
      } else {
        await taskAPI.create(form);
        toast.success('Task created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" value={form.title} onChange={set('title')} placeholder="Task title" />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description} rows={3} onChange={set('description')} placeholder="Task description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={set('status')}>
                  <option>Pending</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input className="form-control" type="date" value={form.dueDate} onChange={set('dueDate')} />
              {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-control" value={form.project} onChange={set('project')}>
                <option value="">Select project…</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {errors.project && <span className="form-error">{errors.project}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Assign To *</label>
              <select className="form-control" value={form.assignedTo} onChange={set('assignedTo')}>
                <option value="">Select user…</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
              {errors.assignedTo && <span className="form-error">{errors.assignedTo}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '' });
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.project) params.project = filters.project;
      const [tRes, pRes, uRes] = await Promise.all([
        taskAPI.getAll(params),
        projectAPI.getAll(),
        isAdmin ? userAPI.getAll() : Promise.resolve({ data: { users: [] } })
      ]);
      setTasks(tRes.data.tasks);
      setProjects(pRes.data.projects);
      setUsers(uRes.data.users || []);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); toast.success('Task deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.update(taskId, { status });
      setTasks(t => t.map(task => task._id === taskId ? { ...task, status } : task));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Task</button>}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}>
          <option value="">All Statuses</option>
          <option>Pending</option><option>In Progress</option><option>Completed</option>
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))}>
          <option value="">All Priorities</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select className="filter-select" value={filters.project} onChange={e => setFilters(f => ({...f, project: e.target.value}))}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-text">No tasks found.</div>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const overdue = task.status !== 'Completed' && isPast(new Date(task.dueDate));
            return (
              <div key={task._id} className="task-card">
                <div className="task-card-header">
                  <div>
                    <div className="task-card-title">{task.title}</div>
                    {task.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{task.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
                  </div>
                </div>
                <div className="task-card-meta">
                  <span>📁 {task.project?.name}</span>
                  <span>👤 {task.assignedTo?.name}</span>
                  <span style={{ color: overdue ? 'var(--danger)' : undefined }}>
                    📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}{overdue ? ' ⚠' : ''}
                  </span>
                </div>
                <div className="task-card-actions">
                  <select className="filter-select" value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px' }}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                  {isAdmin && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(task)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          projects={projects}
          users={users}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
