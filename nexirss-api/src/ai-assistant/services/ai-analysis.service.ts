import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../../rss-feed/schemas/rss-item.schema';
import * as striptags from 'striptags';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/models/user.schema';
import { LabelTool } from './fn-call/tools/label.tool';
import OpenAI from 'openai';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  constructor(
    private readonly openAiService: OpenAiService,
    @InjectModel(RssItem.name) private readonly rssItem: Model<RssItem>,
    private readonly labelTool: LabelTool,
  ) {}

  @OnEvent('rss.item.new')
  analyzeNewFeedItem(item: RssItem) {
    this.logger.debug(`analyze new item: ${item.feed}:${item.title}`);
  }

  async generateSummaryAndLabelsToItem(user: User, itemId: string) {
    const item = await this.rssItem.findOne({ _id: itemId }).exec();

    if (!user.openaiApiKey) {
      throw new BadRequestException('No open ai key found.');
    }

    const client = new OpenAI({
      apiKey: user.openaiApiKey,
    });

    const runner = client.beta.chat.completions.runTools({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant canalizing content',
        },
        {
          role: 'user',
          content: `Add summary and labels to this article based on the content: ${striptags(
            item.toObject().content,
          )}`,
        },
      ],
      tools: [await this.labelTool.getSchema(user._id, itemId)],
      tool_choice: 'auto',
    });
    const finalContent = await runner.finalContent();
    this.logger.debug(`AI response: ${finalContent}`);
    return finalContent;
  }

  async analyzeContent(
    apiKey: string,
    prompt: string,
    content: string,
  ): Promise<string> {
    try {
      this.logger.debug(`Try to get AI response for: ${prompt}: ${content}`);
      const message = await this.openAiService.createChatCompletion(
        apiKey,
        `${prompt}: ${content}`,
        'gpt-3.5-turbo',
        500,
      );

      this.logger.debug('AI response: ', message);
    } catch (error) {
      this.logger.error('Error analyzing content', error);
      throw error;
    }
    return 'Cant get AI response';
  }
}
