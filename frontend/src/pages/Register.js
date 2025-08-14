import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';


const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <RegisterForm />
                
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;