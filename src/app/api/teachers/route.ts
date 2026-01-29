import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Teacher from '@/models/Teacher';

export async function GET() {
    await dbConnect();
    const teachers = await Teacher.find({});
    return NextResponse.json(teachers);
}
