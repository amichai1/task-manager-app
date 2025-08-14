const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// Get all tasks for user
const getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, completed, search } = req.query;
        
        // Build query
        const query = { user: req.user.id };
        
        // Filter by completion status
        if (completed !== undefined) {
            query.completed = completed === 'true';
        }
        
        // Search in title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        // Execute query with pagination
        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Task.countDocuments(query);
        
        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get single task by ID
const getTask = async (req, res) => { // פונקציית getTask שחסרה
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure task belongs to the authenticated user
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this task' });
        }

        res.json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch task',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Create new task
const createTask = async (req, res) => {
    try {
        const { title, description, priority = 'medium', dueDate } = req.body;
        
        // Validation
        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: 'Task title is required' });
        }
        
        if (title.trim().length > 200) {
            return res.status(400).json({ message: 'Task title cannot exceed 200 characters' });
        }
        
        if (description && description.length > 1000) {
            return res.status(400).json({ message: 'Description cannot exceed 1000 characters' });
        }
        
        if (!['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({ message: 'Priority must be low, medium, or high' });
        }
        
        // Validate due date
        if (dueDate && new Date(dueDate) < new Date()) {
            return res.status(400).json({ message: 'Due date cannot be in the past' });
        }
        
        const task = await Task.create({
            user: req.user.id,
            title: title.trim(),
            description: description ? description.trim() : '',
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            completed: false
        });
        
        res.status(201).json({
            success: true,
            data: task
        });
        
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ 
            message: 'Failed to create task',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        
        const { title, description, completed, priority, dueDate } = req.body;
        
        // Validation
        if (title !== undefined) {
            if (!title || title.trim().length === 0) {
                return res.status(400).json({ message: 'Task title cannot be empty' });
            }
            if (title.trim().length > 200) {
                return res.status(400).json({ message: 'Task title cannot exceed 200 characters' });
            }
            task.title = title.trim();
        }
        
        if (description !== undefined) {
            if (description && description.length > 1000) {
                return res.status(400).json({ message: 'Description cannot exceed 1000 characters' });
            }
            task.description = description ? description.trim() : '';
        }
        
        if (completed !== undefined) {
            task.completed = Boolean(completed);
            task.completedAt = task.completed ? new Date() : null;
        }
        
        if (priority !== undefined) {
            if (!['low', 'medium', 'high'].includes(priority)) {
                return res.status(400).json({ message: 'Priority must be low, medium, or high' });
            }
            task.priority = priority;
        }
        
        if (dueDate !== undefined) {
            if (dueDate && new Date(dueDate) < new Date() && !task.completed) {
                return res.status(400).json({ message: 'Due date cannot be in the past' });
            }
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }
        
        const updatedTask = await task.save();
        
        res.json({
            success: true,
            data: updatedTask
        });
        
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ 
            message: 'Failed to update task',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }
        
        await Task.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ 
            message: 'Failed to delete task',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get task statistics
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const stats = await Task.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    pending: { $sum: { $cond: ['$completed', 0, 1] } },
                    high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
                    medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
                    low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
                }
            }
        ]);
        
        const result = stats[0] || {
            total: 0,
            completed: 0,
            pending: 0,
            high: 0,
            medium: 0,
            low: 0
        };
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            message: 'Failed to get task statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};