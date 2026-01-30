import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ resetDay1: 1, resetDay2: 4, resetTime: "00:00" });
        }
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { resetDay1, resetDay2, resetTime } = await req.json();
        
        // Validierung: resetTime muss HH:MM Format haben
        if (!resetTime || !resetTime.match(/^\d{2}:\d{2}$/)) {
            return NextResponse.json(
                { error: "resetTime muss im Format HH:MM sein" }, 
                { status: 400 }
            );
        }

        let settings = await Settings.findOneAndUpdate(
            {},
            { resetDay1, resetDay2, resetTime },
            { upsert: true, new: true }
        );
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}