/**
 * 基础命令用例抽象类
 *
 * 扩展基础用例，提供事务管理和事件发布功能
 * 专门用于处理命令类型的用例
 *
 * @since 1.0.0
 */
import { BaseUseCase } from "./base-use-case.js";
import { IUseCaseContext } from "../context/use-case-context.interface.js";
import { IEventBus } from "../events/event-bus.interface.js";
import { ITransactionManager } from "../transactions/transaction-manager.interface.js";

/**
 * 基础命令用例抽象类
 *
 * 所有业务模块的命令用例都应该继承此类
 * 提供事务管理和事件发布功能
 *
 * @template TRequest - 请求类型
 * @template TResponse - 响应类型
 */
export abstract class BaseCommandUseCase<
  TRequest,
  TResponse,
> extends BaseUseCase<TRequest, TResponse> {
  /**
   * 事件总线
   */
  protected readonly eventBus?: IEventBus;

  /**
   * 事务管理器
   */
  protected readonly transactionManager?: ITransactionManager;

  /**
   * 构造函数
   *
   * @param useCaseName - 用例名称
   * @param useCaseDescription - 用例描述
   * @param useCaseVersion - 用例版本（可选，默认为 "1.0.0"）
   * @param requiredPermissions - 所需权限（可选）
   * @param eventBus - 事件总线（可选）
   * @param transactionManager - 事务管理器（可选）
   */
  constructor(
    useCaseName: string,
    useCaseDescription: string,
    useCaseVersion: string = "1.0.0",
    requiredPermissions: string[] = [],
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
  ) {
    super(useCaseName, useCaseDescription, useCaseVersion, requiredPermissions);
    this.eventBus = eventBus;
    this.transactionManager = transactionManager;
  }

  /**
   * 执行用例逻辑（重写父类方法）
   *
   * @param request - 请求对象
   * @param context - 用例执行上下文
   * @returns 用例执行结果
   */
  protected async executeUseCase(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse> {
    // 开始事务
    await this.beginTransaction();

    try {
      // 执行命令逻辑
      const result = await this.executeCommand(request, context);

      // 提交事务
      await this.commitTransaction();

      return result;
    } catch (error) {
      // 回滚事务
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * 执行命令逻辑（子类必须实现）
   *
   * @param request - 请求对象
   * @param context - 用例执行上下文
   * @returns 命令执行结果
   */
  protected abstract executeCommand(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse>;

  /**
   * 发布领域事件
   *
   * @param aggregateRoot - 聚合根对象
   */
  protected async publishDomainEvents(aggregateRoot: {
    getUncommittedEvents(): unknown[];
    markEventsAsCommitted(): void;
  }): Promise<void> {
    if (!this.eventBus) {
      return;
    }

    const events = aggregateRoot.getUncommittedEvents();
    if (events.length > 0) {
      // 必须使用 any 类型：事件总线需要处理任意类型的事件，无法预先确定具体的事件类型
      // 这是事件驱动架构的核心需求，用于发布聚合根产生的未提交事件
      await this.eventBus.publishAll(events as any[]);
      aggregateRoot.markEventsAsCommitted();
    }
  }

  /**
   * 开始事务
   */
  protected async beginTransaction(): Promise<void> {
    if (this.transactionManager) {
      await this.transactionManager.begin();
    }
  }

  /**
   * 提交事务
   */
  protected async commitTransaction(): Promise<void> {
    if (this.transactionManager) {
      await this.transactionManager.commit();
    }
  }

  /**
   * 回滚事务
   */
  protected async rollbackTransaction(): Promise<void> {
    if (this.transactionManager) {
      await this.transactionManager.rollback();
    }
  }
}
