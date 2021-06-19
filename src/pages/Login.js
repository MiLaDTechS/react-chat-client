import axios from 'axios';
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa';
import { Link, useHistory } from 'react-router-dom';
import { CustomValidationModule, useImmer, useLocalStorage } from '../utils';

const Login = () => {
    const history = useHistory();
    const [loginForm, setLoginForm] = useImmer({
        email: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const { setValue: setUser } = useLocalStorage('user');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setValidationError(null);

        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/login`, loginForm);

            setUser(data);
            history.push('/');

        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data && error.response.data.message) {
                setValidationError(error.response.data.message);
            } else {
                setValidationError('Connection Problem');
            }
        }
    }

    const handleInput = ({ target, target: { value, name } }) => {
        CustomValidationModule.onSubmit(target);
        setLoginForm(draft => {
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
            <h2 className="text-center text-xl font-bold mt-10 mb-5">Login Page</h2>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center" autoComplete="off">
                <div className="mb-2">
                    <img src="/images/login.png" alt="Login" />
                </div>
                <div className="flex flex-col">
                    <input type="email" name="email" placeholder="Email" value={loginForm.email} onChange={handleInput} className="mt-5 mb-3 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" onInvalid={({ target }) => {
                        CustomValidationModule.onSubmit(target);
                    }} required />
                    <input type="password" name="password" placeholder="Password" value={loginForm.password} onChange={handleInput} className="mb-4 px-3 py-2 text-sm outline-none focus:ring-2 bg-gray-100 rounded-lg transition" onInvalid={({ target }) => {
                        CustomValidationModule.onSubmit(target);
                    }} required />
                    <button type="submit" className="py-2 rounded-lg focus:outline-none bg-green-500 active:bg-green-700 font-bold text-sm text-white transition transform hover:scale-105 disabled:opacity-50" disabled={isLoading}>{isLoading ? (<FaSpinner color="white" className="animate-spin mx-auto" fontSize="20px" />) : 'Start Chat'}</button>
                    <div className="text-center my-2 font-bold text-xs">OR <Link className="text-blue-500 transition hover:text-blue-700" to="/register">Register</Link></div>
                </div>
                {validationError && (
                    <div className="mt-3">
                        <p className="text-red-500 font-bold text-xs">{validationError}</p>
                    </div>
                )}
            </form>
        </motion.div>
    )
}

export default Login
