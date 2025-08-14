const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const {
    generalLimiter,
    helmetConfig,
    sanitizeInput,
    requestLogger,
    errorHandler
} = require('./middleware/security');

const app = express();

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Security middleware
app.use(helmetConfig);

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// Rate limiting
app.use('/api', generalLimiter);

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
        
        console.log('Origin from request:', origin);
        console.log('Allowed origins:', allowedOrigins);
        console.log('Origin:', origin); // הדפיס את ה-Origin כדי לוודא מה נשלח
        
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ message: 'Invalid JSON' });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task Manager API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Task Manager API',
        version: '1.0.0',
        description: 'RESTful API for task management',
        endpoints: {
            auth: {
                register: 'POST /api/users/register',
                login: 'POST /api/users/login',
                profile: 'GET /api/users/profile'
            },
            tasks: {
                list: 'GET /api/tasks',
                create: 'POST /api/tasks',
                update: 'PUT /api/tasks/:id',
                delete: 'DELETE /api/tasks/:id',
                stats: 'GET /api/tasks/stats'
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        availableRoutes: ['/api/users', '/api/tasks', '/api/health']
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;