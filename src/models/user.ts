import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    details: {
        title?: string;
        company?: string;
        about?: string;
        phone?: string;
        country?: string;
        city?: string;
        address?: string;
        birthday?: string;
    };
    refreshToken: string[];
    isVerified: boolean;
    avatar: string;
    friends: Schema.Types.ObjectId[];
    friendRequests: Schema.Types.ObjectId[];
    posts: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    details: {
        title: { type: String },
        company: { type: String },
        about: { type: String },
        phone: { type: String },
        country: { type: String },
        city: { type: String },
        address: { type: String },
        birthday: { type: String },
    },
    refreshToken: { type: [String] },
    isVerified: { type: Boolean, default: false, required: true },
    avatar: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;