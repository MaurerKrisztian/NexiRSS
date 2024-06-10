import { ITool, ToolSchema } from './interfaces/tool.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ToolUtils } from '../utils/tool-utils';
import { Tool } from '../decorators/tool.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { RssItem } from '../../../../rss-feed/schemas/rss-item.schema';
import { Model } from 'mongoose';

@Tool()
@Injectable()
export class LabelTool implements ITool {
  private readonly logger = new Logger(LabelTool.name);
  constructor(
    private readonly toolUtils: ToolUtils,
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
  ) {}

  async callback(
    userId: string,
    options: { labels: string[]; summary: string },
    ctx: { itemId: string },
  ): Promise<any> {
    this.logger.log(
      `tool called with ${JSON.stringify(
        options,
        null,
        2,
      )}   ... user: ${userId}, ctx: ${JSON.stringify(ctx, null, 2)}`,
    );
    await this.rssItemModel.updateOne(
      { _id: ctx.itemId },
      { $set: { labels: options.labels, summary: options.summary } },
    );
    return `Added label: ${options.labels.join(',')} and summary: ${
      options.summary
    }`;
  }

  async getSchema(userId: string, itemId: string): Promise<ToolSchema> {
    return {
      type: 'function',
      function: {
        name: 'set_label_',
        description: 'Set your summary to an article',
        function: this.toolUtils.getToolFn(userId, this, { itemId }),
        parse: JSON.parse,
        parameters: {
          type: 'object',
          properties: {
            labels: {
              type: 'array',
              maxItems: 3,
              items: {
                type: 'string',
              },
              description:
                'this is the article label names based on the content',
            },
            summary: {
              type: 'string',
              description: 'this is the content summary',
            },
          },
        },
      },
    };
  }
}
