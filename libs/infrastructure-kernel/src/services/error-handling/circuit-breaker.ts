/**
 * 熔断器服务
 *
 * @description 实现熔断器模式，防止级联故障
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { ILoggingService } from "../../interfaces/logging-service.interface.js";
import type { LogContext } from "../../types/logging.types.js";

/**
 * 熔断器状态
 */
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * 熔断器配置
 */
export interface CircuitBreakerConfig {
  /** 失败阈值 */
  failureThreshold: number;
  /** 恢复超时时间(毫秒) */
  recoveryTimeout: number;
  /** 请求超时时间(毫秒) */
  requestTimeout: number;
  /** 监控时间窗口(毫秒) */
  monitoringWindow: number;
  /** 最小请求数 */
  minimumRequests: number;
}

/**
 * 熔断器统计信息
 */
export interface CircuitBreakerStats {
  /** 总请求数 */
  totalRequests: number;
  /** 成功请求数 */
  successfulRequests: number;
  /** 失败请求数 */
  failedRequests: number;
  /** 熔断次数 */
  circuitBreaks: number;
  /** 当前状态 */
  currentState: CircuitBreakerState;
  /** 最后状态变更时间 */
  lastStateChange: Date;
  /** 成功率 */
  successRate: number;
}

/**
 * 熔断器服务
 */
@Injectable()
export class CircuitBreakerService {
  private circuits = new Map<
    string,
    {
      state: CircuitBreakerState;
      failureCount: number;
      lastFailureTime: Date | null;
      stats: CircuitBreakerStats;
      config: CircuitBreakerConfig;
    }
  >();

  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    requestTimeout: 5000,
    monitoringWindow: 60000,
    minimumRequests: 10,
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService,
  ) {}

  /**
   * 执行受保护的操作
   */
  async execute<T>(
    circuitName: string,
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): Promise<T> {
    try {
      // 获取或创建熔断器
      const circuit = this.getOrCreateCircuit(circuitName, config);

      // 检查熔断器状态
      if (circuit.state === "OPEN") {
        if (this.shouldAttemptRecovery(circuit)) {
          circuit.state = "HALF_OPEN";
          circuit.lastFailureTime = null;
        } else {
          throw new Error(`熔断器 ${circuitName} 处于开启状态`);
        }
      }

      // 执行操作
      const startTime = Date.now();
      const result = await this.executeWithTimeout(
        operation,
        circuit.config.requestTimeout,
      );
      const executionTime = Date.now() - startTime;

      // 记录成功
      this.recordSuccess(circuit);

      // 如果处于半开状态，关闭熔断器
      if (circuit.state === "HALF_OPEN") {
        circuit.state = "CLOSED";
        circuit.failureCount = 0;
      }

      // 记录执行日志
      await this.logExecution(circuitName, "SUCCESS", executionTime);

      return result;
    } catch (_error) {
      // 记录失败
      const circuit = this.getOrCreateCircuit(circuitName, config);
      this.recordFailure(circuit);

      // 记录失败日志
      await this.logExecution(circuitName, "FAILURE", 0, _error);

      throw _error;
    }
  }

  /**
   * 获取熔断器状态
   */
  getCircuitState(circuitName: string): CircuitBreakerState | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? circuit.state : null;
  }

  /**
   * 获取熔断器统计信息
   */
  getCircuitStats(circuitName: string): CircuitBreakerStats | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? { ...circuit.stats } : null;
  }

  /**
   * 获取所有熔断器统计信息
   */
  getAllCircuitStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};

    for (const [name, circuit] of this.circuits.entries()) {
      stats[name] = { ...circuit.stats };
    }

    return stats;
  }

  /**
   * 重置熔断器
   */
  resetCircuit(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.state = "CLOSED";
      circuit.failureCount = 0;
      circuit.lastFailureTime = null;
      circuit.stats = this.createInitialStats();
    }
  }

  /**
   * 关闭熔断器
   */
  closeCircuit(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.state = "CLOSED";
      circuit.failureCount = 0;
      circuit.lastFailureTime = null;
    }
  }

  /**
   * 打开熔断器
   */
  openCircuit(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.state = "OPEN";
      circuit.lastFailureTime = new Date();
    }
  }

  /**
   * 设置熔断器配置
   */
  setCircuitConfig(
    circuitName: string,
    config: Partial<CircuitBreakerConfig>,
  ): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.config = { ...circuit.config, ...config };
    }
  }

  /**
   * 获取熔断器配置
   */
  getCircuitConfig(circuitName: string): CircuitBreakerConfig | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? { ...circuit.config } : null;
  }

  /**
   * 删除熔断器
   */
  removeCircuit(circuitName: string): void {
    this.circuits.delete(circuitName);
  }

  /**
   * 获取或创建熔断器
   */
  private getOrCreateCircuit(
    circuitName: string,
    config?: Partial<CircuitBreakerConfig>,
  ): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: Date | null;
    stats: CircuitBreakerStats;
    config: CircuitBreakerConfig;
  } {
    let circuit = this.circuits.get(circuitName);

    if (!circuit) {
      circuit = {
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: null,
        stats: this.createInitialStats(),
        config: { ...this.defaultConfig, ...config },
      };
      this.circuits.set(circuitName, circuit);
    }

    return circuit;
  }

  /**
   * 检查是否应该尝试恢复
   */
  private shouldAttemptRecovery(circuit: {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: Date | null;
    stats: CircuitBreakerStats;
    config: CircuitBreakerConfig;
  }): boolean {
    if (circuit.state !== "OPEN") {
      return false;
    }

    if (!circuit.lastFailureTime) {
      return true;
    }

    const timeSinceLastFailure = Date.now() - circuit.lastFailureTime.getTime();
    return timeSinceLastFailure >= circuit.config.recoveryTimeout;
  }

  /**
   * 执行带超时的操作
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("操作超时"));
      }, timeout);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((_error) => {
          clearTimeout(timer);
          reject(_error);
        });
    });
  }

  /**
   * 记录成功
   */
  private recordSuccess(circuit: {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: Date | null;
    stats: CircuitBreakerStats;
    config: CircuitBreakerConfig;
  }): void {
    circuit.stats.totalRequests++;
    circuit.stats.successfulRequests++;
    circuit.stats.successRate =
      circuit.stats.successfulRequests / circuit.stats.totalRequests;

    // 如果处于半开状态，关闭熔断器
    if (circuit.state === "HALF_OPEN") {
      circuit.state = "CLOSED";
      circuit.failureCount = 0;
    }
  }

  /**
   * 记录失败
   */
  private recordFailure(circuit: {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: Date | null;
    stats: CircuitBreakerStats;
    config: CircuitBreakerConfig;
  }): void {
    circuit.stats.totalRequests++;
    circuit.stats.failedRequests++;
    circuit.failureCount++;
    circuit.lastFailureTime = new Date();
    circuit.stats.successRate =
      circuit.stats.successfulRequests / circuit.stats.totalRequests;

    // 检查是否应该打开熔断器
    if (this.shouldOpenCircuit(circuit)) {
      circuit.state = "OPEN";
      circuit.stats.circuitBreaks++;
      circuit.stats.lastStateChange = new Date();
    }
  }

  /**
   * 检查是否应该打开熔断器
   */
  private shouldOpenCircuit(circuit: {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: Date | null;
    stats: CircuitBreakerStats;
    config: CircuitBreakerConfig;
  }): boolean {
    // 检查最小请求数
    if (circuit.stats.totalRequests < circuit.config.minimumRequests) {
      return false;
    }

    // 检查失败阈值
    if (circuit.failureCount >= circuit.config.failureThreshold) {
      return true;
    }

    // 检查时间窗口内的失败率
    const timeWindow = circuit.config.monitoringWindow;
    const now = Date.now();
    const _windowStart = now - timeWindow;

    // 这里应该实现更复杂的时间窗口统计
    // 暂时使用简单的失败率检查
    const failureRate =
      circuit.stats.failedRequests / circuit.stats.totalRequests;
    return failureRate > 0.5; // 50%失败率阈值
  }

  /**
   * 创建初始统计信息
   */
  private createInitialStats(): CircuitBreakerStats {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitBreaks: 0,
      currentState: "CLOSED",
      lastStateChange: new Date(),
      successRate: 0,
    };
  }

  /**
   * 记录执行日志
   */
  private async logExecution(
    circuitName: string,
    result: "SUCCESS" | "FAILURE",
    executionTime: number,
    _error?: Error,
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `circuit_${circuitName}_${Date.now()}`,
          tenantId: "system",
          operation: "circuit-breaker",
          resource: "circuit-breaker",
          timestamp: new Date(),
          level: result === "SUCCESS" ? "info" : ("warn" as const),
          message: `熔断器 ${circuitName}: ${result}`,
        };

        if (result === "SUCCESS") {
          await this.loggingService.info(
            logContext as LogContext,
            `熔断器 ${circuitName}: ${result}`,
            {
              executionTime,
              result,
            },
          );
        } else {
          await this.loggingService.warn(
            logContext as LogContext,
            `熔断器 ${circuitName}: ${result}`,
            {
              executionTime,
              result,
              _error: _error?.message,
            },
          );
        }
      }
    } catch (_error) {
      console.error("记录熔断器执行日志失败:", _error);
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
