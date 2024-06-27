import { ITool, ToolSchema } from './interfaces/tool.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ToolUtils } from '../utils/tool-utils';
import { Tool } from '../decorators/tool.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { RssItem } from '../../../../rss-feed/schemas/rss-item.schema';
import { Model } from 'mongoose';
import { User } from '../../../../user/models/user.schema';

@Tool()
@Injectable()
export class HighlightItemTool implements ITool {
  private readonly logger = new Logger(HighlightItemTool.name);

  constructor(
    private readonly toolUtils: ToolUtils,
    @InjectModel(RssItem.name) private readonly rssItemModel: Model<RssItem>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async callback(
    userId: string,
    options: { highlight: string[] },
    ctx: { itemId: string },
  ): Promise<any> {
    this.logger.log(
      `tool called with ${JSON.stringify(
        options,
        null,
        2,
      )}   ... user: ${userId}, ctx: ${JSON.stringify(ctx, null, 2)}`,
    );

    if (options.highlight) {
      const updateResult = await this.userModel.updateOne(
        { _id: userId },
        { $push: { highlightedItems: { itemId: ctx.itemId } } },
      );
    }

    return `successfully set highlight to  ${options.highlight} in item ${ctx.itemId}`;
  }

  async getSchema(userId: string, itemId: string): Promise<ToolSchema> {
    return {
      type: 'function',
      function: {
        name: 'modify_item',
        description: 'highlight item based on content if needed',
        function: this.toolUtils.getToolFn(userId, this, { itemId }),
        parse: JSON.parse,
        parameters: {
          type: 'object',
          properties: {
            highlight: {
              type: 'boolean',
              description: 'set item highlight true or false',
            },
          },
        },
      },
    };
  }
}
