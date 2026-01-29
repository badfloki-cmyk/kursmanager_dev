export const getCurrentSession = () => {
    // Logic to determine session based on current date
    // For now return a fixed session based on the week
    const now = new Date();
    const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
    const isSecondHalfOfWeek = now.getDay() >= 4; // Thursday or later
    return `2025-W${weekNumber}-${isSecondHalfOfWeek ? '2' : '1'}`;
};
