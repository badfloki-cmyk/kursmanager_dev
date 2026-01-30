import dbConnect from './db';
import Settings from '@/models/Settings';

export const getCurrentSession = async () => {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) settings = { resetDay1: 1, resetDay2: 4, resetTime: "00:00" };

    // Get current time in Berlin
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const currentDay = now.getDay(); // 0-6 (Sun-Sat)

    // Parse reset time
    const [resetH, resetM] = (settings.resetTime || "00:00").split(':').map(Number);
    const resetMinutesOfDay = resetH * 60 + resetM;

    // Convert everything to minutes relative to start of week (Sunday 00:00)
    const currentMinutesOfWeek = currentDay * 1440 + now.getHours() * 60 + now.getMinutes();

    // Get the two reset points in minutes
    let r1 = settings.resetDay1 * 1440 + resetMinutesOfDay;
    let r2 = settings.resetDay2 * 1440 + resetMinutesOfDay;

    // Ensure r1 is the earlier one in the week
    if (r1 > r2) {
        [r1, r2] = [r2, r1];
    }

    // Determine session
    // Session 1: From R1 to R2
    // Session 2: From R2 to R1 (of next week)

    const isSession1 = currentMinutesOfWeek >= r1 && currentMinutesOfWeek < r2;

    // Week number calculation (ISO-ish)
    // using the Berlin 'now' ensures week number changes at Berlin midnight
    const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);

    return `2025-W${weekNumber}-${isSession1 ? '1' : '2'}`;
};
