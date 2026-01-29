import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { studentsData, teachersData } from '@/lib/seedData';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        // Clear existing
        await Student.deleteMany({});
        await Teacher.deleteMany({});

        // Hash passwords and seed students
        const hashedStudents = await Promise.all(studentsData.map(async (s: any) => ({
            ...s,
            password: await bcrypt.hash(s.password, 10)
        })));

        // Hash passwords and seed teachers
        const hashedTeachers = await Promise.all(teachersData.map(async (t: any) => ({
            ...t,
            password: await bcrypt.hash(t.password, 10)
        })));

        await Student.insertMany(hashedStudents);
        await Teacher.insertMany(hashedTeachers);

        return NextResponse.json({
            message: 'Database seeded successfully with complex hardcoded passwords'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
