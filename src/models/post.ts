import mongoose, { Schema, Document } from "mongoose";

interface IPost extends Document {
    user: Schema.Types.ObjectId;
    description: string;
    photo: string;
    likes: Schema.Types.ObjectId[];
    comments: Schema.Types.ObjectId[];
    shares: Schema.Types.ObjectId[];
    createdAt: Date;
}

const postSchema = new Schema<IPost>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    photo: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    shares: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;