import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
export interface IFeedSubscription {
  feed: string;
  notifications: boolean;
}

@Schema({
  strict: false,
  virtuals: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document {
  _id: string;

  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop({
    type: [
      {
        feed: { type: MongooseSchema.Types.ObjectId, ref: 'Feed' },
        notifications: { type: Boolean, default: false },
      },
    ],
    required: false,
    default: [],
  })
  feedSubscriptions: IFeedSubscription[];

  @Prop({ required: false })
  openaiApiKey: string;

  get feeds() {
    return this.feedSubscriptions.map((sub) => sub.feed);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('feeds').get(function () {
  return this.feedSubscriptions.map((sub) => sub.feed);
});
