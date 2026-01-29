import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getCurrentSession } from '@/lib/session';

export async function GET() {
    try {
        await dbConnect();
        const session = getCurrentSession();
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
        const session = getCurrentSession();

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

        return NextResponse.json(booking);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
