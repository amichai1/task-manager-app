import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
            <div className={`flex-shrink-0 ${color}`}>
                <div className="w-8 h-8">
                    {icon}
                </div>
            </div>
            <div className="ml-5 w-0 flex-1">
                <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {title}
                    </dt>
                    <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                            {value}
                        </div>
                        {subtitle && (
                            <div className="ml-2 text-sm text-gray-500">
                                {subtitle}
                            </div>
                        )}
                    </dd>
                </dl>
            </div>
        </div>
    </div>
);

const QuickActions = ({ onNewTask }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={onNewTask}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Task
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
            </button>
        </div>
    </div>
);

const RecentActivity = ({ tasks }) => {
    const recentTasks = tasks
        .filter(task => {
            const taskDate = new Date(task.updatedAt || task.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - taskDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        })
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
                <div className="space-y-3">
                    {recentTasks.map(task => (
                        <div key={task._id} className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                                task.completed ? 'bg-green-400' : 
                                task.priority === 'high' ? 'bg-red-400' :
                                task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                    {task.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {task.completed ? 'Completed' : 'Updated'} {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { tasks, stats, fetchStats } = useTasks();
    const [showTaskForm, setShowTaskForm] = useState(false);

    React.useEffect(() => {
        fetchStats();
    }, [tasks]);

    const upcomingTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    const overdueTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < new Date()
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                                <span>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!</span>
                            </div>
                            
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Tasks"
                        value={stats?.total || 0}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                        color="text-blue-600"
                    />
                    
                    <StatCard
                        title="Completed"
                        value={stats?.completed || 0}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="text-green-600"
                        subtitle={stats?.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                    />
                    
                    <StatCard
                        title="Pending"
                        value={stats?.pending || 0}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="text-yellow-600"
                    />
                    
                    <StatCard
                        title="High Priority"
                        value={stats?.high || 0}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                        color="text-red-600"
                    />
                </div>

                {/* Quick Stats */}
                {(upcomingTasks > 0 || overdueTasks > 0) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Quick Overview</h3>
                                <div className="mt-2 flex space-x-6">
                                    {upcomingTasks > 0 && (
                                        <div className="flex items-center text-sm text-blue-700">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {upcomingTasks} upcoming tasks
                                        </div>
                                    )}
                                    {overdueTasks > 0 && (
                                        <div className="flex items-center text-sm text-red-700">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {overdueTasks} overdue tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Tasks Section */}
                    <div className="lg:col-span-3">
                        <TaskForm />
                        <TaskList />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <QuickActions onNewTask={() => setShowTaskForm(true)} />
                        <RecentActivity tasks={tasks} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;