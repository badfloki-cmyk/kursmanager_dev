import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';

export async function GET() {
    await dbConnect();
    const students = await Student.find({});
    return NextResponse.json(students);
}
