import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ITool } from '../tools/interfaces/tool.interface';
import { DebugEvent } from './debug.event';

@Injectable()
export class ToolUtils {
  logger = new Logger();
  constructor(private readonly eventEmitter: EventEmitter2) {}

  getToolFn(userId: string, ctx: ITool, context: any) {
    return async (o) => {
      this.eventEmitter.emit(
        DebugEvent.name,
        new DebugEvent(
          `Call tool: ${ctx.constructor.name} with params: ${JSON.stringify(
            o,
          )}`,
          ctx.constructor.name,
        ),
      );
      try {
        const res = await ctx.callback(userId, o, context);
        this.eventEmitter.emit(
          DebugEvent.name,
          new DebugEvent(
            `tool ${ctx.constructor.name} result: ${JSON.stringify(res)}`,
            ctx.constructor.name,
          ),
        );
        return res;
      } catch (err) {
        const message = `[ERROR] error while executing ${ctx.constructor.name} tool: ${err.message}`;
        this.eventEmitter.emit(
          DebugEvent.name,
          new DebugEvent(message, ctx.constructor.name),
        );
        return message;
      }
    };
  }
}
