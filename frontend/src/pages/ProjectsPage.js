import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_LABELS = { active: 'Active', completed: 'Completed', 'on-hold': 'On Hold' };

function ProjectModal({ project, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    deadline: project?.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : '',
    members: project?.members?.map(m => m._id || m) || []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (project) {
        await projectAPI.update(project._id, form);
        toast.success('Project updated');
      } else {
        await projectAPI.create(form);
        toast.success('Project created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id]
    }));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-control" value={form.name}
                onChange={e => { setForm(f => ({...f, name: e.target.value})); setErrors(er => ({...er, name: ''})); }}
                placeholder="Enter project name" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description} rows={3}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Brief project description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status}
                  onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-control" type="date" value={form.deadline}
                  onChange={e => setForm(f => ({...f, deadline: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Members</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {users.map(u => (
                  <label key={u._id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    background: form.members.includes(u._id) ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13
                  }}>
                    <input type="checkbox" checked={form.members.includes(u._id)}
                      onChange={() => toggleMember(u._id)} />
                    <span>{u.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.email}</span>
                    <span className={`badge badge-${u.role}`} style={{ marginLeft: 'auto', fontSize: 10 }}>{u.role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | project object

  const load = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        projectAPI.getAll(),
        isAdmin ? userAPI.getAll() : Promise.resolve({ data: { users: [] } })
      ]);
      setProjects(pRes.data.projects);
      setUsers(uRes.data.users || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-text">{isAdmin ? 'No projects yet. Create your first project!' : 'You have not been added to any projects yet.'}</div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => {
            const statusMap = { active: 'badge-active', completed: 'badge-completed', 'on-hold': 'badge-onhold' };
            return (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="project-card-name">{p.name}</div>
                  <span className={`badge ${statusMap[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                </div>
                <div className="project-card-desc">{p.description || 'No description'}</div>
                <div className="project-card-meta">
                  <div className="members-avatars">
                    {p.members?.slice(0, 4).map(m => (
                      <div key={m._id} className="member-avatar" title={m.name}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                    {p.members?.length > 4 && (
                      <div className="member-avatar">+{p.members.length - 4}</div>
                    )}
                  </div>
                  <span>{p.members?.length || 0} members</span>
                  {p.deadline && <span>📅 {format(new Date(p.deadline), 'MMM d')}</span>}
                </div>
                {isAdmin && (
                  <div className="project-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(p._id, e)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          users={users}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
