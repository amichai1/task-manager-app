import React from 'react';

const TaskList = ({ tasks, onToggleComplete, onDelete }) => (
    <ul>
        {tasks.map(task => (
            <li key={task._id}>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                </span>
                <button onClick={() => onToggleComplete(task._id, !task.completed)}>
                     {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => onDelete(task._id)}>Delete</button>
            </li>
        ))}
    </ul>
);

export default TaskList;