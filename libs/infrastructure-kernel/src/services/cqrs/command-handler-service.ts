/**
 * 命令处理器服务
 *
 * @description 处理CQRS模式中的命令操作
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";

/**
 * 命令接口
 */
export interface Command {
  /** 命令ID */
  id: string;
  /** 命令类型 */
  type: string;
  /** 命令数据 */
  data: Record<string, unknown>;
  /** 时间戳 */
  timestamp: Date;
  /** 用户ID */
  userId?: string;
  /** 租户ID */
  tenantId?: string;
}

/**
 * 命令处理结果
 */
export interface CommandResult {
  /** 是否成功 */
  success: boolean;
  /** 返回数据 */
  data?: unknown;
  /** 错误信息 */
  _error?: string;
  /** 执行时间(毫秒) */
  executionTime: number;
  /** 命令ID */
  commandId: string;
}

/**
 * 命令处理器接口
 */
export interface CommandHandler<TCommand extends Command = Command> {
  /** 处理命令 */
  handle(command: TCommand): Promise<CommandResult>;
  /** 验证命令 */
  validate(command: TCommand): Promise<boolean>;
  /** 获取处理器名称 */
  getHandlerName(): string;
}

/**
 * 命令处理器服务
 */
@Injectable()
export class CommandHandlerService {
  private handlers = new Map<string, CommandHandler>();
  private commandQueue: Command[] = [];
  private isProcessing = false;

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 注册命令处理器
   */
  registerHandler(commandType: string, handler: CommandHandler): void {
    this.handlers.set(commandType, handler);
  }

  /**
   * 处理命令
   */
  async handleCommand(command: Command): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      // 应用隔离上下文
      const isolatedCommand = this.applyIsolationContext(command);

      // 获取处理器
      const handler = this.handlers.get(command.type);
      if (!handler) {
        throw new Error(`未找到命令处理器: ${command.type}`);
      }

      // 验证命令
      const isValid = await handler.validate(isolatedCommand);
      if (!isValid) {
        throw new Error(`命令验证失败: ${command.type}`);
      }

      // 执行命令
      const result = await handler.handle(isolatedCommand);

      // 更新执行时间
      result.executionTime = Date.now() - startTime;
      result.commandId = command.id;

      // 记录命令执行日志
      await this.logCommandExecution(command, result);

      return result;
    } catch (_error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        _error: _error instanceof Error ? _error.message : "命令处理失败",
        executionTime,
        commandId: command.id,
      };
    }
  }

  /**
   * 批量处理命令
   */
  async handleCommands(commands: Command[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      try {
        const result = await this.handleCommand(command);
        results.push(result);
      } catch (_error) {
        results.push({
          success: false,
          _error: _error instanceof Error ? _error.message : "命令处理失败",
          executionTime: 0,
          commandId: command.id,
        });
      }
    }

    return results;
  }

  /**
   * 异步处理命令
   */
  async queueCommand(command: Command): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedCommand = this.applyIsolationContext(command);

      this.commandQueue.push(isolatedCommand);

      // 如果当前没有在处理，启动处理
      if (!this.isProcessing) {
        this.processCommandQueue();
      }
    } catch (_error) {
      throw new Error(
        `队列命令失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 处理命令队列
   */
  private async processCommandQueue(): Promise<void> {
    if (this.isProcessing || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.commandQueue.length > 0) {
        const command = this.commandQueue.shift();
        if (command) {
          await this.handleCommand(command);
        }
      }
    } catch (_error) {
      console.error("处理命令队列失败:", _error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 获取命令队列状态
   */
  getQueueStatus(): Record<string, unknown> {
    return {
      queueLength: this.commandQueue.length,
      isProcessing: this.isProcessing,
      registeredHandlers: Array.from(this.handlers.keys()),
    };
  }

  /**
   * 清空命令队列
   */
  clearQueue(): void {
    this.commandQueue = [];
  }

  /**
   * 获取注册的处理器
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 移除命令处理器
   */
  removeHandler(commandType: string): void {
    this.handlers.delete(commandType);
  }

  /**
   * 应用隔离上下文
   */
  private applyIsolationContext(command: Command): Command {
    if (!this.isolationContext) {
      return command;
    }

    const isolatedCommand = { ...command };

    if (this.isolationContext.tenantId) {
      isolatedCommand.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.userId) {
      isolatedCommand.userId = this.isolationContext.userId;
    }

    return isolatedCommand;
  }

  /**
   * 记录命令执行日志
   */
  private async logCommandExecution(
    command: Command,
    result: CommandResult,
  ): Promise<void> {
    try {
      const logData = {
        commandId: command.id,
        commandType: command.type,
        success: result.success,
        executionTime: result.executionTime,
        timestamp: new Date(),
        userId: command.userId,
        tenantId: command.tenantId,
      };

      // 这里应该记录到日志系统
      console.log("命令执行日志:", logData);
    } catch (_error) {
      console.error("记录命令执行日志失败:", _error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (_error) {
      return false;
    }
  }
}
