import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridFSBucket, MongoClient } from 'mongodb';
import { Readable, Stream } from 'stream';
import { ObjectId } from 'bson';
import OpenAI from 'openai';
import { RssItem } from '../schemas/rss-item.schema';
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
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    @InjectModel('RssItem') private readonly rssItemModel: Model<RssItem>,
  ) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rss';
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

  async generateTTS(postId: string) {
    const post: RssItem = await this.rssItemModel.findById(postId).exec();
    if (!post) {
      throw new Error('Post not found');
    }

    // Use OpenAI to generate the TTS
    const ttsResponse = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: this.truncateString(1000, post.content), // todo: max characters is 4000, remove images and tags etc
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
    downloadStream.pipe(res);
  }
}
