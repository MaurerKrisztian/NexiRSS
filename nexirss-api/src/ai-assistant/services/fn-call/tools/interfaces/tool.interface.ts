import {
  RunnableToolFunctionWithoutParse,
  RunnableToolFunctionWithParse,
} from 'openai/lib/RunnableFunction';

export type ToolSchema =
  | RunnableToolFunctionWithParse<any>
  | RunnableToolFunctionWithoutParse;
export interface ITool {
  callback(userId: string, options: any, context: any): any | Promise<any>;
  getSchema(userId: string, itemId: string): ToolSchema | Promise<ToolSchema>;
}
