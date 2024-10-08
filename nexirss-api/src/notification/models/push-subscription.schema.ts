import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PushSubscription extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true, type: Object })
  keys: {
    auth: string;
    p256dh: string;
  };
  @Prop({ required: false, type: Object })
  deviceInfo: { osName?: string; osVersion?: string; type?: string };
}

export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);
