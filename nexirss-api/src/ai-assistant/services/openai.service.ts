import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import * as ChatAPI from 'openai/src/resources/chat/chat';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  async createChatCompletion(
    apiKey: string,
    prompt: string,
    model: (string & {}) | ChatAPI.ChatModel = 'gpt-3.5-turbo',
    maxTokens = 5000,
  ): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Error creating chat completion', error);
      throw error;
    }
  }
}
