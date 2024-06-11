import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export enum Category {
  YOUTUBE = 'YOUTUBE',
  PODCAST = 'PODCAST',
  VIDEO = 'VIDEO',
  BLOG = 'BLOG',
  UNKNOWN = 'UNKNOWN',
}

@Schema()
export class Feed extends Document {
  _id: string;

  @Prop({ unique: true })
  url: string;

  @Prop()
  title: string;

  @Prop({ required: false })
  image: string;

  @Prop()
  description: string;

  @Prop({ enum: Category })
  category: Category;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
