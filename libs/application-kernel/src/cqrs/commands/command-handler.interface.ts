/**
 * 命令处理器接口
 *
 * 提供处理领域命令的统一接口
 * 支持命令验证、执行和错误处理
 *
 * @since 1.0.0
 */
import { BaseCommand } from "./base-command.js";

/**
 * 命令处理器接口
 *
 * 所有业务模块的命令处理器都应该实现此接口
 * 提供统一的命令处理模式
 *
 * @template TCommand - 命令类型
 * @template TResult - 命令结果类型
 */
export interface CommandHandler<
  TCommand extends BaseCommand = BaseCommand,
  TResult = void,
> {
  /**
   * 处理命令
   *
   * @param command - 要处理的命令
   * @returns 命令执行结果
   */
  handle(command: TCommand): Promise<TResult>;

  /**
   * 验证命令
   *
   * @param command - 要验证的命令
   * @throws {ApplicationLayerException} 如果命令无效则抛出应用层异常
   */
  validateCommand(command: TCommand): void;

  /**
   * 检查是否可以处理命令
   *
   * @param command - 要检查的命令
   * @returns 是否可以处理
   */
  canHandle(command: TCommand): boolean;

  /**
   * 获取处理器名称
   *
   * @returns 处理器名称
   */
  getHandlerName(): string;

  /**
   * 获取处理器优先级
   *
   * @returns 处理器优先级（数字越小优先级越高）
   */
  getPriority(): number;
}
