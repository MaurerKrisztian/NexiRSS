import { Injectable } from '@nestjs/common';
import { ITool } from '../tools/interfaces/tool.interface';

@Injectable()
export class ToolProvider {
  private readonly tools: ITool[] = [];

  registerToolProvider(provider: ITool): this {
    this.tools.push(provider);
    return this;
  }

  getTools(): ITool[] {
    return this.tools;
  }
}
