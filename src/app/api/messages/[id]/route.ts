import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { content } = await req.json();
        const message = await Message.findByIdAndUpdate(params.id, { content }, { new: true });
        if (!message) return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 });
        return NextResponse.json(message);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const message = await Message.findByIdAndDelete(params.id);
        if (!message) return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 });
        return NextResponse.json({ message: 'Nachricht gelöscht' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
