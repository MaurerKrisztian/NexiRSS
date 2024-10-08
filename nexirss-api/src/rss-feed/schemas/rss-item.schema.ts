import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import OpenAI from 'openai';

import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectId } from 'bson';
import * as process from 'node:process';
import { Feed } from './feed.schema';

@Schema({ _id: false })
export class AudioInfo {
  @Prop()
  length: string;

  @Prop()
  type: string;

  @Prop()
  url: string;
}

const AudioInfoSchema = SchemaFactory.createForClass(AudioInfo);
@Schema()
export class RssItem extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true })
  pubDate: Date;

  @Prop({ required: false, default: '' })
  content: string;

  @Prop({ type: AudioInfoSchema, required: false })
  audioInfo?: AudioInfo;

  @Prop({ type: String, required: false })
  ttsAudioId: string | ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Feed', required: true })
  feed: Feed;

  @Prop({ type: [Number], index: '2dsphere' }) // Adding 2dsphere index
  plot_embedding: number[];

  @Prop({ type: [String], required: false, default: [] })
  labels: string[];

  @Prop({ required: false })
  summary?: string;
}

export const RssItemSchema = SchemaFactory.createForClass(RssItem);

RssItemSchema.virtual('isAudioAvailable').get(function (this: RssItem) {
  return !!this.audioInfo;
});

export const fetchEmbedding = async (text: string): Promise<number[]> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  return response.data[0].embedding;
};

RssItemSchema.pre<RssItem>('save', async function (next) {
  // const rssItem = this as RssItem;
  // const text = `${rssItem.title} ${rssItem.content} ${rssItem.pubDate}`;
  // rssItem.plot_embedding = await fetchEmbedding(text);
  // todo: fix this error: RssFeedService 400 This model's maximum context length is 8192 tokens, however you requested 17035 tokens (17035 in your prompt; 0 for the completion). Please reduce your prompt; or completion length.
  next();
});

RssItemSchema.pre('findOneAndUpdate', async function (next) {
  // const update = this.getUpdate() as RssItem;
  // if (update.title || update.content || update.pubDate) {
  //   const rssItem = await this.model.findOne(this.getQuery()).exec();
  //   if (rssItem) {
  //     const text = `${update.title || rssItem.title} ${
  //       update.content || rssItem.content
  //     } ${update.pubDate || rssItem.pubDate}`;
  //     update.plot_embedding = await fetchEmbedding(text);
  //   }
  // }
  next();
});
