import dbConnect from './db';
import Settings from '@/models/Settings';

export const getCurrentSession = async () => {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) settings = { resetDay1: 1, resetDay2: 4, resetTime: "00:00" };

    // Get current time in Berlin
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Berlin",
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        weekday: 'short'
    });

    // We create a date object that effectively represents "now" in Berlin time numbers
    // HACK: manipulating date strings to ensure we treat "Now in Berlin" as local time values
    const nowString = new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" });
    const now = new Date(nowString);

    // Current day 0-6 (Sun-Sat)
    const currentDay = now.getDay();

    // Parse reset time (HH:MM)
    const [resetH, resetM] = (settings.resetTime || "00:00").split(':').map(Number);
    const resetMinutesOfDay = resetH * 60 + resetM;

    // We calculate "Minutes since start of the week (Monday 00:00)".
    // Monday is 0, Sunday is 6.

    // Map JS getDay() (Sun=0, Mon=1...Sat=6) to (Mon=0...Sun=6)
    const mapDayToMon0 = (d: number) => (d + 6) % 7;

    const currentMinutesOfWeek = mapDayToMon0(currentDay) * 1440 + now.getHours() * 60 + now.getMinutes();

    // Calculate Reset Points in "Minutes since Mon 00:00"
    // Settings days: 1=Mon, ..., 0=Sun. 
    // We map them to our internal 0-6 scale.
    // If user saved 1 (Mon), mapDayToMon0(1) = 0.
    // If user saved 0 (Sun), mapDayToMon0(0) = 6.

    let r1 = mapDayToMon0(settings.resetDay1) * 1440 + resetMinutesOfDay;
    let r2 = mapDayToMon0(settings.resetDay2) * 1440 + resetMinutesOfDay;

    // Logic: The week is circular. We have two points on the circle.
    // They divide the week into Session A and Session B.
    // We need to define which is which.
    // Let's assume standard ordering: r1 < r2.
    if (r1 > r2) {
        [r1, r2] = [r2, r1];
    }

    // Now we have time segments:
    // [0 ..... r1) -> belongs to previous week's last session (Session 2 of prev week) OR start of this week? 
    // Wait, let's keep it simple.
    // Session 1: r1 <= t < r2
    // Session 2: Everything else (t >= r2 OR t < r1)

    const isSession1 = currentMinutesOfWeek >= r1 && currentMinutesOfWeek < r2;

    // Week number calculation (ISO 8601) - robust version
    const getWeek = (date: Date) => {
        const d = new Date(date.valueOf());
        const dayNum = d.getDay() || 7;
        d.setDate(d.getDate() + 4 - dayNum);
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    // If we are BEFORE r1 (Monday morning before reset), we are effectively still in the "weekend session" of the PREVIOUS week.
    // But for naming, we can just say we are "Session 2" (Weekend/Late week session).
    // Unique ID construction: Year-Week-SessionID
    const weekNum = getWeek(now);
    const year = now.getFullYear();

    // Edge case: If we are in "Session 2" but specifically the part *before* r1 (meaning we passed Sunday midnight but haven't reached Monday reset yet),
    // it technically belongs to the "end" of the previous sequence.
    // However, simply keeping Year-Week-Session works structurally.

    // To distinguish "late week session" from "early week session" if they wrap around, we rely on the boolean.
    // Session 1 is ALWAYS the "Mid-week" session (between reset 1 and reset 2).
    // Session 2 is the "Weekend/End-start" session.

    return `${year}-W${weekNum}-${isSession1 ? '1' : '2'}`;
};
