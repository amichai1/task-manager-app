const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },
    completed: {
        type: Boolean,
        default: false,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        index: true
    },
    dueDate: {
        type: Date,
        index: true
    },
    completedAt: {
        type: Date
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Indexes for better performance
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Virtual for overdue tasks
taskSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.completed) return false;
    return new Date() > this.dueDate;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
    if (this.completed && !this.completedAt) {
        this.completedAt = new Date();
    } else if (!this.completed) {
        this.completedAt = null;
    }
    next();
});

// Methods
taskSchema.methods.toggleComplete = function() {
    this.completed = !this.completed;
    this.completedAt = this.completed ? new Date() : null;
    return this.save();
};

module.exports = mongoose.model('Task', taskSchema);