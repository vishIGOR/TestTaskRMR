import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./users.schema";
import { Post } from "./posts.schema";

@Schema()
export class Like extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: User.name })
    userId: MongooseSchema.Types.ObjectId;
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: Post.name })
    postId: MongooseSchema.Types.ObjectId;
}

let schema = SchemaFactory.createForClass(Like);
schema.index({ userId: 1, postId: 1 }, { unique: true });
export const LikeSchema = schema;
