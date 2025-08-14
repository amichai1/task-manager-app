import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import '../services/api.js';

const TaskForm = ({ task = null, onClose = null }) => {
    const { createTask, updateTask, isLoading } = useTasks();
    const isEditing = !!task;
    
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    
    const [isExpanded, setIsExpanded] = useState(isEditing);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        } else if (formData.title.trim().length > 200) {
            newErrors.title = 'Title cannot exceed 200 characters';
        }
        
        if (formData.description.length > 1000) {
            newErrors.description = 'Description cannot exceed 1000 characters';
        }
        
        if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0,0,0,0)) {
            newErrors.dueDate = 'Due date cannot be in the past';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const taskData = {
            ...formData,
            dueDate: formData.dueDate || null
        };
        
        let result;
        if (isEditing) {
            result = await updateTask(task._id, taskData);
        } else {
            result = await createTask(taskData);
        }
        
        if (result.success) {
            if (!isEditing) {
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    dueDate: ''
                });
                setIsExpanded(false);
            }
            
            if (onClose) {
                onClose();
            }
        }
    };

    const priorityOptions = [
        { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
        { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' }
    ];

    if (!isExpanded && !isEditing) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Add New Task</span>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    {isEditing ? 'Edit Task' : 'Add New Task'}
                </h3>
                {(isExpanded || onClose) && (
                    <button
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                setIsExpanded(false);
                                setFormData({
                                    title: '',
                                    description: '',
                                    priority: 'medium',
                                    dueDate: ''
                                });
                                setErrors({});
                            }
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title *
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        placeholder="What needs to be done?"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none`}
                        placeholder="Add more details about this task..."
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-3 border ${errors.dueDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        />
                        {errors.dueDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                setIsExpanded(false);
                                setFormData({
                                    title: '',
                                    description: '',
                                    priority: 'medium',
                                    dueDate: ''
                                });
                                setErrors({});
                            }
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                            </div>
                        ) : (
                            isEditing ? 'Update Task' : 'Add Task'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;