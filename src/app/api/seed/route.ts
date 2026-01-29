import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { studentsData, teachersData } from '@/lib/seedData';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing data
        await Student.deleteMany({});
        await Teacher.deleteMany({});

        // Insert new data
        await Student.insertMany(studentsData);
        await Teacher.insertMany(teachersData);

        return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
