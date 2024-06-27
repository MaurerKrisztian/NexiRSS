import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../../rss-feed/schemas/rss-item.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/models/user.schema';
import OpenAI from 'openai';
import * as striptags from 'striptags';
import { HighlightItemTool } from './fn-call/tools/highlight-item.tool';

@Injectable()
export class UserTriggerAiService {
  constructor(
    private readonly highlightItemTool: HighlightItemTool,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  private readonly logger = new Logger(UserTriggerAiService.name);

  @OnEvent('rss.item.new')
  async analyzeNewFeedItem(item: RssItem) {
    this.logger.debug(`analyze new item: ${item.feed}:${item.title}`);

    try {
      const usersWithAiTrigger = await this.userModel
        .find({
          feedSubscriptions: {
            $elemMatch: {
              feed: item.feed,
              enableAITrigger: true,
            },
          },
        })
        .exec();

      for (const user of usersWithAiTrigger) {
        this.logger.debug(`Found user with AI Trigger enabled: ${user.email}`);
        await this.runTriggerCheck(user, item);
      }
    } catch (error) {
      this.logger.error('Error finding users with AI Trigger enabled', error);
    }
  }

  async runTriggerCheck(user: User, item: RssItem) {
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
          content:
            'You are a helpful assistant highlighting  items what can be article podcast YouTube video etc. if the user trigger is applicable',
        },
        {
          role: 'user',
          content: `Highlight the item if the content meet the following criteria  ${user.aiAnalysisSettings
            .map((a) => a.prompt)
            .join(' or ')}
            
             The item content:
             ${striptags(item.title)} ${striptags(item.content)}`,
        },
      ],
      tools: [
        await this.highlightItemTool.getSchema(user._id, item._id as string),
      ],
      tool_choice: 'auto',
    });
    const finalContent = await runner.finalContent();
    this.logger.debug(`AI response: ${finalContent}`);
    return finalContent;
  }
}
