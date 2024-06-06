import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridFSBucket, MongoClient } from 'mongodb';
import { Readable, Stream } from 'stream';
import { ObjectId } from 'bson';
import OpenAI from 'openai';
import { RssItem } from '../schemas/rss-item.schema';
import * as process from 'node:process';
export interface IGridFsFile {
  _id: ObjectId;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
}
@Injectable()
export class TTSService {
  private bucket: GridFSBucket;

  constructor(
    @InjectModel('RssItem') private readonly rssItemModel: Model<RssItem>,
  ) {
    const uri = process.env.DB_URL || 'mongodb://localhost:27017/rss';
    const client = new MongoClient(uri);
    client.connect().then(() => {
      this.bucket = new GridFSBucket(client.db(), {
        bucketName: 'tts',
      });
    });
  }

  truncateString(maxChars: number, str: string): string {
    if (str.length > maxChars) {
      return str.slice(0, maxChars);
    }
    return str;
  }

  sanitizeString(input: string): string {
    // Remove <code> blocks
    input = input.replace(/<code[\s\S]*?<\/code>/gi, '');

    // Remove all HTML tags
    input = input.replace(/<\/?[^>]+(>|$)/g, '');

    // Remove URLs
    input = input.replace(/https?:\/\/[^\s]+/g, '');

    return input;
  }

  async generateTTS(
    postId: string,
    openaiApiKey: string,
  ): Promise<{ ttsAudioId: string }> {
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    const post: RssItem = await this.rssItemModel.findById(postId).exec();
    if (!post) {
      throw new Error('Post not found');
    }

    // Use OpenAI to generate the TTS
    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: this.truncateString(4000, this.sanitizeString(post.content)), // todo: max characters is 4000, remove images and tags etc
      response_format: 'mp3',
    });

    console.log('got response');

    const buffer = Buffer.from(await ttsResponse.arrayBuffer());

    const res: any = await this.upload(
      this.bucket,
      Readable.from(buffer),
      `${postId}.mp3`,
    );

    console.log(res);
    // Update the post with the TTS audio ID
    post.ttsAudioId = res._id;
    await post.save();

    return { ttsAudioId: res._id };
  }

  private upload(
    bucket: GridFSBucket,
    stream: Stream,
    filename: string,
  ): Promise<IGridFsFile> {
    return new Promise((resolve, reject) => {
      const upload = bucket.openUploadStream(filename);
      stream
        .pipe(upload)
        .on('error', async (err) => {
          reject(err);
        })
        .on('finish', async (file) => {
          resolve(upload.gridFSFile);
        });
    });
  }

  async getTTS(id: string, res: any) {
    const ttsId = new ObjectId(id);
    const downloadStream = this.bucket.openDownloadStream(ttsId);
    res.set({
      'Content-Type': 'audio/mpeg', // Set the appropriate audio content type
      'Content-Disposition': 'attachment; filename="audio.mp3"', // Optional: set a filename
    });
    downloadStream.pipe(res);
  }
}
