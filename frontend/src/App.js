import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// רק השורה הזו נוספה:
const mockApi = { getTasks: () => Promise.resolve([]), createTask: (title) => Promise.resolve({_id: Date.now(), title, completed: false}), updateTask: (id, updates) => Promise.resolve({_id: id, ...updates}), deleteTask: () => Promise.resolve() };

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
};

export default App;