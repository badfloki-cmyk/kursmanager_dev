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

        const studentCredentials: any[] = [];
        const teacherCredentials: any[] = [];

        // Hash passwords and seed students
        const hashedStudents = await Promise.all(studentsData.map(async (s) => {
            const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit PIN
            studentCredentials.push({ name: s.name, className: s.className, pin });
            return {
                ...s,
                password: await bcrypt.hash(pin, 10)
            };
        }));

        // Hash passwords and seed teachers
        const hashedTeachers = await Promise.all(teachersData.map(async (t) => {
            const pin = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit PIN for teachers
            teacherCredentials.push({ name: t.name, pin });
            return {
                ...t,
                password: await bcrypt.hash(pin, 10)
            };
        }));

        await Student.insertMany(hashedStudents);
        await Teacher.insertMany(hashedTeachers);

        return NextResponse.json({
            message: 'Database seeded successfully with dynamic PINs',
            credentials: {
                students: studentCredentials,
                teachers: teacherCredentials
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
