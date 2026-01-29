import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    resetDay1: { type: Number, default: 1 }, // 1 = Monday
    resetDay2: { type: Number, default: 4 }, // 4 = Thursday
    resetTime: { type: String, default: "00:00" },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
