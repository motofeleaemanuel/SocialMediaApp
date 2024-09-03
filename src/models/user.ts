import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    refreshToken: string[];
    isVerified: boolean;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    refreshToken: { type: [String] }, // Storing multiple refresh tokens
    isVerified: { type: Boolean, default: false, required: true }
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;