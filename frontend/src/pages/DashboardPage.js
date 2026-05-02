import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const STAT_COLORS = {
  total: '#6c74f5', completed: '#34d399', pending: '#fbbf24',
  inProgress: '#60a5fa', overdue: '#f87171', projects: '#a78bfa', users: '#fb923c'
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    <div className="stat-icon">{icon}</div>
  </div>
);

const getStatusBadge = (status) => {
  const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-inprogress', 'Completed': 'badge-completed' };
  return map[status] || '';
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dashboardAPI.getStats();
        setStats(data.stats);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const chartData = stats?.tasksByProject?.map(p => ({
    name: p.projectName?.length > 14 ? p.projectName.slice(0, 14) + '…' : p.projectName,
    Completed: p.completed, Pending: p.pending, 'In Progress': p.inProgress
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good to see you, {user?.name}! Here's your overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Tasks" value={stats?.totalTasks} icon="📋" color={STAT_COLORS.total} />
        <StatCard label="Completed" value={stats?.completedTasks} icon="✅" color={STAT_COLORS.completed} />
        <StatCard label="Pending" value={stats?.pendingTasks} icon="⏳" color={STAT_COLORS.pending} />
        <StatCard label="In Progress" value={stats?.inProgressTasks} icon="🔄" color={STAT_COLORS.inProgress} />
        <StatCard label="Overdue" value={stats?.overdueTasks} icon="🔴" color={STAT_COLORS.overdue} />
        <StatCard label="Projects" value={stats?.totalProjects} icon="📁" color={STAT_COLORS.projects} />
        {isAdmin && <StatCard label="Team Members" value={stats?.totalUsers} icon="👥" color={STAT_COLORS.users} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ gridColumn: chartData.length < 3 ? '1' : '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Tasks by Project</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="Completed" fill="#34d399" radius={[4,4,0,0]} />
                <Bar dataKey="Pending" fill="#fbbf24" radius={[4,4,0,0]} />
                <Bar dataKey="In Progress" fill="#60a5fa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Tasks</h3>
          </div>
          {stats?.recentTasks?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No tasks yet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentTasks?.map(task => {
                    const overdue = task.status !== 'Completed' && isPast(new Date(task.dueDate));
                    return (
                      <tr key={task._id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</td>
                        <td>{task.project?.name}</td>
                        <td>{task.assignedTo?.name}</td>
                        <td style={{ color: overdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          {overdue && ' ⚠'}
                        </td>
                        <td><span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
