import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    sender: string;
    content: string;
    isGlobal: boolean;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    sender: { type: String, required: true },
    content: { type: String, required: true },
    isGlobal: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
