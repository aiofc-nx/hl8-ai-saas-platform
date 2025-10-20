/**
 * 命令处理器接口
 * @description 定义命令处理的契约
 */
import { Command } from "./command.js";
import { DomainEvent } from "@repo/domain-kernel";

/**
 * 命令处理器接口
 * @template TCommand - 命令类型
 */
export interface CommandHandler<TCommand extends Command = Command> {
  /**
   * 处理命令
   * @param command - 命令
   * @returns 产生的领域事件
   */
  handle(command: TCommand): Promise<DomainEvent[]>;
}
