import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
        return NextResponse.json({ message: 'Schüler aus Kurs entfernt' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
