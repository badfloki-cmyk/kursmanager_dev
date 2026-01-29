import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { id, password, role } = await req.json();

        const Model = role === 'student' ? Student : Teacher;
        const user = await Model.findById(id);

        if (!user) {
            return NextResponse.json({ error: 'Benutzer existiert nicht mehr. Bitte Seite neu laden!' }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({ error: 'Benutzer hat kein Passwort gesetzt. Bitte Administrator kontaktieren (/api/seed aufrufen).' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Passwort ist nicht korrekt. Bitte auf Groß-/Kleinschreibung achten.' }, { status: 401 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
