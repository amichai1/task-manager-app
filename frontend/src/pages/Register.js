import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = ({ onRegister }) => (
    <div>
        <h1>Register</h1>
        <RegisterForm onRegister={onRegister} />
    </div>
);

export default Register;