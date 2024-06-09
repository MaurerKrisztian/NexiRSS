import { Module } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';
import { OpenAiController } from './controllers/openai.controller';
import { AiAnalysisService } from './services/ai-analysis.service';

@Module({
  providers: [OpenAiService, AiAnalysisService],
  controllers: [OpenAiController],
  exports: [OpenAiService, AiAnalysisService],
})
export class OpenAiModule {}
