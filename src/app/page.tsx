import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Helper function to validate time format
const isValidTimeFormat = (time) => {
    const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
    return timePattern.test(time);
};

const Page = () => {
    const [resetTime, setResetTime] = useState('00:00:00');

    const handleResetTimeChange = (e) => {
        const newTime = e.target.value;
        if (isValidTimeFormat(newTime)) {
            setResetTime(newTime);
        } else {
            console.error('Invalid time format. Please use HH:MM:SS.');
        }
    };

    return (
        <motion.div>
            <h1>Welcome to Kursmanager</h1>
            <input 
                type='text' 
                value={resetTime} 
                onChange={handleResetTimeChange} 
                placeholder='HH:MM:SS' 
            />
        </motion.div>
    );
};

export default Page;