import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
export interface IFeedSubscription {
  feed: string;
  notifications: boolean;
  enableAITrigger: boolean;
}
export interface IHighlightedItem {
  itemId: string;
  trigger?: AiAnalysisSetting;
}

@Schema()
export class AiAnalysisSetting {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  prompt: string;

  @Prop({ default: false })
  notifications: boolean;

  @Prop({ default: false })
  highlight: boolean;
}

const AiAnalysisSettingSchema = SchemaFactory.createForClass(AiAnalysisSetting);

@Schema({ _id: false })
export class HighlightedItem implements IHighlightedItem {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: false, type: AiAnalysisSetting })
  trigger?: AiAnalysisSetting;
}

export const HighlightedItemSchema =
  SchemaFactory.createForClass(HighlightedItem);

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
        enableAITrigger: { type: Boolean, default: false },
      },
    ],
    required: false,
    default: [],
  })
  feedSubscriptions: IFeedSubscription[];

  @Prop({ required: false })
  openaiApiKey: string;

  @Prop({ type: [AiAnalysisSettingSchema], required: false, default: [] })
  aiAnalysisSettings: AiAnalysisSetting[];

  @Prop({ type: [HighlightedItemSchema], required: false, default: [] })
  highlightedItems: IHighlightedItem;

  @Prop({ default: false, required: false })
  isDebugger: boolean;

  get feeds() {
    return this.feedSubscriptions.map((sub) => sub.feed);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('feeds').get(function () {
  return this.feedSubscriptions.map((sub) => sub.feed);
});
