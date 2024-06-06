import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  category: string;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
