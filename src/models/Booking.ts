import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    student: mongoose.Types.ObjectId;
    room: string; // "Mathe", "Deutsch", "Englisch"
    session: string; // e.g. "2025-01-29" or "Week-1-A"
    createdAt: Date;
}

const BookingSchema: Schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    room: { type: String, required: true },
    session: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Ensure a student can only have one booking per session
BookingSchema.index({ student: 1, session: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
