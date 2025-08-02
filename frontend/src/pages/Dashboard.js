import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const Dashboard = ({ api }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!api) return; // רק השורה הזו נוספה
        api.getTasks().then(setTasks);
    }, [api]);

    const addTask = async (title) => {
        const newTask = await api.createTask(title);
        setTasks([...tasks, newTask]);
    };

    const toggleComplete = async (id, completed) => {
        const updatedTask = await api.updateTask(id, { completed });
        setTasks(tasks.map(task => (task._id === id ? updatedTask : task)));
    };

    const deleteTask = async (id) => {
        await api.deleteTask(id);
        setTasks(tasks.filter(task => task._id !== id));
    };

    return (
        <div>
            <h1>Task Dashboard</h1>
            <TaskForm onAdd={addTask} />
            <TaskList tasks={tasks} onToggleComplete={toggleComplete} onDelete={deleteTask} />
        </div>
    );
};

export default Dashboard;
