import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import lottie from 'lottie-web'

const ConfirmEmail = () => {
    const location = useLocation();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [validation, setValidation] = useState({ type: '', message: '' });

    useEffect(() => {
        lottie.loadAnimation({
            container: document.getElementById('test'),
            autoplay: true,
            loop: true,
            renderer: 'svg',
            path: '/animations/loading.json'
        });
    }, [])

    useEffect(() => {
        const token = new URLSearchParams(location.search).get("token");

        axios.post(`${process.env.REACT_APP_API_URL}/confirmemail`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(({ data }) => {
            setValidation({ type: 'success', message: data.message });
            setTimeout(() => {
                history.replace('/login')
            }, 3000);
        }).catch(error => {
            if (error.response && error.response.data) {
                if (error.response.data.name === "TokenExpiredError") {
                    setValidation({ type: 'error', message: "Activation link has expired" });
                } else {
                    setValidation({ type: 'error', message: error.response.data.message });
                }
            } else {
                setValidation({ type: 'error', message: 'Connection Problem' });
            }
        }).finally(() => {
            setIsLoading(false);
        });

    }, [location, history])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
        >
            <div className="flex flex-col h-screen justify-center items-center">
                <div id="test" style={{ width: 100, height: 100, display: !isLoading && 'none' }} />
                {!isLoading && (
                    <p className={`${validation.type === 'error' ? 'text-red-500' : 'text-green-500'} px-16 text-center`}>{validation.message}</p>
                )}
            </div>
        </motion.div>
    )
}

export default ConfirmEmail;
