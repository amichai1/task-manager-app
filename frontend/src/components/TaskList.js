import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskForm from './TaskForm';
import '../services/api.js';

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const priorityConfig = {
        low: { color: 'bg-green-100 text-green-800', icon: '●' },
        medium: { color: 'bg-yellow-100 text-yellow-800', icon: '●' },
        high: { color: 'bg-red-100 text-red-800', icon: '●' }
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    if (isEditing) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <TaskForm 
                    task={task} 
                    onClose={() => setIsEditing(false)} 
                />
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${task.completed ? 'opacity-75' : ''}`}>
            <div className="flex items-start space-x-3">
                <button
                    onClick={() => onToggleComplete(task._id, !task.completed)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                    }`}
                >
                    {task.completed && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className={`text-sm font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className={`mt-1 text-sm text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                                    {task.description}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].color}`}>
                                {priorityConfig[task.priority].icon} {task.priority}
                            </span>
                            
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit task"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                
                                <button
                                    onClick={() => onDelete(task._id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete task"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        {task.dueDate && (
                            <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatDate(task.dueDate)}</span>
                                {isOverdue && <span className="font-medium">(Overdue)</span>}
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created {formatDate(task.createdAt)}</span>
                        </div>
                        
                        {task.completed && task.completedAt && (
                            <div className="flex items-center space-x-1 text-green-600">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Completed {formatDate(task.completedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskList = () => {
    const { tasks, updateTask, deleteTask, isLoading, error } = useTasks();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    
    const handleToggleComplete = async (taskId, completed) => {
        await updateTask(taskId, { completed });
    };
    
    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
        }
    };
    
    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        switch (filter) {
            case 'completed':
                return task.completed;
            case 'pending':
                return !task.completed;
            case 'overdue':
                return task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
            default:
                return true;
        }
    });
    
    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'title':
                return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
            default: // createdAt
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (isLoading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters and Sort */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex space-x-1">
                        {[
                            { key: 'all', label: 'All Tasks' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'completed', label: 'Completed' },
                            { key: 'overdue', label: 'Overdue' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    filter === key
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="priority">Priority</option>
                            <option value="dueDate">Due Date</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Task Count */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                    {filter === 'all' ? 'All Tasks' : 
                     filter === 'pending' ? 'Pending Tasks' :
                     filter === 'completed' ? 'Completed Tasks' : 'Overdue Tasks'}
                    <span className="ml-2 text-sm text-gray-500">
                        ({sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'})
                    </span>
                </h2>
            </div>

            {/* Tasks */}
            {sortedTasks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filter === 'all' ? 'No tasks yet' :
                         filter === 'pending' ? 'No pending tasks' :
                         filter === 'completed' ? 'No completed tasks' : 'No overdue tasks'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {filter === 'all' ? 'Get started by creating your first task!' :
                         filter === 'pending' ? 'All caught up! No pending tasks.' :
                         filter === 'completed' ? 'No completed tasks yet.' : 'Great! No overdue tasks.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedTasks.map(task => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList;