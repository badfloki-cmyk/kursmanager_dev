import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Teacher from '@/models/Teacher';

export async function GET() {
    await dbConnect();
    const teachers = await Teacher.find({});
    return NextResponse.json(teachers);
}
