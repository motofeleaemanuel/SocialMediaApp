import mongoose, { Schema, Document } from "mongoose";

interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
    likes: mongoose.Types.Array<mongoose.Types.ObjectId>; // Array of user IDs who liked the comment
    replies: mongoose.Types.Array<mongoose.Types.ObjectId>; // Array of reply comment IDs
}

const commentSchema = new Schema<IComment>({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the comment
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }] // Array of reply comment IDs
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;