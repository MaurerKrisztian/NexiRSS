import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Feed extends Document {
  @Prop({ unique: true })
  url: string;

  @Prop()
  title: string;

  @Prop()
  category: string;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
