import axios from 'axios';
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { CustomValidationModule, useImmer } from '../utils';

const Register = () => {
    const [registerForm, setRegisterForm] = useImmer({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [validation, setValidation] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (registerForm.password !== registerForm.confirmPassword) {
            setValidation({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        setValidation({ type: '', message: '' });

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/register`, registerForm);
            setRegisterForm({
                email: '',
                nickname: '',
                password: '',
                confirmPassword: ''
            });
            setIsLoading(false);
            setValidation({ type: 'success', message: `Registered successfully. Confirm your email and start chating` });
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data && error.response.data.message) {
                setValidation({ type: 'error', message: error.response.data.message });
            } else {
                setValidation({ type: 'error', message: 'Connection Problem' });
            }
        }
    }

    const handleInput = ({ target, target: { value, name } }) => {
        CustomValidationModule.onSubmit(target);
        setRegisterForm(draft => {
            draft[name] = value;
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
        >
            <h2 className="text-center text-xl font-bold mt-10 mb-5">Register Page</h2>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center" autoComplete="off">
                <div className="mb-2">
                    <img src="/images/register.png" alt="Register" width="150px" height="150px" />
                </div>
                <div className="flex flex-col">
                    <input type="email" name="email" placeholder="Email" value={registerForm.email} onChange={handleInput} className="mt-5 mb-3 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" onInvalid={({ target }) => {
                        CustomValidationModule.onSubmit(target);
                    }} required />
                    <input type="text" name="nickname" placeholder="Nickname" value={registerForm.nickname} onChange={handleInput} className="mb-3 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" />
                    <input type="password" name="password" placeholder="Password" value={registerForm.password} onChange={handleInput} className="mb-3 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" onInvalid={({ target }) => {
                        CustomValidationModule.onSubmit(target);
                    }} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={registerForm.confirmPassword} onChange={handleInput} className="mb-4 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" onInvalid={({ target }) => {
                        CustomValidationModule.onSubmit(target);
                    }} required />
                    <button type="submit" className="py-2 rounded-lg focus:outline-none bg-blue-500 active:bg-blue-700 font-bold text-sm text-white transition transform hover:scale-105 disabled:opacity-50" disabled={isLoading}>{isLoading ? (<FaSpinner color="white" className="animate-spin mx-auto" fontSize="20px" />) : 'Register'}</button>
                    <div className="text-center my-2 font-bold text-xs">OR <Link className="text-green-500 transition hover:text-green-700" to="/login">Login</Link></div>
                </div>
                {validation.message && (
                    <div className="mt-3">
                        <p className={`${validation.type === 'error' ? 'text-red-500' : 'text-green-500'} font-bold text-xs`}>{validation.message}</p>
                    </div>
                )}
            </form>
        </motion.div>
    )
}

export default Register
