import { Logger, Module, Type } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';
import { AiAnalysisService } from './services/ai-analysis.service';
import { AiAssistantController } from './controllers/ai-assistant.controller';
import { ITool } from './services/fn-call/tools/interfaces/tool.interface';
import { LabelTool } from './services/fn-call/tools/label.tool';
import { ToolUtils } from './services/fn-call/utils/tool-utils';
import { ToolProvider } from './services/fn-call/explorer/tool.provider';
import { RssFeedModule } from '../rss-feed/rss-feed.module';
import { TOOL_PROVIDER_METADATA } from './services/fn-call/decorators/tool.decorator';
import { Explorer } from './services/fn-call/explorer/explorer';
import { DiscoveryService } from '@nestjs/core';
import { UserTriggerAiService } from './services/user-trigger-ai.service';
import { HighlightItemTool } from './services/fn-call/tools/highlight-item.tool';

const tools: Type<ITool>[] = [LabelTool, HighlightItemTool];
@Module({
  imports: [RssFeedModule],
  providers: [
    ...tools,
    OpenAiService,
    AiAnalysisService,
    ToolUtils,
    ToolProvider,
    Explorer,
    DiscoveryService,
    UserTriggerAiService,
  ],
  controllers: [AiAssistantController],
  exports: [OpenAiService, AiAnalysisService],
})
export class OpenAiModule {
  private readonly logger = new Logger(OpenAiModule.name);
  constructor(
    private readonly serviceExplorer: Explorer,
    private readonly toolProvider: ToolProvider,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    const providers = await this.serviceExplorer.exploreProviders<ITool>(
      TOOL_PROVIDER_METADATA,
    );
    this.logger.debug(
      `Register ${providers.length} tool provider: ${providers.map(
        (p) => ` ${p.constructor.name}`,
      )}`,
    );
    providers.forEach((provider) =>
      this.toolProvider.registerToolProvider(provider),
    );
  }
}
