import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ strict: false })
export class User extends Document {
  _id: string;
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop({ type: [String], default: () => [] })
  feeds: string[];

  @Prop({ required: false })
  openaiApiKey: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
