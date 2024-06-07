import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PushNotification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  sent: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PushNotificationSchema =
  SchemaFactory.createForClass(PushNotification);
