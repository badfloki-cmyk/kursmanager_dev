import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
    name: string;
    role: string; // e.g. "Klassenlehrer", "Fachlehrer"
    subject?: string; // e.g. "Mathe"
    password?: string;
}

const TeacherSchema: Schema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    subject: { type: String },
    password: { type: String },
});

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
