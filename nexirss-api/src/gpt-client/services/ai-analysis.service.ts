import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { OnEvent } from '@nestjs/event-emitter';
import { RssItem } from '../../rss-feed/schemas/rss-item.schema';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  constructor(private readonly openAiService: OpenAiService) {}

  @OnEvent('rss.item.new')
  analyzeNewFeedItem(item: RssItem) {
    this.logger.debug(`analyze new item: ${item.feed}:${item.title}`);
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
