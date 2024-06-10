import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OpenAiService } from '../services/openai.service';
import { AiAnalysisService } from '../services/ai-analysis.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { User } from '../../user/models/user.schema';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Get('generate-summary')
  @UseGuards(JwtAuthGuard)
  async label(
    @Query('prompt') prompt: string,
    @Query('maxTokens') maxTokens: string,
    @Query('item') itemId: string,
    @AuthUser() user: User,
  ) {
    return this.aiAnalysisService.generateSummaryAndLabelsToItem(user, itemId);
  }

  @Get('chat')
  async chat(
    @Query('apiKey') apiKey: string,
    @Query('prompt') prompt: string,
    @Query('maxTokens') maxTokens: string,
  ) {
    const maxTokensNumber = parseInt(maxTokens || '2000', 10);
    return this.openAiService.createChatCompletion(
      apiKey,
      prompt,
      'gpt-3.5-turbo',
      maxTokensNumber,
    );
  }
}
