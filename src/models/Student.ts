import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    name: string;
    className: string;
    studentId: string; // e.g. "10R2-1"
    password?: string;
}

const StudentSchema: Schema = new Schema({
    name: { type: String, required: true },
    className: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String },
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
