/**
 * 用例执行器服务
 *
 * @description 执行应用层的用例，支持CQRS模式
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { IsolationContext } from '../../types/isolation.types.js';
import type { ICacheService } from '../../interfaces/cache-service.interface.js';

/**
 * 用例接口
 */
export interface UseCase {
  /** 用例ID */
  id: string;
  /** 用例名称 */
  name: string;
  /** 用例类型 */
  type: 'COMMAND' | 'QUERY';
  /** 输入数据 */
  input: Record<string, any>;
  /** 输出数据 */
  output?: any;
  /** 时间戳 */
  timestamp: Date;
  /** 用户ID */
  userId?: string;
  /** 租户ID */
  tenantId?: string;
}

/**
 * 用例执行结果
 */
export interface UseCaseResult<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 返回数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 执行时间(毫秒) */
  executionTime: number;
  /** 用例ID */
  useCaseId: string;
  /** 步骤执行详情 */
  steps?: UseCaseStep[];
}

/**
 * 用例执行步骤
 */
export interface UseCaseStep {
  /** 步骤名称 */
  name: string;
  /** 步骤类型 */
  type: 'VALIDATION' | 'BUSINESS_LOGIC' | 'PERSISTENCE' | 'NOTIFICATION';
  /** 是否成功 */
  success: boolean;
  /** 执行时间(毫秒) */
  executionTime: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 用例执行器接口
 */
export interface UseCaseExecutor<TUseCase extends UseCase = UseCase, TResult = any> {
  /** 执行用例 */
  execute(useCase: TUseCase): Promise<UseCaseResult<TResult>>;
  /** 验证用例 */
  validate(useCase: TUseCase): Promise<boolean>;
  /** 获取执行器名称 */
  getExecutorName(): string;
}

/**
 * 用例执行器服务
 */
@Injectable()
export class UseCaseExecutorService {
  private executors = new Map<string, UseCaseExecutor>();
  private executionHistory: UseCaseResult[] = [];
  private maxHistorySize = 1000;

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly isolationContext?: IsolationContext
  ) {}

  /**
   * 注册用例执行器
   */
  registerExecutor(
    useCaseName: string,
    executor: UseCaseExecutor
  ): void {
    this.executors.set(useCaseName, executor);
  }

  /**
   * 执行用例
   */
  async executeUseCase<T = any>(useCase: UseCase): Promise<UseCaseResult<T>> {
    const startTime = Date.now();
    const steps: UseCaseStep[] = [];
    
    try {
      // 应用隔离上下文
      const isolatedUseCase = this.applyIsolationContext(useCase);
      
      // 获取执行器
      const executor = this.executors.get(useCase.name);
      if (!executor) {
        throw new Error(`未找到用例执行器: ${useCase.name}`);
      }

      // 验证用例
      const validationStart = Date.now();
      const isValid = await executor.validate(isolatedUseCase);
      const validationTime = Date.now() - validationStart;
      
      steps.push({
        name: '用例验证',
        type: 'VALIDATION',
        success: isValid,
        executionTime: validationTime
      });

      if (!isValid) {
        throw new Error(`用例验证失败: ${useCase.name}`);
      }

      // 执行用例
      const executionStart = Date.now();
      const result = await executor.execute(isolatedUseCase);
      const executionTime = Date.now() - executionStart;
      
      steps.push({
        name: '用例执行',
        type: 'BUSINESS_LOGIC',
        success: result.success,
        executionTime: executionTime
      });

      // 更新执行时间
      result.executionTime = Date.now() - startTime;
      result.useCaseId = useCase.id;
      result.steps = steps;

      // 记录执行历史
      this.recordExecutionHistory(result);

      // 记录用例执行日志
      await this.logUseCaseExecution(useCase, result);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const result: UseCaseResult<T> = {
        success: false,
        error: error instanceof Error ? error.message : '用例执行失败',
        executionTime,
        useCaseId: useCase.id,
        steps
      };

      // 记录执行历史
      this.recordExecutionHistory(result);

      return result;
    }
  }

  /**
   * 批量执行用例
   */
  async executeUseCases(useCases: UseCase[]): Promise<UseCaseResult[]> {
    const results: UseCaseResult[] = [];
    
    for (const useCase of useCases) {
      try {
        const result = await this.executeUseCase(useCase);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '用例执行失败',
          executionTime: 0,
          useCaseId: useCase.id
        });
      }
    }
    
    return results;
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(limit?: number): UseCaseResult[] {
    const history = this.executionHistory.slice();
    return limit ? history.slice(-limit) : history;
  }

  /**
   * 获取执行统计信息
   */
  getExecutionStats(): Record<string, any> {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(r => r.success).length;
    const failed = total - successful;
    
    const averageExecutionTime = this.executionHistory.length > 0
      ? this.executionHistory.reduce((sum, r) => sum + r.executionTime, 0) / this.executionHistory.length
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? successful / total : 0,
      averageExecutionTime
    };
  }

  /**
   * 获取注册的执行器
   */
  getRegisteredExecutors(): string[] {
    return Array.from(this.executors.keys());
  }

  /**
   * 移除用例执行器
   */
  removeExecutor(useCaseName: string): void {
    this.executors.delete(useCaseName);
  }

  /**
   * 清空执行历史
   */
  clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  /**
   * 应用隔离上下文
   */
  private applyIsolationContext(useCase: UseCase): UseCase {
    if (!this.isolationContext) {
      return useCase;
    }

    const isolatedUseCase = { ...useCase };
    
    if (this.isolationContext.tenantId) {
      isolatedUseCase.tenantId = this.isolationContext.tenantId;
    }
    
    if (this.isolationContext.userId) {
      isolatedUseCase.userId = this.isolationContext.userId;
    }

    // 添加隔离信息到输入数据
    if (!isolatedUseCase.input) {
      isolatedUseCase.input = {};
    }
    
    if (this.isolationContext.tenantId) {
      isolatedUseCase.input.tenantId = this.isolationContext.tenantId;
    }
    
    if (this.isolationContext.organizationId) {
      isolatedUseCase.input.organizationId = this.isolationContext.organizationId;
    }
    
    if (this.isolationContext.departmentId) {
      isolatedUseCase.input.departmentId = this.isolationContext.departmentId;
    }
    
    if (this.isolationContext.userId) {
      isolatedUseCase.input.userId = this.isolationContext.userId;
    }

    return isolatedUseCase;
  }

  /**
   * 记录执行历史
   */
  private recordExecutionHistory(result: UseCaseResult): void {
    this.executionHistory.push(result);
    
    // 限制历史记录大小
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 记录用例执行日志
   */
  private async logUseCaseExecution(
    useCase: UseCase,
    result: UseCaseResult
  ): Promise<void> {
    try {
      const logData = {
        useCaseId: useCase.id,
        useCaseName: useCase.name,
        useCaseType: useCase.type,
        success: result.success,
        executionTime: result.executionTime,
        timestamp: new Date(),
        userId: useCase.userId,
        tenantId: useCase.tenantId,
        steps: result.steps
      };

      // 这里应该记录到日志系统
      console.log('用例执行日志:', logData);
    } catch (error) {
      console.error('记录用例执行日志失败:', error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (error) {
      return false;
    }
  }
}
