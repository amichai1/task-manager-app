const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRE || '30d' 
    });
};

// Validate email format
const isValidEmail = (email) => {
    return validator.isEmail(email);
};

// Validate password strength
const isValidPassword = (password) => {
    return password.length >= 6 && 
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

// Register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters long' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long and contain uppercase, lowercase, and number' 
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword
        });

        // Response without password
        res.status(201).json({
            success: true,
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Successful login
        res.json({
            success: true,
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get user profile' });
    }
};

// עדכון פרופיל משתמש (סטאב)
const updateUserProfile = async (req, res) => {
    // כאן תוסיף את הלוגיקה לעדכון פרופיל משתמש
    res.status(501).json({ message: 'Update User Profile not implemented yet' });
};

// מחיקת משתמש (סטאב)
const deleteUser = async (req, res) => {
    // כאן תוסיף את הלוגיקה למחיקת משתמש
    res.status(501).json({ message: 'Delete User not implemented yet' });
};

// קבלת כל המשתמשים (סטאב)
const getAllUsers = async (req, res) => {
    // כאן תוסיף את הלוגיקה לקבלת כל המשתמשים
    res.status(501).json({ message: 'Get All Users not implemented yet' });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile, // ייצוא הפונקציה
    deleteUser,        // ייצוא הפונקציה
    getAllUsers   
};