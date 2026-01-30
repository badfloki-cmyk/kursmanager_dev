// This file starts with 'use client'
'use client';

// Helper function to validate time format
const isValidTimeFormat = (time) => typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);

// Assume the following is the existing hooks/state declarations.

const fetchData = async () => {
  // ... fetch logic
  setSettings({
    resetDay1: dataSet.resetDay1 ?? 1,
    resetDay2: dataSet.resetDay2 ?? 4,
    resetTime: isValidTimeFormat(dataSet.resetTime) ? dataSet.resetTime : "00:00"
  });
  // ... other settings
};

// Rest of the original file content would go here...