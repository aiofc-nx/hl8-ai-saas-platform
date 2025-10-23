/**
 * 事务边界验证器
 *
 * 提供事务边界验证的专用工具
 * 支持事务状态检查、边界违规检测和事务完整性验证
 *
 * @since 1.0.0
 */
import { ITransactionManager } from "./transaction-manager.interface.js";

/**
 * 事务边界验证结果
 */
export interface TransactionBoundaryValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 验证错误列表
   */
  errors: string[];

  /**
   * 验证警告列表
   */
  warnings: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];

  /**
   * 事务状态
   */
  transactionState: {
    isActive: boolean;
    isReadOnly: boolean;
    isolationLevel?: string;
  };
}

/**
 * 事务边界验证器
 *
 * 提供事务边界验证的专用工具
 */
export class TransactionBoundaryValidator {
  /**
   * 验证事务边界
   *
   * @param transactionManager - 事务管理器
   * @param operation - 操作名称
   * @returns 验证结果
   */
  static validateTransactionBoundary(
    transactionManager: ITransactionManager,
    operation: string,
  ): TransactionBoundaryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查事务状态
    const isActive = transactionManager.isActive();

    if (!isActive) {
      errors.push(`操作 ${operation} 需要在活跃事务中执行`);
      suggestions.push("在操作前调用 transactionManager.begin()");
    }

    // 检查事务管理器状态
    const managerValidation =
      this.validateTransactionManager(transactionManager);
    errors.push(...managerValidation.errors);
    warnings.push(...managerValidation.warnings);
    suggestions.push(...managerValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      transactionState: {
        isActive,
        isReadOnly: false, // 这里需要根据实际实现获取
        isolationLevel: undefined, // 这里需要根据实际实现获取
      },
    };
  }

  /**
   * 验证事务开始
   *
   * @param transactionManager - 事务管理器
   * @returns 验证结果
   */
  static validateTransactionBegin(
    transactionManager: ITransactionManager,
  ): TransactionBoundaryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查是否已有活跃事务
    if (transactionManager.isActive()) {
      warnings.push("已有活跃事务，嵌套事务可能不被支持");
      suggestions.push("考虑使用嵌套事务或等待当前事务完成");
    }

    // 验证事务管理器
    const managerValidation =
      this.validateTransactionManager(transactionManager);
    errors.push(...managerValidation.errors);
    warnings.push(...managerValidation.warnings);
    suggestions.push(...managerValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      transactionState: {
        isActive: transactionManager.isActive(),
        isReadOnly: false,
        isolationLevel: undefined,
      },
    };
  }

  /**
   * 验证事务提交
   *
   * @param transactionManager - 事务管理器
   * @returns 验证结果
   */
  static validateTransactionCommit(
    transactionManager: ITransactionManager,
  ): TransactionBoundaryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查是否有活跃事务
    if (!transactionManager.isActive()) {
      errors.push("没有活跃事务可以提交");
      suggestions.push("在提交前确保事务已开始");
    }

    // 验证事务管理器
    const managerValidation =
      this.validateTransactionManager(transactionManager);
    errors.push(...managerValidation.errors);
    warnings.push(...managerValidation.warnings);
    suggestions.push(...managerValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      transactionState: {
        isActive: transactionManager.isActive(),
        isReadOnly: false,
        isolationLevel: undefined,
      },
    };
  }

  /**
   * 验证事务回滚
   *
   * @param transactionManager - 事务管理器
   * @returns 验证结果
   */
  static validateTransactionRollback(
    transactionManager: ITransactionManager,
  ): TransactionBoundaryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查是否有活跃事务
    if (!transactionManager.isActive()) {
      warnings.push("没有活跃事务可以回滚");
      suggestions.push("在回滚前确保事务已开始");
    }

    // 验证事务管理器
    const managerValidation =
      this.validateTransactionManager(transactionManager);
    errors.push(...managerValidation.errors);
    warnings.push(...managerValidation.warnings);
    suggestions.push(...managerValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      transactionState: {
        isActive: transactionManager.isActive(),
        isReadOnly: false,
        isolationLevel: undefined,
      },
    };
  }

  /**
   * 验证事务管理器
   *
   * @param transactionManager - 事务管理器
   * @returns 验证结果
   */
  private static validateTransactionManager(
    transactionManager: ITransactionManager,
  ): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查事务管理器方法
    const requiredMethods = ["begin", "commit", "rollback", "isActive"];
    for (const method of requiredMethods) {
      // 必须使用 any 类型：需要动态访问事务管理器的方法，无法预先确定具体的方法签名
      // 这是事务管理器验证的核心需求，用于检查必需的方法是否存在
      if (typeof (transactionManager as any)[method] !== "function") {
        errors.push(`事务管理器缺少必需方法: ${method}`);
        suggestions.push(`实现 ${method} 方法`);
      }
    }

    // 检查事务管理器状态
    try {
      const isActive = transactionManager.isActive();
      if (typeof isActive !== "boolean") {
        errors.push("isActive() 方法必须返回布尔值");
        suggestions.push("确保 isActive() 方法返回 boolean 类型");
      }
    } catch (_error) {
      errors.push("无法检查事务状态");
      suggestions.push("确保 isActive() 方法正常工作");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证事务完整性
   *
   * @param transactionManager - 事务管理器
   * @param operations - 操作列表
   * @returns 验证结果
   */
  static validateTransactionIntegrity(
    transactionManager: ITransactionManager,
    operations: string[],
  ): TransactionBoundaryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查操作顺序
    const beginCount = operations.filter((op) => op === "begin").length;
    const commitCount = operations.filter((op) => op === "commit").length;
    const rollbackCount = operations.filter((op) => op === "rollback").length;

    if (beginCount === 0) {
      errors.push("事务操作序列中没有开始事务");
      suggestions.push("在操作序列开始时调用 begin()");
    }

    if (beginCount > 1) {
      warnings.push("事务操作序列中有多个开始事务");
      suggestions.push("确保每个事务只开始一次");
    }

    if (commitCount === 0 && rollbackCount === 0) {
      warnings.push("事务操作序列中没有提交或回滚");
      suggestions.push("确保事务有明确的结束操作");
    }

    if (commitCount > 0 && rollbackCount > 0) {
      errors.push("事务操作序列中同时包含提交和回滚");
      suggestions.push("确保事务要么提交要么回滚，不能同时进行");
    }

    // 检查当前事务状态
    const currentState = transactionManager.isActive();
    if (currentState && operations.length > 0) {
      const lastOperation = operations[operations.length - 1];
      if (lastOperation === "commit" || lastOperation === "rollback") {
        warnings.push("事务已结束但状态仍为活跃");
        suggestions.push("检查事务管理器的状态管理");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      transactionState: {
        isActive: transactionManager.isActive(),
        isReadOnly: false,
        isolationLevel: undefined,
      },
    };
  }
}
