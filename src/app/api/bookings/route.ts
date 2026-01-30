import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getCurrentSession } from '@/lib/session';

export async function GET() {
    try {
        await dbConnect();
        const session = await getCurrentSession();
        const bookings = await Booking.find({ session }).populate('student');
        return NextResponse.json(bookings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, room } = await req.json();
        const session = await getCurrentSession();

        // Check capacity
        const count = await Booking.countDocuments({ room, session });
        if (count >= 25) {
            return NextResponse.json({ error: 'Dieser Raum ist bereits voll (max. 25 Schüler).' }, { status: 400 });
        }

        // Upsert booking for this student in this session
        const booking = await Booking.findOneAndUpdate(
            { student: studentId, session },
            { room, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // DOUBLE CHECK: Race Condition Protection
        // After inserting, we check the total count for this room/session again.
        const verifyCount = await Booking.countDocuments({ room, session });
        if (verifyCount > 25) {
            // If we exceeded the limit, we must rollback THIS booking if it was the one that tipped the scale.
            // Actually, simply acting as "Last In First Out" rejection is fair for race conditions.
            // Check if this booking is among the text few that overflowed? 
            // Simpler: Just delete it and throw error.
            await Booking.findByIdAndDelete(booking._id);
            return NextResponse.json({ error: 'Dieser Raum ist bereits voll (max. 25 Schüler) - Buchung storniert.' }, { status: 400 });
        }

        return NextResponse.json(booking);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
