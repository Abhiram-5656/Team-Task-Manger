import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const getStatusBadge = (status) => {
  const m = { 'Pending': 'badge-pending', 'In Progress': 'badge-inprogress', 'Completed': 'badge-completed' };
  return m[status] || '';
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getAll({ project: id })
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      load();
    } catch { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.update(taskId, { status });
      toast.success('Status updated');
      setTasks(t => t.map(task => task._id === taskId ? { ...task, status } : task));
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statusMap = { active: 'badge-active', completed: 'badge-completed', 'on-hold': 'badge-onhold' };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 10 }}>
            ← Back to Projects
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{project.name}</h1>
            <span className={`badge ${statusMap[project.status]}`}>{project.status}</span>
          </div>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
            + Add Task
          </button>
        )}
      </div>

      {/* Project Meta */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created by</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{project.createdBy?.name}</div>
          </div>
          {project.deadline && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{format(new Date(project.deadline), 'MMM d, yyyy')}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members ({project.members?.length})</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {project.members?.map(m => (
                <span key={m._id} style={{
                  fontSize: 12, padding: '3px 10px', background: 'var(--bg-elevated)',
                  borderRadius: 20, border: '1px solid var(--border)'
                }}>{m.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
          Tasks ({tasks.length})
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No tasks for this project yet.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => {
            const overdue = task.status !== 'Completed' && isPast(new Date(task.dueDate));
            return (
              <div key={task._id} className="task-card">
                <div className="task-card-header">
                  <div>
                    <div className="task-card-title">{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{task.description}</div>
                    )}
                  </div>
                  <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
                </div>
                <div className="task-card-meta">
                  <span>👤 {task.assignedTo?.name}</span>
                  <span style={{ color: overdue ? 'var(--danger)' : undefined }}>
                    📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}{overdue ? ' ⚠ Overdue' : ''}
                  </span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
                <div className="task-card-actions">
                  <select
                    className="filter-select"
                    value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px' }}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
