import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function GET() {
    try {
        await dbConnect();
        const messages = await Message.find({ isGlobal: true }).sort({ createdAt: -1 });
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sender, content } = await req.json();
        const message = await Message.create({ sender, content });
        return NextResponse.json(message);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
