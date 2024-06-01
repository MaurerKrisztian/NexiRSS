import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import OpenAI from 'openai';

import { Document, Schema as MongooseSchema } from 'mongoose';
import * as process from 'node:process';
import { Feed } from './feed.schema';

@Schema()
export class RssItem extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  pubDate: Date;

  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Feed', required: true })
  feed: Feed;

  @Prop({ type: [Number], index: '2dsphere' }) // Adding 2dsphere index
  plot_embedding: number[];
}

export const RssItemSchema = SchemaFactory.createForClass(RssItem);

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
  const rssItem = this as RssItem;
  const text = `${rssItem.title} ${rssItem.content} ${rssItem.pubDate}`;
  rssItem.plot_embedding = await fetchEmbedding(text);
  next();
});

RssItemSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as RssItem;
  if (update.title || update.content || update.pubDate) {
    const rssItem = await this.model.findOne(this.getQuery()).exec();
    if (rssItem) {
      const text = `${update.title || rssItem.title} ${
        update.content || rssItem.content
      } ${update.pubDate || rssItem.pubDate}`;
      update.plot_embedding = await fetchEmbedding(text);
    }
  }
  next();
});
