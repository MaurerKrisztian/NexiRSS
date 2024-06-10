import { Type } from '@nestjs/common';
import { ITool } from '../tools/interfaces/tool.interface';

export const TOOL_PROVIDER_METADATA = 'tool:provider';

export const Tool = () => {
  return (target: Type<ITool>): void => {
    Reflect.defineMetadata(TOOL_PROVIDER_METADATA, {}, target.prototype);
  };
};
